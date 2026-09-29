using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MinuteHire.Api.Extensions;
using MinuteHire.Application.Dtos.Auth;
using MinuteHire.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace MinuteHire.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(ApiServiceExtensions.LoginRateLimit)]
    [SwaggerOperation(Summary = "Sign in", Description = "Validates credentials and returns a JWT carrying the user's role and permissions.")]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _auth.LoginAsync(request, ct);
        return Ok(result);
    }

    [HttpGet("me")]
    [Authorize]
    [SwaggerOperation(Summary = "Current user", Description = "Returns the signed-in user's profile, role and permissions.")]
    [ProducesResponseType<UserProfileDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var result = await _auth.GetProfileAsync(ct);
        return Ok(result);
    }
}
