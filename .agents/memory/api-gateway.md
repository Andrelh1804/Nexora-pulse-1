---
name: API Gateway Pattern
description: server.ts refatorado com versioning /api/v1/, helmet, rate-limit, morgan.
---

## Configuração atual

**Prefixo**: `/api/v1/` (router separado montado no app)

**Middleware stack (ordem importante)**:
1. `helmet()` — headers de segurança (CSP desativado para compatibilidade com Vite)
2. `express.json({ limit: "2mb" })`
3. `morgan` — structured logging com token `:tenant` (header `X-Tenant-Id`)
4. `rateLimit` global: 300 req/15min no `API_PREFIX/`
5. `rateLimit` AI: 20 req/min no `API_PREFIX/ai/`
6. CORS manual — permite qualquer origem em dev (sem cors package)
7. Request ID middleware — injeta `X-Request-Id` em todas as responses

**Rotas v1**:
- `GET /api/v1/health` — status do servidor + features habilitadas
- `GET /api/v1/status` — info do processo
- `POST /api/v1/ai/agent` — agentes Gemini (com fallback simulado)
- `GET /api/v1/tenants` — lista de tenants
- `GET /api/v1/marketplace/items` — marketplace stub
- `GET /api/v1/features/:plan` — feature flags por plano

**Compatibilidade legada**: `/api/gemini/agent` redireciona internamente para `/api/v1/ai/agent` (App.tsx pode continuar usando o endpoint antigo sem quebrar).

**Why**: Versionamento /api/v1/ permite evoluir a API sem quebrar clientes existentes. Rate limiting protege contra abuso dos endpoints de IA. Morgan com token de tenant facilita debugging por cliente.

**How to apply**: Ao adicionar novas rotas, sempre adicionar no `router` (não no `app` diretamente) para herdar os middlewares de rate-limit e logging.
