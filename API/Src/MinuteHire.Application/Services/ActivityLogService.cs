using Microsoft.EntityFrameworkCore;
using MinuteHire.Application.Common;
using MinuteHire.Application.Dtos.Activity;
using MinuteHire.Application.Dtos.Common;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Authorization;
using MinuteHire.Domain.Entities;
using MinuteHire.Domain.Enums;

namespace MinuteHire.Application.Services;

public sealed class ActivityLogService(IAppDbContext db) : IActivityLogService
{
    private const int TrendDays = 7;
    private static readonly string[] AssistantRoles = [RoleNames.Student, RoleNames.Teacher];

    public async Task<PagedResult<ActivityLogDto>> SearchAsync(ActivityLogQuery query, CancellationToken ct)
    {
        var logs = db.ActivityLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Role))
            logs = logs.Where(l => l.RoleName == query.Role);
        if (query.UserId is { } userId)
            logs = logs.Where(l => l.UserId == userId);
        if (query.Action is { } action)
            logs = logs.Where(l => l.Action == action);
        if (query.InputMode is { } inputMode)
            logs = logs.Where(l => l.InputMode == inputMode);
        if (query.IsSuccess is { } isSuccess)
            logs = logs.Where(l => l.IsSuccess == isSuccess);
        if (query.From is { } from)
            logs = logs.Where(l => l.CreatedAt >= from.UtcDateTime);
        if (query.To is { } to)
            logs = logs.Where(l => l.CreatedAt <= to.UtcDateTime);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            logs = logs.Where(l =>
                (l.UserEmail ?? string.Empty).ToLower().Contains(term) ||
                (l.RequestText ?? string.Empty).ToLower().Contains(term) ||
                (l.ResponseText ?? string.Empty).ToLower().Contains(term));
        }

        var total = await logs.CountAsync(ct);

        var items = await Project(logs
                .OrderByDescending(l => l.CreatedAt).ThenByDescending(l => l.Id)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize))
            .ToListAsync(ct);

        return new PagedResult<ActivityLogDto>(items, query.Page, query.PageSize, total);
    }

    public async Task<ActivityLogDto> GetAsync(long id, CancellationToken ct) =>
        await Project(db.ActivityLogs.AsNoTracking().Where(l => l.Id == id)).SingleOrDefaultAsync(ct)
        ?? throw new NotFoundException("Activity log entry not found.");

    public async Task<DashboardDto> GetDashboardAsync(CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        var trendStart = today.AddDays(1 - TrendDays);

        var usersByRole = await db.Users.AsNoTracking()
            .GroupBy(u => u.Role.Name)
            .Select(g => new RoleCountDto(g.Key, g.Count()))
            .ToListAsync(ct);

        var activeUsers = await db.Users.CountAsync(u => u.IsActive, ct);
        var totalConversations = await db.Conversations.CountAsync(ct);

        var interactions = db.ActivityLogs.AsNoTracking().Where(l => l.Action == ActivityAction.AiInteraction);
        var successful = interactions.Where(l => l.IsSuccess);

        var totalInteractions = await successful.CountAsync(ct);
        var interactionsToday = await successful.CountAsync(l => l.CreatedAt >= today, ct);
        var voiceInteractions = await successful.CountAsync(l => l.InputMode == InputMode.Voice, ct);
        var failedInteractions = await interactions.CountAsync(l => !l.IsSuccess, ct);
        var averageLatency = await successful.AverageAsync(l => (double?)l.LatencyMs, ct) ?? 0;

        var recent = await successful
            .Where(l => l.CreatedAt >= trendStart)
            .Select(l => new { l.CreatedAt, l.RoleName })
            .ToListAsync(ct);

        var lastSevenDays = Enumerable.Range(0, TrendDays)
            .Select(offset => trendStart.AddDays(offset))
            .Select(day => new DailyActivityDto(
                DateOnly.FromDateTime(day),
                AssistantRoles
                    .Select(role => new RoleCountDto(role, recent.Count(r => r.CreatedAt.Date == day && r.RoleName == role)))
                    .ToList()))
            .ToList();

        var topUsers = (await successful
                .Where(l => l.UserId != null)
                .GroupBy(l => l.UserId!.Value)
                .Select(g => new { UserId = g.Key, Interactions = g.Count() })
                .OrderByDescending(g => g.Interactions)
                .Take(5)
                .Join(db.Users, g => g.UserId, u => u.Id, (g, u) => new TopUserDto(u.Id, u.FullName, u.Role.Name, g.Interactions))
                .ToListAsync(ct))
            .OrderByDescending(t => t.Interactions)
            .ToList();

        return new DashboardDto(
            usersByRole.Sum(r => r.Count),
            activeUsers,
            usersByRole,
            totalConversations,
            totalInteractions,
            interactionsToday,
            failedInteractions,
            voiceInteractions,
            Math.Round(averageLatency),
            lastSevenDays,
            topUsers);
    }

    private static IQueryable<ActivityLogDto> Project(IQueryable<ActivityLog> logs) =>
        logs.Select(l => new ActivityLogDto(
            l.Id,
            l.UserId,
            l.UserEmail,
            l.User != null ? l.User.FullName : null,
            l.RoleName,
            l.Action,
            l.ConversationId,
            l.InputMode,
            l.RequestText,
            l.ResponseText,
            l.Provider,
            l.Model,
            l.LatencyMs,
            l.IsSuccess,
            l.ErrorMessage,
            l.IpAddress,
            l.UserAgent,
            l.CreatedAt));
}
