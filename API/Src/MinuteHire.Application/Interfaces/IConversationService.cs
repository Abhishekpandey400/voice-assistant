using MinuteHire.Application.Dtos.Ai;
using MinuteHire.Application.Dtos.Conversations;

namespace MinuteHire.Application.Interfaces;

public interface IConversationService
{
    Task<ConversationDto> StartAsync(StartConversationRequest request, CancellationToken ct);
    Task<IReadOnlyList<ConversationDto>> ListMineAsync(CancellationToken ct);
    Task<ConversationDetailDto> GetAsync(Guid conversationId, CancellationToken ct);
    Task<InteractionResultDto> SendTextAsync(Guid conversationId, string text, CancellationToken ct);
    Task<InteractionResultDto> SendVoiceAsync(Guid conversationId, AudioInput audio, CancellationToken ct);
}
