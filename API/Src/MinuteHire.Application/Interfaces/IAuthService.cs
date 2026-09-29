using MinuteHire.Application.Dtos.Auth;

namespace MinuteHire.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<UserProfileDto> GetProfileAsync(CancellationToken ct);
}
