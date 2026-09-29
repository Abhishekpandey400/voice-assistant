using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.JsonWebTokens;
using MinuteHire.Application.Interfaces;
using MinuteHire.Application.Common;
using MinuteHire.Infrastructure.Helpers;

namespace MinuteHire.Infrastructure.Adapters;

internal sealed class CurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    private HttpContext? Context => accessor.HttpContext;
    private ClaimsPrincipal? Principal => Context?.User;

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true;

    public Guid UserId =>
        Guid.TryParse(Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub), out var id)
            ? id
            : throw new UnauthorizedException("You must be signed in to perform this action.");

    public string Email => Principal?.FindFirstValue(JwtRegisteredClaimNames.Email) ?? string.Empty;

    public string Role => Principal?.FindFirstValue(AppClaims.Role) ?? string.Empty;

    public string? IpAddress => Context?.Connection.RemoteIpAddress?.ToString();

    public string? UserAgent => Context?.Request.Headers.UserAgent.ToString();

    public bool HasPermission(string permission) => Principal?.HasClaim(AppClaims.Permission, permission) == true;
}
