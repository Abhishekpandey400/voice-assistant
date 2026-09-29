using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using MinuteHire.Application.Common;
using MinuteHire.Application.Dtos.Ai;
using MinuteHire.Application.Dtos.Conversations;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Authorization;
using MinuteHire.Domain.Entities;
using MinuteHire.Domain.Enums;

namespace MinuteHire.Application.Services;

public sealed class ConversationService(
    IAppDbContext db,
    ICurrentUser currentUser,
    ILlmClient llm,
    ISpeechToText speech,
    IActivityLogger activity) : IConversationService
{
    private const int HistoryMessages = 12;
    private const int TitleLength = 60;

    public async Task<ConversationDto> StartAsync(StartConversationRequest request, CancellationToken ct)
    {
        AssistantPersona.For(currentUser.Role);

        var now = DateTime.UtcNow;
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            UserId = currentUser.UserId,
            Title = string.IsNullOrWhiteSpace(request.Title) ? Conversation.DefaultTitle : request.Title.Trim(),
            StartedAt = now,
            LastActivityAt = now
        };

        db.Conversations.Add(conversation);

        await activity.LogAsync(new ActivityLog
        {
            Action = ActivityAction.ConversationStarted,
            ConversationId = conversation.Id,
            RequestText = conversation.Title
        }, ct);

        return new ConversationDto(conversation.Id, conversation.Title, conversation.StartedAt, conversation.LastActivityAt, 0);
    }

    public async Task<IReadOnlyList<ConversationDto>> ListMineAsync(CancellationToken ct) =>
        await db.Conversations.AsNoTracking()
            .Where(c => c.UserId == currentUser.UserId)
            .OrderByDescending(c => c.LastActivityAt)
            .Take(50)
            .Select(c => new ConversationDto(c.Id, c.Title, c.StartedAt, c.LastActivityAt, c.Messages.Count))
            .ToListAsync(ct);

    public async Task<ConversationDetailDto> GetAsync(Guid conversationId, CancellationToken ct)
    {
        var conversation = await db.Conversations.AsNoTracking()
            .Include(c => c.User).ThenInclude(u => u.Role)
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt).ThenBy(m => m.Id))
            .SingleOrDefaultAsync(c => c.Id == conversationId, ct);

        if (conversation is null || (conversation.UserId != currentUser.UserId && !currentUser.HasPermission(Permissions.ConversationsReadAll)))
            throw new NotFoundException("Conversation not found.");

        return new ConversationDetailDto(
            conversation.Id,
            conversation.Title,
            conversation.UserId,
            conversation.User.FullName,
            conversation.User.Role.Name,
            conversation.StartedAt,
            conversation.LastActivityAt,
            conversation.Messages.Select(MessageDto.From).ToList());
    }

    public async Task<InteractionResultDto> SendTextAsync(Guid conversationId, string text, CancellationToken ct)
    {
        var conversation = await GetOwnedAsync(conversationId, ct);
        return await InteractAsync(conversation, InputMode.Text, _ => Task.FromResult(text), ct);
    }

    public async Task<InteractionResultDto> SendVoiceAsync(Guid conversationId, AudioInput audio, CancellationToken ct)
    {
        var conversation = await GetOwnedAsync(conversationId, ct);
        return await InteractAsync(conversation, InputMode.Voice, token => speech.TranscribeAsync(audio, token), ct);
    }

    private async Task<Conversation> GetOwnedAsync(Guid conversationId, CancellationToken ct) =>
        await db.Conversations.SingleOrDefaultAsync(c => c.Id == conversationId && c.UserId == currentUser.UserId, ct)
        ?? throw new NotFoundException("Conversation not found.");

    private async Task<InteractionResultDto> InteractAsync(
        Conversation conversation,
        InputMode mode,
        Func<CancellationToken, Task<string>> readPrompt,
        CancellationToken ct)
    {
        var systemPrompt = AssistantPersona.For(currentUser.Role);
        var receivedAt = DateTime.UtcNow;
        var stopwatch = Stopwatch.StartNew();
        string? prompt = null;

        try
        {
            prompt = NormalizePrompt(await readPrompt(ct), mode);

            var turns = await db.ConversationMessages.AsNoTracking()
                .Where(m => m.ConversationId == conversation.Id)
                .OrderByDescending(m => m.CreatedAt).ThenByDescending(m => m.Id)
                .Take(HistoryMessages)
                .Select(m => new ChatTurn(m.Sender == MessageSender.User, m.Content))
                .ToListAsync(ct);

            turns.Reverse();
            turns.Add(new ChatTurn(true, prompt));

            var reply = await llm.CompleteAsync(systemPrompt, turns, ct);

            return await SaveExchangeAsync(conversation, mode, prompt, reply, receivedAt, (int)stopwatch.ElapsedMilliseconds, ct);
        }
        catch (AppException ex) when (ex is AiUnavailableException or BadRequestException)
        {
            await activity.LogAsync(new ActivityLog
            {
                Action = ActivityAction.AiInteraction,
                IsSuccess = false,
                ConversationId = conversation.Id,
                InputMode = mode,
                RequestText = prompt,
                ErrorMessage = ex.Message,
                LatencyMs = (int)stopwatch.ElapsedMilliseconds
            }, ct);

            throw;
        }
    }

    private async Task<InteractionResultDto> SaveExchangeAsync(
        Conversation conversation,
        InputMode mode,
        string prompt,
        LlmReply reply,
        DateTime receivedAt,
        int latencyMs,
        CancellationToken ct)
    {
        var userMessage = new ConversationMessage
        {
            ConversationId = conversation.Id,
            Sender = MessageSender.User,
            Content = prompt,
            InputMode = mode,
            CreatedAt = receivedAt
        };

        var assistantMessage = new ConversationMessage
        {
            ConversationId = conversation.Id,
            Sender = MessageSender.Assistant,
            Content = reply.Content,
            InputMode = mode,
            CreatedAt = DateTime.UtcNow
        };

        db.ConversationMessages.AddRange(userMessage, assistantMessage);
        conversation.LastActivityAt = assistantMessage.CreatedAt;

        if (conversation.Title == Conversation.DefaultTitle)
            conversation.Title = prompt.Length <= TitleLength ? prompt : $"{prompt[..TitleLength].TrimEnd()}...";

        await activity.LogAsync(new ActivityLog
        {
            Action = ActivityAction.AiInteraction,
            ConversationId = conversation.Id,
            InputMode = mode,
            RequestText = prompt,
            ResponseText = reply.Content,
            Provider = reply.Provider,
            Model = reply.Model,
            LatencyMs = latencyMs
        }, ct);

        return new InteractionResultDto(MessageDto.From(userMessage), MessageDto.From(assistantMessage), reply.Provider, reply.Model, latencyMs);
    }

    private static string NormalizePrompt(string? text, InputMode mode)
    {
        var prompt = text?.Trim() ?? string.Empty;

        if (prompt.Length == 0)
            throw new BadRequestException(mode == InputMode.Voice
                ? "No speech was detected in the recording. Please try again and speak clearly."
                : "Message text is required.");

        if (prompt.Length > Limits.MaxPromptLength)
            throw new BadRequestException($"Messages cannot be longer than {Limits.MaxPromptLength} characters.");

        return prompt;
    }
}
