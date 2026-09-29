namespace MinuteHire.Domain.Entities;

public class Conversation
{
    public const string DefaultTitle = "New conversation";

    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Title { get; set; } = DefaultTitle;
    public DateTime StartedAt { get; set; }
    public DateTime LastActivityAt { get; set; }
    public ICollection<ConversationMessage> Messages { get; set; } = new List<ConversationMessage>();
}
