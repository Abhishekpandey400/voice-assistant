using System.ComponentModel.DataAnnotations;

namespace MinuteHire.Application.Dtos.Auth;

public sealed class LoginRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required, MaxLength(128)]
    public string Password { get; init; } = string.Empty;
}

public sealed record UserProfileDto(Guid Id, string FullName, string Email, string Role, IReadOnlyCollection<string> Permissions);

public sealed record LoginResponse(string AccessToken, DateTime ExpiresAt, UserProfileDto User);

public sealed record AccessToken(string Token, DateTime ExpiresAt);
