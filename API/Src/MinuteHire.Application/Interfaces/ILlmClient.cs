using MinuteHire.Application.Dtos.Ai;

namespace MinuteHire.Application.Interfaces;

public interface ILlmClient
{
    Task<LlmReply> CompleteAsync(string systemPrompt, IReadOnlyList<ChatTurn> turns, CancellationToken ct);
}
