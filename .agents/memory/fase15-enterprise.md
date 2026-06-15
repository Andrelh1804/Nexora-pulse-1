---
name: Fase 1.5 Enterprise Architecture
description: Estrutura DDD enterprise implementada — lib, contexts, domains, repositories.
---

## Estrutura implementada

**src/lib/** — Infraestrutura core (zero dependências externas):
- `eventBus.ts` — Pub/sub tipado com `NexoraEventMap` (27 eventos). Usa `Record<string, any[]>` internamente para evitar constraint genérica complexa do TS.
- `featureFlags.ts` — Feature flags por plano (basic/premium/enterprise). Singleton `featureFlags`.
- `moduleGateway.ts` — Controle de acesso por papel + plano. Singleton `moduleGateway`.
- `auditLogger.ts` — Audit log in-memory (até 2000 entradas), emite eventos no eventBus. Singleton `auditLogger`.
- `logger.ts` — Structured logging com níveis. Singleton `logger`.
- `queue.ts` — Fila in-memory com retry, prioridade, processadores. Singleton `queue`.
- `storage.ts` — Abstração de storage com buckets. Singleton `storageService`.

**src/contexts/** — React Contexts (wrappam lib/ para uso no frontend):
- `TenantContext.tsx` — `TenantProvider` (userId prop) + `useTenant()`. Mapeia tenantId → PlanTier.
- `NotificationContext.tsx` — `NotificationProvider` + `useNotifications()`. Toast com auto-dismiss 4.5s.
- `ThemeContext.tsx` — `ThemeProvider` (tenantId prop) + `useTheme()`. 4 presets: nexora, midnight, emerald, amber.

**src/domains/** — Bounded Contexts DDD:
- `auth/` — AuthDomain com login/logout/register (mock). Emite user.login, user.logout events.
- `billing/` — BillingDomain com trial/paid subscriptions. Cálculo de MRR.
- `tenants/` — TenantsDomain com configurações + white-label por tenant.
- `marketing/` — MarketingDomain com calendar de conteúdo e performance summaries.
- `crm/` — CRMDomain usa leadRepository. Pipeline Kanban. Mensagens WhatsApp.
- `ai/` — AIDomain faz fetch para /api/v1/ai/agent. Memória de interações por agente.
- `automation/` — AutomationDomain com workflows nó-a-nó. Execuções enfileiradas.
- `content/` — ContentDomain com assets, sites, creatives. Usa storageService.
- `marketplace/` — MarketplaceDomain com 5 itens seed. Compras + publicação de itens.

**src/repositories/** — Repository pattern (in-memory, pronto para PostgreSQL):
- Interfaces `BaseRepository<T>` e `TenantScoped<T>` em `index.ts`.
- `leadRepository`, `campaignRepository`, `auditLogRepository` — seeded de data.ts.

## Wiring no main.tsx
```tsx
<TenantProvider userId="demo-user-001">
  <ThemeProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ThemeProvider>
</TenantProvider>
```

## Why
Fase 1.5 do roadmap: transformar protótipo em arquitetura enterprise sem quebrar funcionalidades existentes. Todas as implementações são in-memory, prontas para swap com PostgreSQL/Redis/S3.
