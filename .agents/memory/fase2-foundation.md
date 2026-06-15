---
name: Fase 2 Foundation to Production
description: Infraestrutura de produção implementada — DB, Auth, RBAC, API routes, React Router, testes, stubs de integração.
---

## O que foi implementado na Fase 2

### Banco de Dados (PostgreSQL)
- 12 tabelas: tenants, users, refresh_tokens, subscriptions, campaigns, leads, social_posts, whatsapp_messages, ai_interactions, audit_logs, notifications, media_assets, workflows
- Índices em todas colunas de busca frequente
- Trigger `set_updated_at` via função PL/pgSQL
- Seeds de 4 tenants demo + usuário `demo@nexorapulse.com` / `Demo@12345` criado no startup
- Conexão via `src/lib/db.ts` com pool pg (max: 20 conexões)

### Autenticação Enterprise
- `src/lib/auth.ts` — JWT (access 15min, refresh 30d) + bcrypt 12 rounds
- `src/middleware/auth.middleware.ts` — `authenticate`, `requireRole`, `requirePlan`, `optionalAuth`
- `src/routes/auth.routes.ts` — `/register`, `/login`, `/refresh`, `/logout`, `/me`
- Refresh tokens armazenados como hash SHA-256 no DB, com rotação automática
- Auth rate limit: 20 req/15min nos endpoints de auth

### API Routes (todas em `/api/v1/`)
- `/auth/*` — auth.routes.ts
- `/tenant/*` — tenants.routes.ts (info, update, users, stats)
- `/campaigns/*` — campaigns.routes.ts (CRUD completo)
- `/leads/*` — leads.routes.ts (CRUD + pipeline kanban)
- `/ops/*` — observability.routes.ts (health, metrics, audit-logs, db-stats)

### Validação
- `src/lib/validation.ts` — Zod v4 schemas para todos os inputs
- `formatZodError` usa `error.issues` (não `error.errors` — Zod v4 breaking change)

### Frontend — React Router
- `BrowserRouter` no main.tsx envolve toda a app
- `src/router/AppRouter.tsx` — rotas lazy-loaded: `/login`, `/register`, `/app/*`, `/`
- `src/pages/LoginPage.tsx` — login com brand split-panel
- `src/pages/RegisterPage.tsx` — registro 2 etapas (plano → dados)
- `src/pages/AppShell.tsx` — bridge entre router e App.tsx legado
- `src/components/ProtectedRoute.tsx` — guarda autenticação + RBAC
- `src/contexts/AuthContext.tsx` — estado de auth com localStorage persistence

### Stubs de Integração (ativam automaticamente com variáveis de ambiente)
- `src/services/stripe.service.ts` — STRIPE_SECRET_KEY
- `src/services/meta.service.ts` — META_ACCESS_TOKEN + META_AD_ACCOUNT_ID
- `src/services/google-ads.service.ts` — GOOGLE_ADS_DEVELOPER_TOKEN + CUSTOMER_ID
- `src/services/whatsapp.service.ts` — EVOLUTION_API_URL + EVOLUTION_API_KEY

### IA com Memória Persistente
- `src/services/ai-memory.service.ts` — salva interações no DB e injeta contexto histórico
- Endpoint `/api/v1/ai/agent` agora persiste cada interação e usa últimas 3 como contexto

### Testes
- `vitest.config.ts` com jsdom, @testing-library/react, coverage thresholds 60%
- `npm test` → 29 testes passando (auth, validation, AuthContext)
- Scripts: `npm test`, `npm run test:watch`, `npm run test:coverage`

## Quirks e Decisões

**Why Zod v4 usa `.issues`:**
- Zod v4 renomeou `ZodError.errors` → `ZodError.issues`. `formatZodError` usa `error.issues ?? error.errors` para compatibilidade.

**Why App.tsx não foi reescrito:**
- App.tsx tem 3922 linhas com toda a UI existente. A abordagem foi criar AppShell como bridge que passa props opcionais (`authUser`, `onNavigate`, `initialView`). A modularização completa do App.tsx ficou para fase posterior.

**Why stubs usam `IS_REAL` flag:**
- Permite testar a UI/UX sem credenciais reais, e ativar as integrações reais zero-config quando as variáveis de ambiente forem configuradas.

**Why seed no startup do servidor:**
- Garantia de que o usuário demo sempre existe em qualquer ambiente (dev/prod) sem necessidade de migration manual.
