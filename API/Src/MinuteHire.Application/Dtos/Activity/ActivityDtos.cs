using System.ComponentModel.DataAnnotations;
using MinuteHire.Domain.Enums;

namespace MinuteHire.Application.Dtos.Activity;

public sealed class ActivityLogQuery
{
    public string? Role { get; init; }
    public Guid? UserId { get; init; }
    public ActivityAction? Action { get; init; }
    public InputMode? InputMode { get; init; }
    public bool? IsSuccess { get; init; }

    [MaxLength(100)]
    public string? Search { get; init; }

    public DateTimeOffset? From { get; init; }
    public DateTimeOffset? To { get; init; }

    [Range(1, int.MaxValue)]
    public int Page { get; init; } = 1;

    [Range(1, 100)]
    public int PageSize { get; init; } = 20;
}

public sealed record ActivityLogDto(
    long Id,
    Guid? UserId,
    string? UserEmail,
    string? UserName,
    string? Role,
    ActivityAction Action,
    Guid? ConversationId,
    InputMode? InputMode,
    string? RequestText,
    string? ResponseText,
    string? Provider,
    string? Model,
    int? LatencyMs,
    bool IsSuccess,
    string? ErrorMessage,
    string? IpAddress,
    string? UserAgent,
    DateTime CreatedAt);

public sealed record RoleCountDto(string Role, int Count);

public sealed record DailyActivityDto(DateOnly Date, IReadOnlyList<RoleCountDto> Interactions);

public sealed record TopUserDto(Guid UserId, string FullName, string Role, int Interactions);

public sealed record DashboardDto(
    int TotalUsers,
    int ActiveUsers,
    IReadOnlyList<RoleCountDto> UsersByRole,
    int TotalConversations,
    int TotalInteractions,
    int InteractionsToday,
    int FailedInteractions,
    int VoiceInteractions,
    double AverageLatencyMs,
    IReadOnlyList<DailyActivityDto> LastSevenDays,
    IReadOnlyList<TopUserDto> TopUsers);
