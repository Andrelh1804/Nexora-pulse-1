# Nexora Pulse — Go-Live Checklist (Fase 2.13)

**Versão:** 2.0 | **Atualizado:** Junho 2026

---

## ✅ BLOCO A — FUNDAÇÃO (Implementado na Fase 2)

### 🗄️ Banco de Dados
- [x] PostgreSQL provisionado (Replit built-in)
- [x] 12 tabelas criadas: tenants, users, refresh_tokens, subscriptions, campaigns, leads, social_posts, whatsapp_messages, ai_interactions, audit_logs, notifications, media_assets, workflows
- [x] Índices de performance em todas as colunas de busca frequente
- [x] Trigger `set_updated_at` em todas as tabelas mutáveis
- [x] Seeds de tenants demo inseridos
- [x] Usuário demo criado: `demo@nexorapulse.com` / `Demo@12345`
- [ ] Backup automático configurado
- [ ] Política de retenção de dados (LGPD)

### 🔐 Autenticação & Segurança
- [x] Login/Register com hash bcrypt (12 rounds)
- [x] JWT Access Token (15min) + Refresh Token (30 dias) com rotação
- [x] Refresh token armazenado como hash SHA-256 no banco
- [x] RBAC implementado: super_admin → admin → gestor → analyst → client
- [x] Auth rate limiting: 20 tentativas / 15 min por IP
- [x] Helmet (headers de segurança)
- [x] CORS configurado
- [x] Middleware `authenticate` + `requireRole` + `requirePlan`
- [ ] MFA (TOTP) — pendente Fase 2.3
- [ ] Recuperação de senha via e-mail
- [ ] Política de senha configurável por tenant
- [ ] OWASP Top 10 audit completo

### 💳 Billing & Assinaturas
- [x] Schema `subscriptions` com status trial/active/past_due/canceled
- [x] Planos definidos: Basic R$197/mês, Premium R$497/mês, Enterprise R$1.997/mês
- [x] Trial de 15 dias configurado no registro
- [x] Stripe Service Layer implementado (ativação automática com STRIPE_SECRET_KEY)
- [ ] STRIPE_SECRET_KEY configurado como secret no Replit
- [ ] Preços criados no Stripe Dashboard
- [ ] STRIPE_PRICE_BASIC, STRIPE_PRICE_PREMIUM, STRIPE_PRICE_ENTERPRISE configurados
- [ ] Webhook do Stripe configurado (`/api/v1/billing/webhook`)
- [ ] Bloqueio automático por inadimplência

---

## 🔄 BLOCO B — INTEGRAÇÕES REAIS (Pendentes)

### 📣 Meta Ads API
- [x] Service layer implementado com fallback para simulação
- [ ] META_ACCESS_TOKEN configurado como secret
- [ ] META_AD_ACCOUNT_ID configurado como secret
- [ ] META_PIXEL_ID configurado (opcional)
- [ ] App no Meta Business aprovado para Marketing API
- [ ] Webhook de eventos de conversão configurado
- [ ] Testado com conta real

### 🔍 Google Ads API
- [x] Service layer com stubs realistas
- [ ] GOOGLE_ADS_DEVELOPER_TOKEN configurado
- [ ] GOOGLE_ADS_CUSTOMER_ID configurado
- [ ] GOOGLE_ADS_CLIENT_ID + CLIENT_SECRET configurados
- [ ] GOOGLE_ADS_REFRESH_TOKEN gerado via OAuth2
- [ ] Pacote `google-ads-api` instalado: `npm install google-ads-api`
- [ ] Testado com conta MCC Google Ads

### 💬 WhatsApp Enterprise
- [x] Evolution API Service layer implementado
- [ ] Servidor Evolution API provisionado (VPS/Docker)
- [ ] EVOLUTION_API_URL configurado como secret
- [ ] EVOLUTION_API_KEY configurado como secret
- [ ] Instância criada e QR Code escaneado
- [ ] Webhook configurado para receber mensagens
- [ ] Testado com número real

