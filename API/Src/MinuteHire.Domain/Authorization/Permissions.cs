namespace MinuteHire.Domain.Authorization;

public static class Permissions
{
    public const string AssistantUse = "assistant.use";
    public const string ConversationsReadAll = "conversations.read-all";
    public const string ActivityLogsRead = "activity-logs.read";
    public const string DashboardView = "dashboard.view";
    public const string UsersManage = "users.manage";

    public static readonly IReadOnlyList<string> All =
    [
        AssistantUse,
        ConversationsReadAll,
        ActivityLogsRead,
        DashboardView,
        UsersManage
    ];
}
