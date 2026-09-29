using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MinuteHire.Application.Dtos.Users;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Authorization;
using Swashbuckle.AspNetCore.Annotations;

namespace MinuteHire.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Produces("application/json")]
[Authorize(Policy = Permissions.UsersManage)]
public sealed class UsersController : ControllerBase
{
    private readonly IUserService _users;

    public UsersController(IUserService users)
    {
        _users = users;
    }

    [HttpGet("users")]
    [SwaggerOperation(Summary = "List users")]
    [ProducesResponseType<IReadOnlyList<UserDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var result = await _users.ListAsync(ct);
        return Ok(result);
    }

    [HttpPost("users")]
    [SwaggerOperation(Summary = "Create a user", Description = "Creates an Admin, Teacher or Student account.")]
    [ProducesResponseType<UserDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request, CancellationToken ct)
    {
        var result = await _users.CreateAsync(request, ct);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPatch("users/{id:guid}/status")]
    [SwaggerOperation(Summary = "Activate or deactivate a user", Description = "Deactivated users cannot sign in and their existing tokens stop working immediately.")]
    [ProducesResponseType<UserDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> SetStatus(Guid id, [FromBody] UpdateUserStatusRequest request, CancellationToken ct)
    {
        var result = await _users.SetStatusAsync(id, request.IsActive, ct);
        return Ok(result);
    }

    [HttpGet("roles")]
    [SwaggerOperation(Summary = "List roles and their permissions")]
    [ProducesResponseType<IReadOnlyList<RoleDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Roles(CancellationToken ct)
    {
        var result = await _users.ListRolesAsync(ct);
        return Ok(result);
    }
}
