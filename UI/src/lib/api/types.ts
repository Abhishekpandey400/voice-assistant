export type Role = 'Admin' | 'Teacher' | 'Student'
export type InputMode = 'Text' | 'Voice'
export type MessageSender = 'User' | 'Assistant'
export type ActivityAction =
  | 'Login'
  | 'LoginFailed'
  | 'ConversationStarted'
  | 'AiInteraction'
  | 'UserCreated'
  | 'UserStatusChanged'

export const Permissions = {
  AssistantUse: 'assistant.use',
  ConversationsReadAll: 'conversations.read-all',
  ActivityLogsRead: 'activity-logs.read',
  DashboardView: 'dashboard.view',
  UsersManage: 'users.manage',
} as const

export interface UserProfile {
  id: string
  fullName: string
  email: string
  role: Role
  permissions: string[]
}

export interface LoginResponse {
  accessToken: string
  expiresAt: string
  user: UserProfile
}

export interface Conversation {
  id: string
  title: string
  startedAt: string
  lastActivityAt: string
  messageCount: number
}

export interface Message {
  id: number
  sender: MessageSender
  content: string
  inputMode: InputMode
  createdAt: string
}

export interface ConversationDetail {
  id: string
  title: string
  ownerId: string
  ownerName: string
  ownerRole: Role
  startedAt: string
  lastActivityAt: string
  messages: Message[]
}

export interface InteractionResult {
  userMessage: Message
  assistantMessage: Message
  provider: string
  model: string
  latencyMs: number
}

export interface ActivityLog {
  id: number
  userId: string | null
  userEmail: string | null
  userName: string | null
  role: Role | null
  action: ActivityAction
  conversationId: string | null
  inputMode: InputMode | null
  requestText: string | null
  responseText: string | null
  provider: string | null
  model: string | null
  latencyMs: number | null
  isSuccess: boolean
  errorMessage: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface RoleCount {
  role: Role
  count: number
}

export interface Dashboard {
  totalUsers: number
  activeUsers: number
  usersByRole: RoleCount[]
  totalConversations: number
  totalInteractions: number
  interactionsToday: number
  failedInteractions: number
  voiceInteractions: number
  averageLatencyMs: number
  lastSevenDays: { date: string; interactions: RoleCount[] }[]
  topUsers: { userId: string; fullName: string; role: Role; interactions: number }[]
}

export interface ManagedUser {
  id: string
  fullName: string
  email: string
  role: Role
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  conversationCount: number
}
