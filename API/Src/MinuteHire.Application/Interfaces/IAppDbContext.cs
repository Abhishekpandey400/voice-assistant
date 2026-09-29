using Microsoft.EntityFrameworkCore;
using MinuteHire.Domain.Entities;

namespace MinuteHire.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<Conversation> Conversations { get; }
    DbSet<ConversationMessage> ConversationMessages { get; }
    DbSet<ActivityLog> ActivityLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
