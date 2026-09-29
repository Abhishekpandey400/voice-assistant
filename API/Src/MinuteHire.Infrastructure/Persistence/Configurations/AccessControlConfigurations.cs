using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MinuteHire.Domain.Authorization;
using MinuteHire.Domain.Entities;

namespace MinuteHire.Infrastructure.Persistence.Configurations;

internal static class AccessControlSeed
{
    public static readonly Role[] Roles =
    [
        new() { Id = 1, Name = RoleNames.Admin, Description = "Manages users and monitors platform activity." },
        new() { Id = 2, Name = RoleNames.Teacher, Description = "Uses the AI teaching assistant by voice." },
        new() { Id = 3, Name = RoleNames.Student, Description = "Uses the AI study buddy by voice." }
    ];

    public static readonly Permission[] Permissions =
    [
        new() { Id = 1, Code = Domain.Authorization.Permissions.AssistantUse, Description = "Start and hold voice conversations with the AI assistant." },
        new() { Id = 2, Code = Domain.Authorization.Permissions.ConversationsReadAll, Description = "Read any user's conversation transcript." },
        new() { Id = 3, Code = Domain.Authorization.Permissions.ActivityLogsRead, Description = "View interaction and activity logs." },
        new() { Id = 4, Code = Domain.Authorization.Permissions.DashboardView, Description = "View the admin dashboard metrics." },
        new() { Id = 5, Code = Domain.Authorization.Permissions.UsersManage, Description = "Create, activate and deactivate user accounts." }
    ];

    public static readonly IReadOnlyDictionary<string, string[]> Grants = new Dictionary<string, string[]>
    {
        [RoleNames.Admin] =
        [
            Domain.Authorization.Permissions.ConversationsReadAll,
            Domain.Authorization.Permissions.ActivityLogsRead,
            Domain.Authorization.Permissions.DashboardView,
            Domain.Authorization.Permissions.UsersManage
        ],
        [RoleNames.Teacher] = [Domain.Authorization.Permissions.AssistantUse],
        [RoleNames.Student] = [Domain.Authorization.Permissions.AssistantUse]
    };
}

internal sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.Property(r => r.Id).ValueGeneratedNever();
        builder.Property(r => r.Name).HasMaxLength(50).IsRequired();
        builder.Property(r => r.Description).HasMaxLength(250);
        builder.HasIndex(r => r.Name).IsUnique();
        builder.HasData(AccessControlSeed.Roles);
    }
}

internal sealed class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.Property(p => p.Id).ValueGeneratedNever();
        builder.Property(p => p.Code).HasMaxLength(100).IsRequired();
        builder.Property(p => p.Description).HasMaxLength(250);
        builder.HasIndex(p => p.Code).IsUnique();
        builder.HasData(AccessControlSeed.Permissions);
    }
}

internal sealed class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.HasKey(rp => new { rp.RoleId, rp.PermissionId });
        builder.HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId);
        builder.HasOne(rp => rp.Permission).WithMany(p => p.RolePermissions).HasForeignKey(rp => rp.PermissionId);

        builder.HasData(
            from role in AccessControlSeed.Roles
            from code in AccessControlSeed.Grants[role.Name]
            join permission in AccessControlSeed.Permissions on code equals permission.Code
            select new RolePermission { RoleId = role.Id, PermissionId = permission.Id });
    }
}

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(u => u.FullName).HasMaxLength(120).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.Property(u => u.PasswordHash).HasMaxLength(512).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();
        builder.HasOne(u => u.Role).WithMany(r => r.Users).HasForeignKey(u => u.RoleId).OnDelete(DeleteBehavior.Restrict);
    }
}
