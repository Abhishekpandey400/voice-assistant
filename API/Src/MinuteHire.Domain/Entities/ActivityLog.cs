using MinuteHire.Domain.Enums;

namespace MinuteHire.Domain.Entities;

public class ActivityLog
{
    public long Id { get; set; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string? UserEmail { get; set; }
    public string? RoleName { get; set; }
    public ActivityAction Action { get; set; }
    public Guid? ConversationId { get; set; }
    public Conversation? Conversation { get; set; }
    public InputMode? InputMode { get; set; }
    public string? RequestText { get; set; }
    public string? ResponseText { get; set; }
    public string? Provider { get; set; }
    public string? Model { get; set; }
    public int? LatencyMs { get; set; }
    public bool IsSuccess { get; set; } = true;
    public string? ErrorMessage { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; }
}
