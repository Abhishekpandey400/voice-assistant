using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Entities;

namespace MinuteHire.Infrastructure.Persistence;

public sealed class SeedOptions
{
    public const string Section = "Seed";

    public List<SeedUser> Users { get; set; } = [];
}

public sealed class SeedUser
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public static class DatabaseInitializer
{
    public static async Task InitializeDatabaseAsync(this IServiceProvider services, CancellationToken ct = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwords = scope.ServiceProvider.GetRequiredService<IPasswordService>();
        var seed = scope.ServiceProvider.GetRequiredService<IOptions<SeedOptions>>().Value;
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger(nameof(DatabaseInitializer));

        await db.Database.MigrateAsync(ct);

        var roles = await db.Roles.ToDictionaryAsync(r => r.Name, ct);
        var existing = (await db.Users.Select(u => u.Email).ToListAsync(ct)).ToHashSet();

        var newUsers = seed.Users
            .Where(u => !existing.Contains(u.Email.ToLowerInvariant()) && roles.ContainsKey(u.Role))
            .Select(u => new User
            {
                Id = Guid.NewGuid(),
                FullName = u.FullName,
                Email = u.Email.ToLowerInvariant(),
                PasswordHash = passwords.Hash(u.Password),
                RoleId = roles[u.Role].Id,
                CreatedAt = DateTime.UtcNow
            })
            .ToList();

        if (newUsers.Count == 0) return;

        db.Users.AddRange(newUsers);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded {Count} demo users", newUsers.Count);
    }
}
