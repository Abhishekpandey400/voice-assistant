using Microsoft.EntityFrameworkCore;
using MinuteHire.Application.Common;
using MinuteHire.Application.Dtos.Users;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Entities;
using MinuteHire.Domain.Enums;

namespace MinuteHire.Application.Services;

public sealed class UserService(
    IAppDbContext db,
    IPasswordService passwords,
    ICurrentUser currentUser,
    IActivityLogger activity) : IUserService
{
    public async Task<IReadOnlyList<UserDto>> ListAsync(CancellationToken ct) =>
        await db.Users.AsNoTracking()
            .OrderBy(u => u.Role.Name).ThenBy(u => u.FullName)
            .Select(u => new UserDto(u.Id, u.FullName, u.Email, u.Role.Name, u.IsActive, u.CreatedAt, u.LastLoginAt, u.Conversations.Count))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<RoleDto>> ListRolesAsync(CancellationToken ct) =>
        await db.Roles.AsNoTracking()
            .OrderBy(r => r.Id)
            .Select(r => new RoleDto(r.Id, r.Name, r.Description, r.RolePermissions.Select(rp => rp.Permission.Code).ToList()))
            .ToListAsync(ct);

    public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await db.Users.AnyAsync(u => u.Email == email, ct))
            throw new ConflictException($"A user with email {email} already exists.");

        var role = await db.Roles.SingleOrDefaultAsync(r => r.Name == request.Role, ct)
            ?? throw new BadRequestException($"Role '{request.Role}' does not exist.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = passwords.Hash(request.Password),
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);

        await activity.LogAsync(new ActivityLog
        {
            Action = ActivityAction.UserCreated,
            RequestText = $"Created {role.Name} account {email}"
        }, ct);

        return ToDto(user, 0);
    }

    public async Task<UserDto> SetStatusAsync(Guid userId, bool isActive, CancellationToken ct)
    {
        if (userId == currentUser.UserId && !isActive)
            throw new BadRequestException("You cannot deactivate your own account.");

        var user = await db.Users.Include(u => u.Role).SingleOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new NotFoundException("User not found.");

        user.IsActive = isActive;

        await activity.LogAsync(new ActivityLog
        {
            Action = ActivityAction.UserStatusChanged,
            RequestText = $"{(isActive ? "Activated" : "Deactivated")} account {user.Email}"
        }, ct);

        var conversationCount = await db.Conversations.CountAsync(c => c.UserId == userId, ct);
        return ToDto(user, conversationCount);
    }

    private static UserDto ToDto(User user, int conversationCount) =>
        new(user.Id, user.FullName, user.Email, user.Role.Name, user.IsActive, user.CreatedAt, user.LastLoginAt, conversationCount);
}
