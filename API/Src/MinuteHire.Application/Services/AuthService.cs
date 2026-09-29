using Microsoft.EntityFrameworkCore;
using MinuteHire.Application.Common;
using MinuteHire.Application.Dtos.Auth;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Entities;
using MinuteHire.Domain.Enums;

namespace MinuteHire.Application.Services;

public sealed class AuthService(
    IAppDbContext db,
    IPasswordService passwords,
    ITokenService tokens,
    ICurrentUser currentUser,
    IActivityLogger activity) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await db.Users
            .Include(u => u.Role)
                .ThenInclude(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .SingleOrDefaultAsync(u => u.Email == email, ct);

        if (user is null || !passwords.Verify(user.PasswordHash, request.Password) || !user.IsActive)
        {
            await activity.LogAsync(new ActivityLog
            {
                Action = ActivityAction.LoginFailed,
                IsSuccess = false,
                UserId = user?.Id,
                UserEmail = email,
                RoleName = user?.Role.Name,
                ErrorMessage = user is { IsActive: false } ? "Account is deactivated." : "Invalid email or password."
            }, ct);

            throw new UnauthorizedException("Invalid email or password, or the account is deactivated.");
        }

        user.LastLoginAt = DateTime.UtcNow;

        var profile = ToProfile(user);
        var token = tokens.Create(user, profile.Permissions);

        await activity.LogAsync(new ActivityLog
        {
            Action = ActivityAction.Login,
            UserId = user.Id,
            UserEmail = user.Email,
            RoleName = user.Role.Name
        }, ct);

        return new LoginResponse(token.Token, token.ExpiresAt, profile);
    }

    public async Task<UserProfileDto> GetProfileAsync(CancellationToken ct)
    {
        var user = await db.Users.AsNoTracking()
            .Include(u => u.Role)
                .ThenInclude(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
            .SingleOrDefaultAsync(u => u.Id == currentUser.UserId, ct)
            ?? throw new NotFoundException("User not found.");

        return ToProfile(user);
    }

    private static UserProfileDto ToProfile(User user) =>
        new(user.Id, user.FullName, user.Email, user.Role.Name,
            user.Role.RolePermissions.Select(rp => rp.Permission.Code).Order().ToArray());
}
