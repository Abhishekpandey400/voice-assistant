using MinuteHire.Application.Common;
using System.ComponentModel.DataAnnotations;
using MinuteHire.Domain.Entities;
using MinuteHire.Domain.Enums;

namespace MinuteHire.Application.Dtos.Conversations;

public sealed class StartConversationRequest
{
    [MaxLength(120)]
    public string? Title { get; init; }
}

public sealed class SendMessageRequest
{
    [Required, MaxLength(Limits.MaxPromptLength)]
    public string Text { get; init; } = string.Empty;
}

public sealed record ConversationDto(Guid Id, string Title, DateTime StartedAt, DateTime LastActivityAt, int MessageCount);

public sealed record MessageDto(long Id, MessageSender Sender, string Content, InputMode InputMode, DateTime CreatedAt)
{
    public static MessageDto From(ConversationMessage message) =>
        new(message.Id, message.Sender, message.Content, message.InputMode, message.CreatedAt);
}

public sealed record ConversationDetailDto(
    Guid Id,
    string Title,
    Guid OwnerId,
    string OwnerName,
    string OwnerRole,
    DateTime StartedAt,
    DateTime LastActivityAt,
    IReadOnlyList<MessageDto> Messages);

public sealed record InteractionResultDto(
    MessageDto UserMessage,
    MessageDto AssistantMessage,
    string Provider,
    string Model,
    int LatencyMs);
