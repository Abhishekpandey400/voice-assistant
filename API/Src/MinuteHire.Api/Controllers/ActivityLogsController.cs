using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MinuteHire.Application.Dtos.Activity;
using MinuteHire.Application.Dtos.Common;
using MinuteHire.Application.Dtos.Conversations;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Authorization;
using Swashbuckle.AspNetCore.Annotations;

namespace MinuteHire.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Produces("application/json")]
public sealed class ActivityLogsController : ControllerBase
{
    private readonly IActivityLogService _activityLogs;
    private readonly IConversationService _conversations;

    public ActivityLogsController(IActivityLogService activityLogs, IConversationService conversations)
    {
        _activityLogs = activityLogs;
        _conversations = conversations;
    }

    [HttpGet("activity-logs")]
    [Authorize(Policy = Permissions.ActivityLogsRead)]
    [SwaggerOperation(Summary = "Search activity logs", Description = "Paged activity and interaction logs, filterable by role, user, action, input mode, outcome, date range and free text.")]
    [ProducesResponseType<PagedResult<ActivityLogDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> List([FromQuery] ActivityLogQuery query, CancellationToken ct)
    {
        var result = await _activityLogs.SearchAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("activity-logs/{id:long}")]
    [Authorize(Policy = Permissions.ActivityLogsRead)]
    [SwaggerOperation(Summary = "Get an activity log entry", Description = "Full request and response detail for one log entry.")]
    [ProducesResponseType<ActivityLogDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(long id, CancellationToken ct)
    {
        var result = await _activityLogs.GetAsync(id, ct);
        return Ok(result);
    }

    [HttpGet("conversations/{id:guid}")]
    [Authorize(Policy = Permissions.ConversationsReadAll)]
    [SwaggerOperation(Summary = "Get any conversation transcript", Description = "Full transcript of a Student or Teacher conversation referenced from the activity logs.")]
    [ProducesResponseType<ConversationDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetConversation(Guid id, CancellationToken ct)
    {
        var result = await _conversations.GetAsync(id, ct);
        return Ok(result);
    }
}
