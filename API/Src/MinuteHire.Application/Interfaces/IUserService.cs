using MinuteHire.Application.Dtos.Users;

namespace MinuteHire.Application.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<UserDto>> ListAsync(CancellationToken ct);
    Task<IReadOnlyList<RoleDto>> ListRolesAsync(CancellationToken ct);
    Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct);
    Task<UserDto> SetStatusAsync(Guid userId, bool isActive, CancellationToken ct);
}
