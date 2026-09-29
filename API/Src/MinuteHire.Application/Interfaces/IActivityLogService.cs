using MinuteHire.Application.Dtos.Activity;
using MinuteHire.Application.Dtos.Common;

namespace MinuteHire.Application.Interfaces;

public interface IActivityLogService
{
    Task<PagedResult<ActivityLogDto>> SearchAsync(ActivityLogQuery query, CancellationToken ct);
    Task<ActivityLogDto> GetAsync(long id, CancellationToken ct);
    Task<DashboardDto> GetDashboardAsync(CancellationToken ct);
}
