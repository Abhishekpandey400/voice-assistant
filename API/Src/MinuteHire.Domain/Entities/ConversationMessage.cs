using MinuteHire.Domain.Enums;

namespace MinuteHire.Domain.Entities;

public class ConversationMessage
{
    public long Id { get; set; }
    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public MessageSender Sender { get; set; }
    public string Content { get; set; } = string.Empty;
    public InputMode InputMode { get; set; }
    public DateTime CreatedAt { get; set; }
}
