import { TenantData, SocialPost, CRMLead, AdCampaign, SaaSPlan, AuditLog, MetricPoint } from "./types";

export const TENANTS: TenantData[] = [
  {
    id: "glow",
    name: "E-commerce Glow",
    niche: "Varejo & Cosméticos",
    followers: "48.2K",
    followersGrowth: "+12.4%",
    leads: "4,240",
    leadsGrowth: "+18.2%",
    conversionRate: "3.2%",
    conversionGrowth: "+0.8%",
    roi: "340%",
    roas: "4.2x",
    ctr: "2.8%",
    ctrGrowth: "+0.5%",
    reach: "184K",
    reachGrowth: "+24.3%",
    adSpend: "R$ 12.500",
    adConversions: "384",
    selectedPlan: "Plano Autogerenciamento",
    avatar: "💄"
  },
  {
    id: "stutz",
    name: "Stutz Imóveis",
    niche: "Alto Padrão & Real Estate",
    followers: "12.8K",
    followersGrowth: "+4.1%",
    leads: "890",
    leadsGrowth: "+25.4%",
    conversionRate: "1.4%",
    conversionGrowth: "+0.3%",
    roi: "820%",
    roas: "8.5x",
    ctr: "1.9%",
    ctrGrowth: "+0.2%",
    reach: "45K",
    reachGrowth: "+12.1%",
    adSpend: "R$ 28.000",
    adConversions: "64",
    selectedPlan: "Gestão Completa Custom",
    avatar: "🏢"
  },
  {
    id: "meliuz",
    name: "Méliuz SA",
    niche: "Corporate Fintech & Benefícios",
    followers: "340K",
    followersGrowth: "+6.8%",
    leads: "32,450",
    leadsGrowth: "+9.2%",
    conversionRate: "5.1%",
    conversionGrowth: "+1.3%",
    roi: "420%",
    roas: "3.9x",
    ctr: "3.4%",
    ctrGrowth: "+0.7%",
    reach: "1.2M",
    reachGrowth: "+16.5%",
    adSpend: "R$ 95.000",
    adConversions: "1,520",
    selectedPlan: "Nexora Enterprise",
    avatar: "💳"
  },
  {
    id: "nexora",
    name: "Agência Nexora Demo",
    niche: "Inbound Marketing & B2B SaaS",
    followers: "5.4K",
    followersGrowth: "+34.5%",
    leads: "380",
    leadsGrowth: "+42.1%",
    conversionRate: "4.8%",
    conversionGrowth: "+1.9%",
    roi: "280%",
    roas: "2.9x",
    ctr: "4.1%",
    ctrGrowth: "+1.5%",
    reach: "18.5K",
    reachGrowth: "+48.9%",
    adSpend: "R$ 4.500",
    adConversions: "48",
    selectedPlan: "Plano Básico Starter",
    avatar: "🌌"
  }
];

export const SAAS_PLANS: SaaSPlan[] = [
  {
    id: "basic",
    name: "Plano Starter",
    price: "R$ 197",
    period: "mês",
    description: "Ideal para profissionais liberais e marcas iniciantes testando os canais orgânicos primários com IA autônoma.",
    features: [
      "1 Canal Social Integrado",
      "Agendamento automatizado de posts",
      "IA para legendas e hashtags (Social Media Lite)",
      "Calendário de publicação unificado",
      "Análise simples de seguidores de 30 dias",
      "Suporte básico via e-mail"
    ]
  },
  {
    id: "premium",
    name: "Autogerenciamento Pro",
    price: "R$ 497",
    period: "mês",
    description: "Perfeito para negócios que querem automatizar seu crescimento digital e possuir todos os acessos do SaaS premium.",
    features: [
      "Canais Sociais Ilimitados",
      "Agendamento inteligente multilíngue",
      "Agentes de IA Completos (Copywriter, Analista, Tráfego)",
      "Gestão de anúncios e budgets integrados",
      "Funil e CRM integrado com Pipeline Kanban",
      "Integração WhatsApp Business API",
      "Dashboards avançados com exportação em PDF/Excel",
      "Suporte prioritário 24/7"
    ]
  },
  {
    id: "enterprise",
    name: "Gestão VIP Completa",
    price: "R$ 1.997",
    period: "mês",
    description: "Sua marca cuidada diretamente por engenheiros e especialistas em tráfego de alta escala do time Nexora.",
    features: [
      "Tudo do plano Pro incluso",
      "Gestão de tráfego orgânico & pago assistido",
      "Criação e execução de copies exclusivas com copywriters dedicados",
      "Integração avançada com n8n e Webhooks ilimitados",
      "Calibragem periódica de Pixels e Conversão Offline",
      "Reuniões de growth quinzenais",
      "Acordo SLA de 99.9% de uptime garantido",
      "Painel Master com multiusuários hierárquicos"
    ]
  }
];

