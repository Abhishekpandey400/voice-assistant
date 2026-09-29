# MinuteHire — Full Stack .NET Assessment

Two deliverables in one repository:

| Task | What it is | Live |
|---|---|---|
| **Task 1 — Frontend UI Replication** | Pixel-close React replica of the [Hirely SaaS](https://hirelysaas.framer.website/) homepage, with its animations, scroll effects and responsive layout | https://hirely-ui.onrender.com |
| **Task 2 — Backend + RBAC + AI Voice** | ASP.NET Core 8 API with JWT auth, permission-based RBAC, a voice-driven AI assistant for Students and Teachers, and an Admin dashboard with activity logs | https://minutehire-ui.onrender.com |

| Resource | URL |
|---|---|
| API | https://minutehire-api.onrender.com |
| Swagger / OpenAPI | https://minutehire-api.onrender.com/swagger |
| ER diagram | https://minutehire-ui.onrender.com/er-diagram.html · [source](docs/er-diagram.md) |
| Health check | https://minutehire-api.onrender.com/health |

> Hosted on Render's free tier: the API sleeps after 15 minutes of inactivity, so the first request can take up to a minute.

## Test credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@minutehire.demo | Admin@2026 |
| Teacher | teacher@minutehire.demo | Teacher@2026 |
| Student | student@minutehire.demo | Student@2026 |

The login page also has one-click demo buttons for each role.

---

## Task 2 — Voice AI assistant with RBAC

### Features

- **Authentication** — email and password login issuing a JWT that carries the user's role and permissions. Passwords are hashed with ASP.NET Core Identity's `PasswordHasher`. Every request re-checks that the account is still active, so deactivating a user revokes their tokens immediately.
- **Permission-based RBAC** — roles map to permissions stored in the database, and each permission is an authorization policy.
- **Voice interaction** — *Voice input → AI processing → spoken response*:
  1. The browser records speech with `MediaRecorder` and stops automatically on silence.
  2. The API transcribes it with **Whisper** (`whisper-large-v3-turbo` on Groq).
  3. The transcript and recent conversation history go to the **LLM** (`openai/gpt-oss-120b` on Groq, with Gemini and OpenAI as fallbacks).
  4. The reply is returned and read aloud with the browser's **Web Speech API**.
- **Hands-free mode** — "Start conversation" keeps listening after every reply until the user ends it. Typed input is available as a fallback.
- **Role-specific personas** — Students get a patient *Study Buddy* tutor; Teachers get a *Teaching Assistant* for lesson plans, quizzes and rubrics.
- **Admin dashboard** — interaction totals, voice share, average AI latency, failures, a 7-day trend by role, the most active users, and user management (create, activate, deactivate).
- **Activity logging** — logins, failed logins, conversation starts, every AI interaction (request, response, input mode, provider, model, latency, success or error), and user changes, each with user, role, IP address, user agent and timestamp. The log view has search, filters, pagination and a full-transcript view.
- **Error handling** — every error returns RFC 7807 `ProblemDetails` with a `traceId`. AI provider failures fall back to the next provider, with a cooldown for rate-limited ones. Login and AI endpoints are rate limited.

### Roles and permissions

| Permission | Admin | Teacher | Student |
|---|:-:|:-:|:-:|
| `assistant.use` — voice and text conversations | | ✅ | ✅ |
| `dashboard.view` | ✅ | | |
| `activity-logs.read` | ✅ | | |
| `conversations.read-all` — any user's transcript | ✅ | | |
| `users.manage` | ✅ | | |

### API endpoints

| Method | Route | Access |
|---|---|---|
| `POST` | `/api/auth/login` | Public, rate limited |
| `GET` | `/api/auth/me` | Authenticated |
| `POST` | `/api/conversations` | `assistant.use` |
| `GET` | `/api/conversations` | `assistant.use` |
| `GET` | `/api/conversations/{id}` | `assistant.use`, owner only |
| `POST` | `/api/conversations/{id}/messages` | `assistant.use`, rate limited |
| `POST` | `/api/conversations/{id}/voice` | `assistant.use`, rate limited, multipart audio |
| `GET` | `/api/admin/dashboard` | `dashboard.view` |
| `GET` | `/api/admin/activity-logs` | `activity-logs.read` |
| `GET` | `/api/admin/activity-logs/{id}` | `activity-logs.read` |
| `GET` | `/api/admin/conversations/{id}` | `conversations.read-all` |
| `GET` `POST` | `/api/admin/users` | `users.manage` |
| `PATCH` | `/api/admin/users/{id}/status` | `users.manage` |
| `GET` | `/api/admin/roles` | `users.manage` |

Full request and response schemas are in Swagger.

### Architecture

Clean architecture, with dependencies pointing inwards:

```
MinuteHire.Api             Controllers, exception middleware, rate limiting, Swagger
      │
MinuteHire.Infrastructure  EF Core (PostgreSQL), JWT, password hashing, AI and Whisper adapters, DI
      │
MinuteHire.Application     Services, DTOs, interfaces (ports), application exceptions
      │
MinuteHire.Domain          Entities, enums, roles and permissions
```

- **Application** defines ports (`ILlmClient`, `ISpeechToText`, `IActivityLogger`, `ICurrentUser`…) that **Infrastructure** implements, so AI providers or storage can change without touching business logic.
- Roles, permissions and their mapping are seeded through EF Core `HasData`. Demo users are seeded on startup from configuration, and migrations are applied automatically.

### Data model

`Users` → `Roles` ↔ `RolePermissions` ↔ `Permissions`; `Users` → `Conversations` → `ConversationMessages`; `ActivityLogs` reference `Users` and `Conversations`. See the [ER diagram](docs/er-diagram.md).

---

## Task 1 — Hirely homepage replica

Built with React, TypeScript, Tailwind CSS and [Motion](https://motion.dev), using the original Creato Display typeface, colour palette and assets.

- **Sections** — navbar with dropdowns, hero with dashboard, benefits, key features, testimonial, payroll cards, logo marquee, extra features, FAQ, call to action, footer.
- **Scroll effects** — a pinned *Key Features* section that switches items and images as you scroll; a word-by-word testimonial reveal; a dashboard that tilts into place; a navbar that shrinks and blurs; fade-up reveals on every section.
- **Interactions** — hover lifts on buttons and cards, arrow nudges, dropdown menus, a pausable logo marquee, floating integration tiles, an animated FAQ accordion, and a newsletter form.
- **Responsive** — mobile menu, fluid typography, and stacked layouts on small screens. Respects `prefers-reduced-motion`.

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | .NET 8, ASP.NET Core Web API, EF Core 8, Npgsql |
| Database | PostgreSQL |
| Auth | JWT bearer, ASP.NET Core Identity password hasher, policy-based authorization |
| AI | Groq (`openai/gpt-oss-120b`, `whisper-large-v3-turbo`), Gemini and OpenAI fallbacks |
| Frontends | React 18, TypeScript, Vite, Tailwind CSS 4, Motion, lucide-react |
| Docs | Swashbuckle (Swagger / OpenAPI), Mermaid ER diagram |
| DevOps | Docker, GitHub Actions CI, Render Blueprint with checks-gated auto-deploy |

## Repository structure

```
├── API/                         Task 2 backend
│   ├── MinuteHire.sln
│   └── Src/
│       ├── MinuteHire.Api/
│       ├── MinuteHire.Application/
│       ├── MinuteHire.Domain/
│       └── MinuteHire.Infrastructure/
├── UI/                          Task 2 frontend (login, voice assistant, admin dashboard)
├── Hirely/                      Task 1 homepage replica
├── docker/                      api.Dockerfile, ui.Dockerfile, nginx config
├── docs/                        ER diagram
├── .github/workflows/ci.yml     CI pipeline
└── render.yaml                  Render Blueprint (API, UI, Hirely, PostgreSQL)
```

## Running locally

**Prerequisites:** .NET 8 SDK, Node.js 22, PostgreSQL, and a free [Groq API key](https://console.groq.com/keys).

**1. API**

```bash
cd API/Src/MinuteHire.Api
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=minutehire;Username=postgres;Password=<your-password>"
dotnet user-secrets set "Ai:Providers:0:ApiKey" "<your-groq-key>"
dotnet run
```

The API starts on http://localhost:5080. It creates the database, applies migrations and seeds the demo users on first run. Swagger is at http://localhost:5080/swagger.

**2. Task 2 UI**

```bash
cd UI
npm install
npm run dev
```

Open http://localhost:5173. The dev server proxies `/api` to the local API.

**3. Task 1 Hirely**

```bash
cd Hirely
npm install
npm run dev
```

### Configuration

| Key | Purpose |
|---|---|
| `ConnectionStrings:Default` | PostgreSQL connection string (a `postgres://` URL also works) |
| `Jwt:Key` | JWT signing key, at least 32 characters (a development key is included) |
| `Ai:Providers:0:ApiKey` | Groq key, used for the LLM and Whisper |
| `Ai:Providers:1:ApiKey` | Optional Gemini fallback key |
| `Ai:Providers:2:ApiKey` | Optional OpenAI fallback key |
| `Cors:AllowedOrigins` | Allowed UI origins (all origins when empty) |
| `Seed:Users` | Demo accounts created on startup |
| `VITE_API_URL` | API base URL for the UI build (empty means same origin or dev proxy) |

In production, set them as environment variables with `__` as the separator, for example `Ai__Providers__0__ApiKey`.

## CI/CD

Every pull request and every push to `main` runs four GitHub Actions jobs:

1. **Build API** — `dotnet build` in Release mode with warnings treated as errors.
2. **Build UI** — TypeScript type-check and Vite production build.
3. **Build Hirely** — TypeScript type-check and Vite production build.
4. **Build Docker images** — builds the API and UI images, after the three jobs above pass.

Render deploys from `main` through `render.yaml`, and only after these checks pass (`autoDeployTrigger: checksPass`).
