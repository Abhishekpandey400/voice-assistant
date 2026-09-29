# MinuteHire Voice Assistant — ER Diagram

```mermaid
erDiagram
    Roles ||--o{ RolePermissions : grants
    Permissions ||--o{ RolePermissions : "granted via"
    Roles ||--o{ Users : assigns
    Users ||--o{ Conversations : owns
    Conversations ||--o{ ConversationMessages : contains
    Users |o--o{ ActivityLogs : performs
    Conversations |o--o{ ActivityLogs : references

    Roles {
        int Id PK
        varchar Name UK "Admin | Teacher | Student"
        varchar Description
    }
    Permissions {
        int Id PK
        varchar Code UK "assistant.use, activity-logs.read, ..."
        varchar Description
    }
    RolePermissions {
        int RoleId PK, FK
        int PermissionId PK, FK
    }
    Users {
        uuid Id PK
        varchar FullName
        varchar Email UK
        varchar PasswordHash
        int RoleId FK
        bool IsActive
        timestamptz CreatedAt
        timestamptz LastLoginAt
    }
    Conversations {
        uuid Id PK
        uuid UserId FK
        varchar Title
        timestamptz StartedAt
        timestamptz LastActivityAt
    }
    ConversationMessages {
        bigint Id PK
        uuid ConversationId FK
        varchar Sender "User | Assistant"
        text Content
        varchar InputMode "Text | Voice"
        timestamptz CreatedAt
    }
    ActivityLogs {
        bigint Id PK
        uuid UserId FK "nullable"
        varchar UserEmail
        varchar RoleName
        varchar Action "Login | LoginFailed | ConversationStarted | AiInteraction | UserCreated | UserStatusChanged"
        uuid ConversationId FK "nullable"
        varchar InputMode
        text RequestText
        text ResponseText
        varchar Provider
        varchar Model
        int LatencyMs
        bool IsSuccess
        varchar ErrorMessage
        varchar IpAddress
        varchar UserAgent
        timestamptz CreatedAt
    }
```

| Role | Permissions |
|---|---|
| Admin | dashboard.view, activity-logs.read, conversations.read-all, users.manage |
| Teacher | assistant.use |
| Student | assistant.use |