export const INITIAL_POSTS: Record<string, SocialPost[]> = {
  glow: [
    {
      id: "post1",
      title: "Lançamento Nova Base Matte",
      platform: "instagram",
      scheduledTime: "2026-05-28T18:00:00Z",
      status: "scheduled",
      caption: "Descubra a nova base matte Glow que cuida da sua pele enquanto promove cobertura perfeita de toque seco por até 16h! 💄✨ Enriquecida com niacinamida para rejuvenescer seu rosto.",
      mediaUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80",
      hashtags: ["makeglow", "basematte", "belezafeminina", "skincaretips"]
    },
    {
      id: "post2",
      title: "Rotina Skin Care Rápida",
      platform: "tiktok",
      scheduledTime: "2026-05-29T10:30:00Z",
      status: "scheduled",
      caption: "Minha rotina de skin care matinal em menos de 1 minuto usando o tônico hidratante Glow! Fácil, rápido e com alto glow natural.",
      mediaUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80",
      hashtags: ["glowgirl", "tonicoorganico", "minhamesa", "videoviral"]
    },
    {
      id: "post3",
      title: "Inauguração Showroom",
      platform: "facebook",
      scheduledTime: "2026-05-25T14:00:00Z",
      status: "published",
      caption: "Nós abrimos novas portas! Venha nos visitar no showroom São Paulo e experimentar de perto todos os nossos produtos.",
      mediaUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&auto=format&fit=crop&q=80",
      hashtags: ["glowsaopaulo", "maquiagembrasileira", "beleza"]
    }
  ],
  stutz: [
    {
      id: "post4",
      title: "Cobertura nos Jardins",
      platform: "youtube",
      scheduledTime: "2026-05-28T20:00:00Z",
      status: "scheduled",
      caption: "Tour cinematográfico completo por essa mega cobertura triplex impecável nos Jardins, São Paulo. Piscina privativa e vista de tirar o fôlego! 🏢💎",
      mediaUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&auto=format&fit=crop&q=80",
      hashtags: ["jardins", "coberturadeluxo", "imobiliariadeluxo", "stutzimoveis"]
    },
    {
      id: "post5",
      title: "Como Avaliar um Imóvel",
      platform: "linkedin",
      scheduledTime: "2026-05-30T09:00:00Z",
      status: "scheduled",
      caption: "Quais os fatores que realmente valorizam um empreendimento corporativo? Analisamos o fluxo de transporte e certificações verdes.",
      mediaUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80",
      hashtags: ["mercadoimobiliario", "corporate", "investidores", "esg"]
    }
  ],
  meliuz: [
    {
      id: "post6",
      title: "Nova Campanha de Cashback",
      platform: "instagram",
      scheduledTime: "2026-05-28T12:00:00Z",
      status: "scheduled",
      caption: "Prepare-se para receber até 25% de reembolso nas maiores lojas parceiras do Brasil! Dinheiro de verdade direto no seu banco.",
      mediaUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&auto=format&fit=crop&q=80",
      hashtags: ["cashback", "meliuzsa", "economiadomestica", "financas"]
    }
  ]
};

export const INITIAL_LEADS: Record<string, CRMLead[]> = {
  glow: [
    {
      id: "l1",
      name: "Mariana Alencar",
      email: "mari.alencar@gmail.com",
      phone: "+55 (11) 98212-3211",
      status: "fechado",
      value: 320,
      lastInteraction: "Ontem às 18:30",
      notes: "Comprou após recomendação de influencer do Instagram Reels."
    },
    {
      id: "l2",
      name: "Paula Santos",
      email: "paulas@hotmail.com",
      phone: "+55 (19) 99120-1144",
      status: "proposta",
      value: 1200,
      lastInteraction: "Hoje às 14:15",
      notes: "Demonstrou interesse em revender no varejo de salão em Campinas."
    },
    {
      id: "l3",
      name: "Juliana Mendes",
      email: "ju.mendes@uol.com.br",
      phone: "+55 (21) 97123-5566",
      status: "contato",
      value: 450,
      lastInteraction: "26 de Mai às 11:00",
      notes: "Clicou no link do WhatsApp do anúncio de Conversão Organica."
    },
    {
      id: "l4",
      name: "Bruna Oliveira",
      email: "bruna.oli@gmail.com",
      phone: "+55 (31) 98144-2233",
      status: "novo",
      value: 180,
      lastInteraction: "Há 40 minutos",
      notes: "Lead capturado via formulário do TikTok Ads - Cupom de Boas Vindas."
    }
  ],
  stutz: [
    {
      id: "l5",
      name: "Dr. Carlos Eduardo",
      email: "eduardo.carlos@cardiologia.adv.br",
      phone: "+55 (11) 98111-4433",
      status: "proposta",
      value: 4500000,
      lastInteraction: "Ontem às 15:40",
      notes: "Interessado na cobertura Jardins. Proposta de financiamento em análise bancária."
    },
    {
      id: "l6",
      name: "Marcos Vianna",
      email: "marcos@vianna holdings.com",
      phone: "+55 (11) 99121-8899",
      status: "contato",
      value: 11000000,
      lastInteraction: "25 de Mai",
      notes: "Investidor de imóveis comerciais AAA. Agendando visita física com gerente sênior."
    }
  ]
};

