using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MinuteHire.Domain.Entities;

namespace MinuteHire.Infrastructure.Persistence.Configurations;

internal sealed class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.Property(c => c.Title).HasMaxLength(200).IsRequired();
        builder.HasIndex(c => new { c.UserId, c.LastActivityAt });
        builder.HasOne(c => c.User).WithMany(u => u.Conversations).HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class ConversationMessageConfiguration : IEntityTypeConfiguration<ConversationMessage>
{
    public void Configure(EntityTypeBuilder<ConversationMessage> builder)
    {
        builder.Property(m => m.Sender).HasConversion<string>().HasMaxLength(20);
        builder.Property(m => m.InputMode).HasConversion<string>().HasMaxLength(20);
        builder.Property(m => m.Content).IsRequired();
        builder.HasIndex(m => new { m.ConversationId, m.CreatedAt });
        builder.HasOne(m => m.Conversation).WithMany(c => c.Messages).HasForeignKey(m => m.ConversationId).OnDelete(DeleteBehavior.Cascade);
    }
}

internal sealed class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> builder)
    {
        builder.Property(l => l.Action).HasConversion<string>().HasMaxLength(40);
        builder.Property(l => l.InputMode).HasConversion<string>().HasMaxLength(20);
        builder.Property(l => l.UserEmail).HasMaxLength(256);
        builder.Property(l => l.RoleName).HasMaxLength(50);
        builder.Property(l => l.Provider).HasMaxLength(50);
        builder.Property(l => l.Model).HasMaxLength(100);
        builder.Property(l => l.ErrorMessage).HasMaxLength(1000);
        builder.Property(l => l.IpAddress).HasMaxLength(64);
        builder.Property(l => l.UserAgent).HasMaxLength(512);
        builder.HasIndex(l => l.CreatedAt);
        builder.HasIndex(l => new { l.Action, l.CreatedAt });
        builder.HasIndex(l => new { l.RoleName, l.CreatedAt });
        builder.HasOne(l => l.User).WithMany().HasForeignKey(l => l.UserId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(l => l.Conversation).WithMany().HasForeignKey(l => l.ConversationId).OnDelete(DeleteBehavior.SetNull);
    }
}
