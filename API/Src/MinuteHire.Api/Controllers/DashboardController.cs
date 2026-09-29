using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MinuteHire.Application.Dtos.Activity;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Authorization;
using Swashbuckle.AspNetCore.Annotations;

namespace MinuteHire.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Produces("application/json")]
[Authorize(Policy = Permissions.DashboardView)]
public sealed class DashboardController : ControllerBase
{
    private readonly IActivityLogService _activityLogs;

    public DashboardController(IActivityLogService activityLogs)
    {
        _activityLogs = activityLogs;
    }

    [HttpGet]
    [SwaggerOperation(Summary = "Dashboard metrics", Description = "User counts, interaction totals, failure count, average AI latency, a 7-day trend by role and the most active users.")]
    [ProducesResponseType<DashboardDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await _activityLogs.GetDashboardAsync(ct);
        return Ok(result);
    }
}
