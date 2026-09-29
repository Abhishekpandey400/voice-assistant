using MinuteHire.Domain.Entities;

namespace MinuteHire.Application.Interfaces;

public interface IActivityLogger
{
    Task LogAsync(ActivityLog entry, CancellationToken ct);
}