export const INITIAL_CAMPAIGNS: Record<string, AdCampaign[]> = {
  glow: [
    {
      id: "c1",
      name: "Glow Base Matte - Conversão BR",
      platform: "meta",
      budget: 8500,
      status: "active",
      spend: 4200,
      clicks: 12840,
      leads: 320,
      roas: 4.8
    },
    {
      id: "c2",
      name: "Google Search - Maquiagem Orgânica",
      platform: "google",
      budget: 4000,
      status: "active",
      spend: 1800,
      clicks: 3450,
      leads: 94,
      roas: 3.5
    },
    {
      id: "c3",
      name: "TikTok - Vídeos Virais Glow",
      platform: "tiktok",
      budget: 2500,
      status: "paused",
      spend: 2500,
      clicks: 18900,
      leads: 184,
      roas: 2.9
    }
  ],
  stutz: [
    {
      id: "c4",
      name: "Meta Leads - Cobertura Jardins",
      platform: "meta",
      budget: 15000,
      status: "active",
      spend: 9200,
      clicks: 4320,
      leads: 142,
      roas: 12.1
    },
    {
      id: "c5",
      name: "Google Search - Imóvel Luxo SP",
      platform: "google",
      budget: 13000,
      status: "active",
      spend: 6400,
      clicks: 2100,
      leads: 58,
      roas: 6.8
    }
  ]
};

export const INITIAL_METRICS: Record<string, MetricPoint[]> = {
  glow: [
    { date: "21 Mai", engajamento: 1200, conversões: 45, cliques: 320, leads: 22, custo: 420 },
    { date: "22 Mai", engajamento: 1450, conversões: 52, cliques: 380, leads: 31, custo: 510 },
    { date: "23 Mai", engajamento: 2200, conversões: 68, cliques: 590, leads: 48, custo: 680 },
    { date: "24 Mai", engajamento: 1900, conversões: 61, cliques: 440, leads: 39, custo: 580 },
    { date: "25 Mai", engajamento: 3100, conversões: 94, cliques: 810, leads: 74, custo: 920 },
    { date: "26 Mai", engajamento: 2800, conversões: 88, cliques: 740, leads: 66, custo: 840 },
    { date: "27 Mai", engajamento: 3400, conversões: 112, cliques: 930, leads: 87, custo: 1150 }
  ],
  stutz: [
    { date: "21 Mai", engajamento: 210, conversões: 3, cliques: 110, leads: 8, custo: 820 },
    { date: "22 Mai", engajamento: 240, conversões: 4, cliques: 130, leads: 12, custo: 1040 },
    { date: "23 Mai", engajamento: 190, conversões: 2, cliques: 95, leads: 6, custo: 780 },
    { date: "24 Mai", engajamento: 310, conversões: 6, cliques: 180, leads: 18, custo: 1560 },
    { date: "25 Mai", engajamento: 450, conversões: 9, cliques: 250, leads: 28, custo: 2100 },
    { date: "26 Mai", engajamento: 380, conversões: 8, cliques: 210, leads: 21, custo: 1800 },
    { date: "27 Mai", engajamento: 520, conversões: 12, cliques: 310, leads: 34, custo: 2600 }
  ]
};

export const GLOBAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log1",
    user: "lughbier@gmail.com",
    action: "Campanha criada: 'Glow Base Matte - Conversão BR'",
    tenant: "E-commerce Glow",
    timestamp: "2026-05-27T22:30:14Z",
    status: "success"
  },
  {
    id: "log2",
    user: "sistema.automacao",
    action: "Post agendado enviado com sucesso para Instagram",
    tenant: "E-commerce Glow",
    timestamp: "2026-05-27T18:00:22Z",
    status: "success"
  },
  {
    id: "log3",
    user: "marcos.gerente",
    action: "Envio de proposta para Dr. Carlos Eduardo",
    tenant: "Stutz Imóveis",
    timestamp: "2026-05-27T15:40:00Z",
    status: "success"
  },
  {
    id: "log4",
    user: "chatbot.ia",
    action: "Iniciou conversa automática WhatsApp com Paula Santos",
    tenant: "E-commerce Glow",
    timestamp: "2026-05-27T14:15:33Z",
    status: "success"
  },
  {
    id: "log5",
    user: "billing.stripe",
    action: "Cobrança mensal processada: Plano Autogerenciamento",
    tenant: "E-commerce Glow",
    timestamp: "2026-05-26T00:00:00Z",
    status: "success"
  },
  {
    id: "log6",
    user: "suporte.admin",
    action: "Upgrade de plano solicitado - Sucesso",
    tenant: "Méliuz SA",
    timestamp: "2026-05-24T11:22:10Z",
    status: "warning"
  }
];