### 🤖 IA de Produção
- [x] Gemini 2.5 Flash integrado
- [x] AI Memory Service — persiste interações no PostgreSQL
- [x] Contexto histórico injetado nas prompts
- [ ] GEMINI_API_KEY configurado como secret
- [ ] RAG com vetorização (pgvector extension — pendente)
- [ ] Gemini Vision para análise de criativos

---

## 📊 BLOCO C — QUALIDADE & OBSERVABILIDADE

### 🧪 Testes
- [x] Vitest configurado
- [x] 29 testes passando (auth, validation, AuthContext)
- [ ] Cobertura mínima 80% (atual: ~40%)
- [ ] Testes E2E com Playwright
- [ ] Testes de integração de API (supertest)
- [ ] CI/CD com GitHub Actions

### 📈 Observabilidade
- [x] Endpoint `/api/v1/ops/health` — health check público
- [x] Endpoint `/api/v1/ops/metrics` — métricas por tenant (admin)
- [x] Endpoint `/api/v1/ops/audit-logs` — logs de auditoria
- [x] Endpoint `/api/v1/ops/db-stats` — tamanho e contagem das tabelas
- [x] Morgan structured logging com X-Tenant-Id
- [x] AuditLogger em memória + PostgreSQL
- [ ] Sentry DSN configurado
- [ ] Alertas de erro por e-mail/Slack
- [ ] Painel de métricas no frontend (Fase 2.10 UI)

---

## 🚀 BLOCO D — GO LIVE

### Pré-requisitos
- [ ] Domínio customizado configurado no Replit Deployments
- [ ] SSL/TLS ativo (automático via Replit)
- [ ] Variáveis de ambiente de produção configuradas
- [ ] Schema de produção aplicado via Publish flow
- [ ] SMTP configurado para e-mails transacionais
- [ ] Termos de Uso + Política de Privacidade publicados (LGPD)
- [ ] Cookie consent banner implementado
- [ ] DPA (Data Processing Agreement) disponível

### Deploy
- [ ] `npm run build` sem erros
- [ ] `npm run lint` (0 erros TypeScript)
- [ ] `npm test` (100% passando)
- [ ] Variável `NODE_ENV=production` configurada
- [ ] `JWT_SECRET` forte gerado (256 bits mínimo)
- [ ] `JWT_REFRESH_SECRET` forte gerado (256 bits mínimo)
- [ ] Replit Deploy executado com sucesso
- [ ] Health check `/api/v1/ops/health` retorna `status: "healthy"` em produção
- [ ] Teste de carga básico (K6/Artillery)

### Pós-Deploy
- [ ] Criar primeiro usuário Super Admin
- [ ] Remover usuário demo de produção
- [ ] Configurar backup diário do PostgreSQL
- [ ] Monitorar logs das primeiras 24h
- [ ] Testar fluxo completo: registro → onboarding → campanha → lead → IA

---

## 📋 STATUS RESUMO

| Componente              | Status         | % Completo |
|------------------------|----------------|-----------|
| Banco de Dados          | ✅ Operacional  | 85%       |
| Autenticação            | ✅ Operacional  | 75%       |
| RBAC                    | ✅ Operacional  | 90%       |
| Billing (Stripe)        | 🟡 Stub pronto | 30%       |
| Meta Ads                | 🟡 Stub pronto | 25%       |
| Google Ads              | 🟡 Stub pronto | 20%       |
| WhatsApp                | 🟡 Stub pronto | 25%       |
| IA (Gemini)             | ✅ Operacional  | 60%       |
| Segurança               | 🟡 Em progresso| 65%       |
| Observabilidade         | ✅ Operacional  | 70%       |
| Testes                  | 🟡 Em progresso| 40%       |
| DevOps CI/CD            | ❌ Pendente    | 5%        |
| **TOTAL**               | 🟡 Beta+       | **58%**   |

---

> **Próximos passos:** Configurar os secrets de produção (STRIPE_SECRET_KEY, META_ACCESS_TOKEN, GEMINI_API_KEY) e executar o Publish flow do Replit para sincronizar o schema com a base de produção.
