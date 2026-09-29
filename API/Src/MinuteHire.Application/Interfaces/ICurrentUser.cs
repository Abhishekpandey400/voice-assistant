namespace MinuteHire.Application.Interfaces;

public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    Guid UserId { get; }
    string Email { get; }
    string Role { get; }
    string? IpAddress { get; }
    string? UserAgent { get; }
    bool HasPermission(string permission);
}
