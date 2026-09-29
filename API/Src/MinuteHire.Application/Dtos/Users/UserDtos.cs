using System.ComponentModel.DataAnnotations;

namespace MinuteHire.Application.Dtos.Users;

public sealed class CreateUserRequest
{
    [Required, MaxLength(120)]
    public string FullName { get; init; } = string.Empty;

    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required, MinLength(8), MaxLength(128)]
    public string Password { get; init; } = string.Empty;

    [Required]
    public string Role { get; init; } = string.Empty;
}

public sealed class UpdateUserStatusRequest
{
    public bool IsActive { get; init; }
}

public sealed record UserDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLoginAt,
    int ConversationCount);

public sealed record RoleDto(int Id, string Name, string Description, IReadOnlyList<string> Permissions);
