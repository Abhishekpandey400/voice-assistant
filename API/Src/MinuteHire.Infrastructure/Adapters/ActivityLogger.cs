using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Entities;

namespace MinuteHire.Infrastructure.Adapters;

internal sealed class ActivityLogger(IAppDbContext db, ICurrentUser currentUser) : IActivityLogger
{
    private const int MaxUserAgentLength = 512;
    private const int MaxErrorLength = 1000;

    public async Task LogAsync(ActivityLog entry, CancellationToken ct)
    {
        if (currentUser.IsAuthenticated)
        {
            entry.UserId ??= currentUser.UserId;
            entry.UserEmail ??= currentUser.Email;
            entry.RoleName ??= currentUser.Role;
        }

        entry.IpAddress = currentUser.IpAddress;
        entry.UserAgent = Truncate(currentUser.UserAgent, MaxUserAgentLength);
        entry.ErrorMessage = Truncate(entry.ErrorMessage, MaxErrorLength);
        entry.CreatedAt = DateTime.UtcNow;

        db.ActivityLogs.Add(entry);
        await db.SaveChangesAsync(ct);
    }

    private static string? Truncate(string? value, int length) =>
        value is { Length: > 0 } && value.Length > length ? value[..length] : value;
}
