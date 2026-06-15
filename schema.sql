-- Nexora Pulse Database Schema

-- TENANTS
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  niche VARCHAR(100),
  plan VARCHAR(20) NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'premium', 'enterprise')),
  status VARCHAR(20) NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'suspended', 'cancelled')),
  logo_url TEXT,
  custom_domain VARCHAR(255),
  primary_color VARCHAR(10) DEFAULT '#7C3AED',
  timezone VARCHAR(100) DEFAULT 'America/Sao_Paulo',
  language VARCHAR(10) DEFAULT 'pt-BR',
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('super_admin', 'admin', 'gestor', 'analyst', 'client')),
  avatar_url TEXT,
  phone VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- REFRESH TOKENS
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL DEFAULT 'basic',
  status VARCHAR(20) NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'past_due', 'cancelled')),
  amount_brl NUMERIC(10, 2),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LEADS (CRM)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  company VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'contato', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido')),
  source VARCHAR(50),
  value NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CAMPAIGNS (Traffic Manager)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended', 'draft')),
  budget NUMERIC(12, 2) DEFAULT 0,
  spend NUMERIC(12, 2) DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  roas NUMERIC(6, 2) DEFAULT 0,
  ctr NUMERIC(6, 4) DEFAULT 0,
  cpc NUMERIC(8, 2) DEFAULT 0,
  cpl NUMERIC(8, 2) DEFAULT 0,
  objective VARCHAR(100),
  audience TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SOCIAL POSTS
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  engagement_likes INTEGER DEFAULT 0,
  engagement_comments INTEGER DEFAULT 0,
  engagement_shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WHATSAPP MESSAGES
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  phone VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  direction VARCHAR(10) NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR(20) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  media_url TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI INTERACTIONS (Memory)
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  agent_type VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT,
  model VARCHAR(100) DEFAULT 'gemini-2.5-flash',
  tokens_used INTEGER DEFAULT 0,
  processing_ms INTEGER DEFAULT 0,
  is_simulated BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failed', 'timeout')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  user_id UUID,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  resource_id VARCHAR(255),
  details JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'success',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_tenant_id ON social_posts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_tenant_id ON whatsapp_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_tenant_agent ON ai_interactions(tenant_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

-- SEED DEMO TENANT (for demo user in server.ts)
INSERT INTO tenants (id, slug, name, plan, status)
VALUES ('00000000-0000-0000-0000-000000000004', 'demo-nexora', 'Agência Nexora Demo', 'enterprise', 'active')
ON CONFLICT (id) DO NOTHING;
