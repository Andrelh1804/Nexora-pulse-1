import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  TrendingUp,
  Bot,
  Zap,
  Megaphone,
  Users,
  ShoppingBag,
  Sliders,
  ShieldAlert,
  DollarSign,
  Calendar,
  Send,
  CheckCircle,
  Download,
  Award,
  Star,
  Clock,
  Globe,
  LineChart,
  Play,
  Plus,
  ArrowRight,
  MessageSquare,
  Check,
  ChevronRight,
  Mail,
  Building,
  Phone,
  User,
  ExternalLink,
  Briefcase,
  Layers,
  Sparkles,
  Search,
  BookOpen,
  Eye,
  Settings
} from "lucide-react";
import NexoraLogo from "./NexoraLogo";
// @ts-ignore
import nexoraLogoImg from "../assets/images/nexora_logo_new.png";

interface NexoraLandingPageProps {
  onAccessApp: () => void;
  addXP?: (amount: number, reason: string) => void;
}

export default function NexoraLandingPage({ onAccessApp, addXP }: NexoraLandingPageProps) {
  // Navigation scrolling state
  const [activeSection, setActiveSection] = useState<string>("inicio");
  
  // Platform Interactive Preview Tab
  const [plataformaActiveTab, setPlataformaActiveTab] = useState<"dashboard" | "crm" | "trafego" | "ia">("dashboard");

  // Portfolio Active Tag Filter
  const [portfolioFilter, setPortfolioFilter] = useState<string>("all");

  // Pricing Billings Toggle
  const [billingCycle, setBillingCycle] = useState<"mensal" | "anual">("mensal");

  // Blog Category Selector
  const [blogCategory, setBlogCategory] = useState<string>("all");

  // Live Contact Form State
  const [formData, setFormData] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    segmento: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  // Selected Service Detail Modal
  const [selectedService, setSelectedService] = useState<{
    id: string;
    title: string;
    desc: string;
    fullText: string;
    metrics: string;
    conversionRate: string;
    icon: any;
  } | null>(null);

  const handleScrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (addXP) {
      addXP(5, `Navegou para a seção: ${id.toUpperCase()}`);
    }
  };

  const services = [
    {
      id: "agencia",
      title: "Agência Digital",
      desc: "Estratégias digitais completas para empresas que desejam crescer de forma inteligente.",
      fullText: "Criamos ecossistemas digitais robustos integrando branding, SEO técnico de alta conversão, e-commerce headless e funis de marketing personalizados para liderar seu nicho.",
      metrics: "Posicionamento orgânico +140%",
      conversionRate: "4.8% média nacional",
      icon: Layers
    },
    {
      id: "trafego",
      title: "Tráfego Pago",
      desc: "Campanhas otimizadas com foco em ROI, conversão e escala de resultados.",
      fullText: "Gerenciamos múltiplos canais (Meta Ads, Google Ads, TikTok Ads) com pixels inteligentes proprietários, lances preditivos e calibração de público baseada em inteligência artificial.",
      metrics: "ROAS Médio de 4.20x",
      conversionRate: "Escala exponencial de orçamento",
      icon: TrendingUp
    },
    {
      id: "sites",
      title: "Criação de Sites",
      desc: "Websites modernos, rápidos e desenvolvidos para converter visitantes em clientes.",
      fullText: "Nossa engenharia foca em carregamento abaixo de 1s (Next.js 15), escores perfeitos no Lighthouse e interfaces ultra fluidas ricas em micro interações premium que vendem por si só.",
      metrics: "Velocidade de renderização < 0.8s",
      conversionRate: "Aumento de até 40% nas conversões",
      icon: Globe
    },
    {
      id: "automacao",
      title: "Automação & IA",
      desc: "Automatizamos processos utilizando inteligência artificial para acelerar performance e produtividade.",
      fullText: "Criamos agentes autônomos que interpretam fluxos de e-mail, organizam processos internos na nuvem de dados e tomam decisões autônomas reduzindo custos em até 65%.",
      metrics: "Eficiência operacional de 95%",
      conversionRate: "Chatbots de resposta imediata",
      icon: Zap
    },
    {
      id: "crm",
      title: "CRM & WhatsApp",
      desc: "Centralize leads, atendimento e automações em um único ambiente inteligente.",
      fullText: "Integre disparos em massa personalizados sob demanda, transição humanizada para chatbots IA inteligentes da Evolution e funis que não deixam nenhum lead esfriar de madrugada.",
      metrics: "Redução no tempo de resposta: -82%",
      conversionRate: "Acompanhamento omnichannel ativo",
      icon: MessageSquare
    },
    {
      id: "performance",
      title: "Analytics & Performance",
      desc: "Dashboards inteligentes e análises avançadas para decisões orientadas por dados.",
      fullText: "Centralizamos métricas fragmentadas e geramos relatórios unificados dinâmicos com inteligência preditiva para que você saiba exatamente onde investir seu próximo real de tráfego.",
      metrics: "Transparência de dados: 100%",
      conversionRate: "Insights baseados em dados reais",
      icon: Activity
    }
  ];

  const categories = ["all", "IA", "Marketing Digital", "Automação", "Growth", "Performance", "SaaS"];

  const blogPosts = [
    {
      id: 1,
      title: "Como a Inteligência Artificial está transformando o marketing moderno",
      excerpt: "Descubra como algoritmos preditivos e escrita heurística estão alterando a taxa de conversão das maiores agências do mundo.",
      category: "IA",
      date: "Maio 28, 2026",
      readTime: "5 min de leitura",
      imageText: "IA"
    },
    {
      id: 2,
      title: "Automação avançada de WhatsApp para escalar conversões",
      excerpt: "O passo a passo para conectar chatbots humanizados com funis integrados de CRM que respondem e qualificam leads em segundos.",
      category: "Automação",
      date: "Maio 20, 2026",
      readTime: "7 min de leitura",
      imageText: "CRM"
    },
    {
      id: 3,
      title: "Como aumentar o ROAS real usando calibração de público por IA",
      excerpt: "Parâmetros técnicos para mapear comportamentos de compra de alto padrão e evitar esparramar orçamento em criativos saturados.",
      category: "Growth",
      date: "Maio 15, 2026",
      readTime: "6 min de leitura",
      imageText: "ROI"
    },
    {
      id: 4,
      title: "Estratégias modernas de tráfego pago para lançamentos B2B",
      excerpt: "Como hackear o algoritmo do LinkedIn e casar com campanhas coordenadas de Meta Ads para alcançar tomadores de decisão corporativos.",
      category: "Performance",
      date: "Maio 08, 2026",
      readTime: "8 min de leitura",
      imageText: "B2B"
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.telefone) return;

    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setFormSubmitted(true);
      if (addXP) {
        addXP(50, "Lead captado: Falar com especialista Nexora");
      }
    }, 1500);
  };

  return (
    <div className="bg-[#030303] text-slate-100 min-h-screen overflow-x-hidden relative font-sans selection:bg-purple-600 selection:text-white pb-0">
      
      {/* GLOWING AMBIENT BACKGROUNDS */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-purple-950/20 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-pink-950/20 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[200px] pointer-events-none z-0" />

      {/* ================= HEADER FIXO PREMIUM ================= */}
      <header className="fixed top-0 left-0 w-full h-20 border-b border-white/5 bg-black/60 backdrop-blur-xl flex items-center justify-between px-6 md:px-12 z-50">
        <div className="cursor-pointer" onClick={() => handleScrollTo("inicio")} id="site-header-brand-logo">
          <NexoraLogo size="header" />
        </div>

        {/* Desktop Menu Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <button
            onClick={() => handleScrollTo("inicio")}
            className={`transition-colors hover:text-[#EC4899] ${activeSection === "inicio" ? "text-purple-400 font-bold border-b border-purple-500/80 pb-1" : ""}`}
            id="nav-btn-inicio"
          >
            Início
          </button>
          
          <button
            onClick={() => handleScrollTo("servicos")}
            className={`transition-colors hover:text-[#EC4899] ${activeSection === "servicos" ? "text-purple-400 font-bold border-b border-purple-500/80 pb-1" : ""}`}
            id="nav-btn-servicos"
          >
            Serviços
          </button>

          <button
            onClick={() => handleScrollTo("plataforma")}
            className={`transition-colors hover:text-[#EC4899] ${activeSection === "plataforma" ? "text-purple-400 font-bold border-b border-purple-500/80 pb-1" : ""}`}
            id="nav-btn-plataforma"
          >
            Plataforma
          </button>

          <button
            onClick={() => handleScrollTo("portfolio")}
            className={`transition-colors hover:text-[#EC4899] ${activeSection === "portfolio" ? "text-purple-400 font-bold border-b border-purple-500/80 pb-1" : ""}`}
            id="nav-btn-portfolio"
          >
            Portfólio
          </button>

          <button
            onClick={() => handleScrollTo("sobre")}
            className={`transition-colors hover:text-[#EC4899] ${activeSection === "sobre" ? "text-purple-400 font-bold border-b border-purple-500/80 pb-1" : ""}`}
            id="nav-btn-sobre"
          >
            Sobre Nós
          </button>

          <button
            onClick={() => handleScrollTo("blog")}
            className={`transition-colors hover:text-[#EC4899] ${activeSection === "blog" ? "text-purple-400 font-bold border-b border-purple-500/80 pb-1" : ""}`}
            id="nav-btn-blog"
          >
            Blog
          </button>

          <button
            onClick={() => handleScrollTo("planos")}
            className={`transition-colors hover:text-[#EC4899] ${activeSection === "planos" ? "text-purple-400 font-bold border-b border-purple-500/80 pb-1" : ""}`}
            id="nav-btn-planos"
          >
            Planos
          </button>

          <button
            onClick={() => handleScrollTo("contato")}
            className={`transition-colors hover:text-[#EC4899] ${activeSection === "contato" ? "text-purple-400 font-bold border-b border-purple-500/80 pb-1" : ""}`}
            id="nav-btn-contato"
          >
            Contato
          </button>
        </nav>

        {/* CTA Acessar App Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onAccessApp}
            className="relative px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-800 to-[#EC4899] text-xs font-black tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_20px_rgba(236,72,153,0.30)] hover:shadow-[0_0_30px_rgba(236,72,153,0.50)] border border-white/20 text-white flex items-center gap-2"
            id="site-access-app-header-btn"
          >
            <span>Acessar App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Spacer for sticky header */}
      <div className="h-20" />

      {/* ================= 1. INÍCIO / HERO SECTION ================= */}
      <section id="inicio" className="relative min-h-[calc(100vh-80px)] xl:min-h-screen py-12 md:py-24 px-6 md:px-12 xl:px-24 flex items-center z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-6 space-y-6 text-left" id="hero-left-col">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 bg-[#12081f] border border-purple-500/30 rounded-full px-4.5 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#EC4899] shadow-[0_0_15px_rgba(236,72,153,0.15)] animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>TECNOLOGIA • CRIATIVIDADE • RESULTADOS</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.1] font-sans">
              Soluções digitais com foco em <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 drop-shadow-[0_2px_15px_rgba(236,72,153,0.2)]">resultados reais.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl font-light">
              Transformamos tecnologia, inteligência artificial e automação em crescimento escalável para empresas modernas.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={onAccessApp}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-900 to-[#EC4899] text-xs font-extrabold tracking-widest uppercase text-white hover:scale-[1.03] transition-all shadow-[0_10px_35px_-10px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2"
                id="hero-cta-app"
              >
                <span>Conheça a Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleScrollTo("portfolio")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-extrabold tracking-widest uppercase text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 hover:border-purple-500/40"
                id="hero-cta-portfolio"
              >
                <span>Ver Portfólio</span>
                <Play className="w-3.5 h-3.5 text-purple-400" />
              </button>
            </div>

            {/* Social Proof Avatars */}
            <div className="pt-8 flex items-center gap-4 border-t border-white/5" id="hero-social-proof">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-purple-950 flex items-center justify-center text-xs font-bold font-mono">👤</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-pink-950 flex items-center justify-center text-xs font-bold font-mono">💄</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-950 flex items-center justify-center text-xs font-bold font-mono">🏢</div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-gradient-to-r from-purple-900 to-pink-900 flex items-center justify-center text-xs font-extrabold font-mono text-purple-200">+50</div>
              </div>
              <div>
                <p className="text-xs font-bold text-white tracking-wide font-sans">+50 empresas impulsionadas</p>
                <p className="text-[10px] text-slate-500 font-mono">com sucesso pela Nexora Pulse</p>
              </div>
            </div>
          </div>

          {/* Right Column Interactive Dashboard Preview & Astronaut Visual */}
          <div className="lg:col-span-6 relative flex justify-center" id="hero-right-col">
            
            {/* Ambient Background Grid and glows */}
            <div className="absolute inset-x-0 top-12 bottom-12 bg-gradient-to-tr from-purple-500/10 to-pink-500/5 blur-3xl rounded-[3rem] -z-10" />

            {/* Simulated Glass Dashboard Mockup (Matching user reference layout) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-xl bg-slate-950/80 border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-md relative"
              id="hero-dashboard-mockup"
            >
              
              {/* Dashboard Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 text-[10px] text-white/40 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-slate-500 font-sans ml-2">Visão Geral - Nexora Pulse Panel v1.4</span>
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded text-white/55">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-ping mr-1"></span>
                  <span>LIVE CONEXÃO</span>
                </div>
              </div>

              {/* Mockup KPIs grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5 text-left">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 hover:border-purple-500/30 transition-all">
                  <span className="text-[9px] text-[#EC4899] font-bold uppercase tracking-wider font-mono">Receita</span>
                  <p className="text-base font-black text-white mt-1">R$ 98.540</p>
                  <span className="text-[9px] text-emerald-400 font-medium font-mono inline-block mt-0.5">+18,6% vs mês anterior</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 hover:border-purple-500/30 transition-all">
                  <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider font-mono">Investimento</span>
                  <p className="text-base font-black text-white mt-1">R$ 23.850</p>
                  <span className="text-[9px] text-emerald-400 font-medium font-mono inline-block mt-0.5">+12,5% vs mês anterior</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 hover:border-purple-500/30 transition-all">
                  <span className="text-[9px] text-[#EC4899] font-bold uppercase tracking-wider font-mono">ROAS</span>
                  <p className="text-base font-black text-white mt-1">4,12</p>
                  <span className="text-[9px] text-emerald-400 font-medium font-mono inline-block mt-0.5">+22,1% vs mês anterior</span>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 hover:border-purple-500/30 transition-all">
                  <span className="text-[9px] text-purple-400 font-bold uppercase tracking-wider font-mono">Nexora AI</span>
                  <p className="text-base font-black text-white mt-1">1.250</p>
                  <span className="text-[9px] text-[#EC4899] font-extrabold font-mono inline-block mt-0.5">92 Excelente Score</span>
                </div>
              </div>

              {/* Chart Mockup with Neon Line Graph */}
              <div className="bg-black/60 border border-white/5 rounded-2xl p-4.5 text-left relative overflow-hidden" id="hero-mini-chart">
                <div className="flex items-center justify-between mb-4.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-sans">Desempenho das Campanhas</span>
                  <div className="flex gap-1.5">
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-purple-900/40 text-purple-200 border border-purple-800/20 font-mono">7D</span>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-gradient-to-r from-purple-800 to-[#EC4899] text-white font-mono">30D</span>
                    <span className="text-[8px] font-medium px-2 py-0.5 rounded text-white/50 font-mono">3M</span>
                  </div>
                </div>

                {/* SVG glowing chart line */}
                <div className="h-32 flex items-end relative pt-2">
                  <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart-area-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#EC4899" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#9333EA" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Shadow Area under the curve */}
                    <path
                      d="M 0 85 Q 70 40 120 60 T 224 35 T 320 50 T 400 10"
                      fill="none"
                      stroke="#EC4899"
                      strokeWidth="3.5"
                      className="drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                    />
                    <path
                      d="M 0 85 Q 70 40 120 60 T 224 35 T 320 50 T 400 10 L 400 100 L 0 100 Z"
                      fill="url(#chart-area-glow)"
                    />
                    {/* Points */}
                    <circle cx="120" cy="60" r="4.5" fill="#FFFFFF" className="drop-shadow-[0_0_6px_#EC4899]" />
                    <circle cx="224" cy="35" r="4.5" fill="#FFFFFF" className="drop-shadow-[0_0_6px_#EC4899]" />
                    <circle cx="320" cy="50" r="4.5" fill="#FFFFFF" className="drop-shadow-[0_0_6px_#EC4899]" />
                  </svg>

                  {/* Dot labels */}
                  <div className="absolute top-2.5 left-[54%] bg-black/90 border border-white/10 p-1.5 rounded-lg text-[9px] pointer-events-none font-mono">
                    <span className="text-white font-bold">R$ 14.280</span> <span className="text-[#EC4899] font-black font-sans ml-1">ROAS: 5.4x</span>
                  </div>
                </div>

                <div className="flex justify-between text-[8px] text-white/30 font-mono mt-2 pt-2 border-t border-white/5">
                  <span>Início</span>
                  <span>Meio</span>
                  <span>Semana 3</span>
                  <span>Fim</span>
                </div>
              </div>

              {/* Botão overlay flutuante (ícone Astronauta Nexora expandido para exibir a logo completa de forma nítida) */}
              <div className="absolute -bottom-6 -right-5 z-20 w-40 h-16 bg-black rounded-2xl flex items-center justify-center shadow-[0_4px_30px_rgba(168,85,247,0.6)] animate-bounce border border-purple-500/40 cursor-pointer hover:scale-110 transition-transform overflow-hidden">
                <img
                  src={nexoraLogoImg}
                  alt="Nexora Pulse"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_0_16px_rgba(236,72,153,0.9)]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= 2. SERVIÇOS ================= */}
      <section id="servicos" className="py-20 md:py-28 px-6 md:px-12 xl:px-24 bg-black/40 border-t border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-purple-400 bg-purple-950/40 border border-purple-800/30 px-4 py-1.5 rounded-full inline-block">
              SERVIÇOS DE EXCELÊNCIA
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              O Ecossistema Completo Nexora Pulse
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-light">
              Garantimos soluções digitais ponta a ponta com as mais modernas ferramentas de Inteligência Artificial e automação.
            </p>
          </div>

          {/* Grid de Serviços */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => {
              const IconComp = svc.icon;
              return (
                <div
                  key={svc.id}
                  className="bg-[#08080C]/80 border border-white/5 rounded-3xl p-6 hover:border-[#EC4899] hover:bg-[#0E0E14] opacity-95 hover:opacity-100 transition-all hover:shadow-[0_0_30px_rgba(236,72,153,0.08)] flex flex-col justify-between group cursor-pointer relative"
                  onClick={() => setSelectedService(svc)}
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-gradient-to-br group-hover:from-purple-900 group-hover:to-[#EC4899] flex items-center justify-center transition-colors">
                      <IconComp className="w-6 h-6 text-purple-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      {svc.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-white/50 group-hover:text-white transition-colors">
                    <span className="text-[#EC4899] font-mono">{svc.metrics}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Saiba Mais</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#EC4899]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= RESULTADOS / MILESTONES SECTION ================= */}
      <section className="py-16 md:py-24 px-6 md:px-12 xl:px-24 bg-gradient-to-b from-[#030303] to-[#0A0012]/40 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <h2 className="text-2xl md:text-3.5xl font-black text-white tracking-tight leading-snug">
              Resultados que falam <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-[#EC4899] drop-shadow-[0_0_15px_rgba(236,72,153,0.1)]">mais que palavras.</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-light leading-relaxed">
              Números reais de empresas que transformaram seus negócios com nossas soluções. Estratégia de elite executada por especialistas em canais de mídia e IA para crescimento exponencial.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleScrollTo("portfolio")}
                className="px-6 py-3 rounded-xl bg-purple-950/40 border border-[#9333EA]/35 text-xs font-bold tracking-wider uppercase text-purple-300 hover:bg-purple-900/40 hover:text-white transition-all flex items-center gap-2"
              >
                <span>Ver cases de sucesso</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Cards Statistics Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-[#0D0716]/60 border border-purple-500/20 rounded-3xl p-6.5 text-left relative overflow-hidden group hover:border-[#EC4899] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#EC4899]/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-3xl md:text-4.5xl font-black text-white block tracking-tight group-hover:text-purple-400 transition-colors">+200%</span>
              <p className="text-xs font-black text-white/90 mt-1 uppercase tracking-wider font-sans">Aumento médio em ROI</p>
              <p className="text-[10px] text-slate-500 font-light mt-1">dos nossos clientes em canais de tráfego integrado</p>
            </div>

            <div className="bg-[#0D0716]/60 border border-purple-500/20 rounded-3xl p-6.5 text-left relative overflow-hidden group hover:border-[#EC4899] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#EC4899]/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-3xl md:text-4.5xl font-black text-white block tracking-tight group-hover:text-purple-400 transition-colors">+150</span>
              <p className="text-xs font-black text-white/90 mt-1 uppercase tracking-wider font-sans">Empresas atendidas</p>
              <p className="text-[10px] text-slate-500 font-light mt-1">com sucesso absoluto e auditoria de crescimento</p>
            </div>

            <div className="bg-[#0D0716]/60 border border-purple-500/20 rounded-3xl p-6.5 text-left relative overflow-hidden group hover:border-[#EC4899] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#EC4899]/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-3xl md:text-4.5xl font-black text-white block tracking-tight group-hover:text-purple-400 transition-colors">+10M</span>
              <p className="text-xs font-black text-white/90 mt-1 uppercase tracking-wider font-sans">Investimentos Gerenciados</p>
              <p className="text-[10px] text-slate-500 font-light mt-1">em campanhas digitais e canais institucionais corporativos</p>
            </div>

            <div className="bg-[#0D0716]/60 border border-purple-500/20 rounded-3xl p-6.5 text-left relative overflow-hidden group hover:border-[#EC4899] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#EC4899]/5 rounded-full blur-xl pointer-events-none" />
              <span className="text-3xl md:text-4.5xl font-black text-white block tracking-tight group-hover:text-purple-400 transition-colors">98%</span>
              <p className="text-xs font-black text-white/90 mt-1 uppercase tracking-wider font-sans">Taxa de satisfação</p>
              <p className="text-[10px] text-slate-500 font-light mt-1">dos clientes parceiros de retenção trimestral</p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 3. PLATAFORMA / NEXORA PULSE SAAS ================= */}
      <section id="plataforma" className="py-20 md:py-28 px-6 md:px-12 xl:px-24 bg-black/50 border-t border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-[#EC4899] bg-pink-950/40 border border-pink-900/30 px-4 py-1.5 rounded-full inline-block">
              NEXORA PULSE SaaS PLATFORM
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              O sistema operacional inteligente para crescimento digital.
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-light">
              Gerencie tráfego, automação, CRM, IA e performance em uma única plataforma omnichannel.
            </p>
          </div>

          {/* Interactive Navigation Control Tabs for SaaS Features */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 bg-white/5 p-1.5 rounded-2xl max-w-3xl mx-auto border border-white/5 shadow-inner">
            <button
              onClick={() => setPlataformaActiveTab("dashboard")}
              className={`px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
                plataformaActiveTab === "dashboard"
                  ? "bg-gradient-to-r from-purple-800 to-[#EC4899] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Dashboard Core</span>
            </button>
            
            <button
              onClick={() => setPlataformaActiveTab("crm")}
              className={`px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
                plataformaActiveTab === "crm"
                  ? "bg-gradient-to-r from-purple-800 to-[#EC4899] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>CRM Integrado</span>
            </button>

            <button
              onClick={() => setPlataformaActiveTab("trafego")}
              className={`px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
                plataformaActiveTab === "trafego"
                  ? "bg-gradient-to-r from-purple-800 to-[#EC4899] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Gestão Tráfego</span>
            </button>

            <button
              onClick={() => setPlataformaActiveTab("ia")}
              className={`px-5 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 ${
                plataformaActiveTab === "ia"
                  ? "bg-gradient-to-r from-purple-800 to-[#EC4899] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>IA Operacional</span>
            </button>
          </div>

          {/* Dynamic Tab Panel Display */}
          <div className="bg-[#07070B] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden text-left" id="saas-tab-panel">
            <div className="absolute top-[-30px] right-[-30px] w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

            {plataformaActiveTab === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-block px-3 py-1 bg-purple-900/40 border border-purple-800/30 text-[9px] font-bold text-purple-300 rounded uppercase font-mono tracking-wider">Métricas Centrais & Insights</div>
                  <h3 className="text-xl md:text-2xl font-black text-white">Visualização de Desvios Estratégicos</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    O Nexora Pulse monitora em tempo real quedas de CTR ou picos favoráveis de ROAS em Meta e Google Ads nas suas subcontas, emitindo recomendações inteligentes automatizadas com recomendação de escala ou substituição heurística de criativos saturados.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300 font-light">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Monitor de performance de CTR & CPA em tempo real.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Recomendações em português geradas por IA.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> XP Points Gamificados para motivar calibragens rápidas.
                    </li>
                  </ul>
                  <button onClick={onAccessApp} className="px-5 py-3 bg-gradient-to-r from-purple-800 to-pink-700 text-xs font-bold uppercase rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 text-white">
                    <span>Iniciar Teste Gratuito</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="lg:col-span-7 bg-[#0b0c12] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#EC4899]" /> Alerta de Desvio Inteligente Activo
                    </span>
                    <span className="text-[9px] bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded font-mono font-medium">PENDENTE</span>
                  </div>
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between font-mono text-white/50 bg-[#070709] p-2.5 rounded-lg border border-white/5">
                      <span>Média Anterior: 3.42% CTR</span>
                      <span>Métrica Atual: 2.80% CTR</span>
                      <span className="text-[#EC4899] font-black">-18.2% Queda</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-300">Causa Raiz mapeada por Nexora AI:</h4>
                      <p className="text-slate-400 leading-relaxed text-[11px] font-light mt-0.5">
                        "Saturação precoce do criativo principal em vídeo curto no Meta Ads. Frequência atingiu média histórica nociva de 3.4 para o público de rímel."
                      </p>
                    </div>
                    <div className="bg-purple-950/35 border border-purple-800/30 p-3.5 rounded-xl">
                      <h4 className="font-bold text-emerald-400 flex items-center gap-1">✨ Recomendação Automatizada:</h4>
                      <p className="text-slate-300 text-[11px] font-light mt-0.5 leading-relaxed">
                        Injetar novo copy/criativo gerador heurístico focado em dores de rotina.
                      </p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-[10px] text-purple-300 font-mono font-bold">+40 XP</span>
                        <button onClick={onAccessApp} className="px-3.5 py-1.5 bg-[#EC4899] text-[10px] font-bold uppercase text-white rounded-lg hover:scale-105 transition-all">
                          Calibrar automático por IA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {plataformaActiveTab === "crm" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-block px-3 py-1 bg-purple-900/40 border border-purple-800/30 text-[9px] font-bold text-purple-300 rounded uppercase font-mono tracking-wider">CRM Omnichannel & WhatsApp</div>
                  <h3 className="text-xl md:text-2xl font-black text-white">Centralize Leads e Funis em Kanban</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Visualize o fluxo dos seus leads de tráfego orgânico ou patrocinado diretamente em um pipeline Kanban segmentado por status e gatilhos de WhatsApp integrado, permitindo acionamento de chatbots ou disparos imediatos de follow-up.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300 font-light">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Criação rápida de Leads integrados com WhatsApp Web nativo.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Mudança em massa de status de negociação por clique.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Filtros refinados por origem da publicidade.
                    </li>
                  </ul>
                  <button onClick={onAccessApp} className="px-5 py-3 bg-gradient-to-r from-purple-800 to-pink-700 text-xs font-bold uppercase rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 text-white">
                    <span>Iniciar Teste Gratuito</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="lg:col-span-7 bg-[#0b0c12] border border-white/5 rounded-2xl p-5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block mb-4">Pipeline de Contatos Simulado</span>
                  <div className="grid grid-cols-3 gap-3">
                    
                    <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                        <span>LEADS RECEBIDOS</span>
                        <span>(2)</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 text-[10px] space-y-1.5">
                        <span className="text-white font-bold block leading-none">Amanda Silva (Glow)</span>
                        <span className="text-[#EC4899] font-mono leading-none block">R$ 550,00</span>
                        <span className="bg-[#12081f] text-purple-400 text-[8px] font-semibold px-1 rounded inline-block">WhatsApp pendente</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg border border-white/5 text-[10px] space-y-1.5">
                        <span className="text-white font-bold block leading-none">Carlos Mendes (Stutz)</span>
                        <span className="text-[#EC4899] font-mono leading-none block">R$ 1.800,00</span>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                        <span>QUALIFICAÇÃO</span>
                        <span>(1)</span>
                      </div>
                      <div className="bg-white/5 p-2.5 rounded-lg border border-purple-500/30 text-[10px] space-y-1.5">
                        <span className="text-white font-bold block leading-none">Juliana Neves (Meliuz)</span>
                        <span className="text-[#EC4899] font-mono leading-none block">R$ 4.200,00</span>
                        <span className="bg-emerald-950 text-emerald-400 text-[8px] font-semibold px-1 rounded inline-block">Qualificado por IA</span>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                        <span>VENDA FECHADA</span>
                        <span>(1)</span>
                      </div>
                      <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-lg text-[10px] space-y-1.5">
                        <span className="text-white font-bold block leading-none">Roberto Souza</span>
                        <span className="text-[#EC4899] font-mono leading-none block">R$ 12.000,00</span>
                        <span className="bg-emerald-950 text-emerald-400 text-[8px] font-semibold px-1 rounded inline-block">Conquistado</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {plataformaActiveTab === "trafego" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-block px-3 py-1 bg-purple-900/40 border border-purple-800/30 text-[9px] font-bold text-purple-300 rounded uppercase font-mono tracking-wider">Tráfego Pago & Orçamentos</div>
                  <h3 className="text-xl md:text-2xl font-black text-white">Centralizador de Campanhas Multicanais</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    Acabe com as dezenas de guias do gerenciador de anúncios abertas ao mesmo tempo. Visualize no Nexora Pulse um feed unificado de campanhas Meta, Google e TikTok Ads com controle de status direto, ROAS computado e simulador de alteração de lances.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300 font-light">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Edição rápida de orçamento diário com recálculo automático.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Toggle liga/desliga de campanhas Meta ou Google com validação visual.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Histórico de logs de segurança para conferir auditoria.
                    </li>
                  </ul>
                  <button onClick={onAccessApp} className="px-5 py-3 bg-gradient-to-r from-purple-800 to-pink-700 text-xs font-bold uppercase rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 text-white">
                    <span>Iniciar Teste Gratuito</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="lg:col-span-7 bg-[#0b0c12] border border-white/5 rounded-2xl p-5 space-y-3.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">Simulação de Campanhas Unificadas</span>
                  
                  <div className="bg-black/50 border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs font-sans">
                    <div>
                      <span className="text-[9px] text-white/50 block font-mono">META ADS</span>
                      <h4 className="font-bold text-white mt-0.5">Campanha Lookalike Compradores Recorrentes</h4>
                      <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded inline-block mt-1 font-mono">ROAS: 4.80x • CTR: 3.5%</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block font-mono">Orçamento Diário</span>
                      <span className="font-bold text-white block">R$ 350 / dia</span>
                      <span className="text-emerald-400 font-bold block text-[9px] font-mono">🎯 Otimizando</span>
                    </div>
                  </div>

                  <div className="bg-black/50 border border-white/5 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs font-sans">
                    <div>
                      <span className="text-[9px] text-white/50 block font-mono font-sans">GOOGLE ADS</span>
                      <h4 className="font-bold text-white mt-0.5">Fundo de Funil Google Search - Escova Profissional</h4>
                      <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded inline-block mt-1 font-mono">ROAS: 3.20x • CTR: 2.1%</span>
                    </div>
                    <div className="text-right shrink-0 animate-pulse">
                      <span className="text-[10px] text-slate-500 block font-mono">Orçamento Diário</span>
                      <span className="font-bold text-white block">R$ 180 / dia</span>
                      <span className="text-amber-400 font-extrabold block text-[9px] font-mono">👁️ Saturação</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {plataformaActiveTab === "ia" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-6">
                  <div className="inline-block px-3 py-1 bg-purple-900/40 border border-purple-800/30 text-[9px] font-bold text-purple-300 rounded uppercase font-mono tracking-wider">Agentes Autônomos de IA</div>
                  <h3 className="text-xl md:text-2xl font-black text-white">Estratégia de Conteúdo Executada via Gemini</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    O Nexora Pulse possui integração direta com o modelo Gemini 3.5 da Google rodando em servidor seguro na nuvem. Gere legendas profissionais de altíssimo engajamento, revise cronogramas orgânicos, faça benchmarking de canais sociais e analise tendências por chat em um clique.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300 font-light">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Redator de Copy para anúncios com foco em dores do consumidor.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Assistente de canais sociais com tom de marca variável.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Prompt imediato sem expor sua chave de API privada.
                    </li>
                  </ul>
                  <button onClick={onAccessApp} className="px-5 py-3 bg-gradient-to-r from-purple-800 to-pink-700 text-xs font-bold uppercase rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 text-white">
                    <span>Iniciar Teste Gratuito</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="lg:col-span-7 bg-[#0b0c12] border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="font-bold uppercase tracking-wide flex items-center gap-1.5 text-[#EC4899]"><Bot className="w-4 h-4" /> Nexora AI - Copywriter de Elite</span>
                    <span className="text-[10px] text-white/40 font-mono">Gemini-3.5-Flash</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-3 rounded-lg text-xs leading-relaxed font-mono">
                    <span className="text-purple-400 font-bold font-sans">Prompt solicitado:</span>
                    <p className="text-slate-300 font-light mt-0.5 text-[11px] font-sans">
                      "Gere 3 gatilhos irresistíveis de mídia paga de escova hidratante para o Instagram."
                    </p>
                  </div>
                  <div className="bg-purple-950/20 border border-purple-800/40 p-4 rounded-xl space-y-2 text-xs">
                    <div className="text-[10px] text-purple-300 font-bold uppercase font-mono tracking-wider">Output gerado pela IA real:</div>
                    <ul className="space-y-2 text-slate-200 list-decimal pl-4.5 font-light leading-relaxed">
                      <li>
                        <strong className="text-white">Gatilho da Agilidade:</strong> "Seu cabelo pronto de salão em 8 minutos de manhã sem queimar a franja. Toque para ver como..."
                      </li>
                      <li>
                        <strong className="text-white">Gatilho do Contraste Visual:</strong> "A diferença do frizz em dias de chuva usando escovas normais vs o vaporizado hidratante da Glow..."
                      </li>
                      <li>
                        <strong className="text-white">Gatilho Científico Heurístico:</strong> "Por que o tratamento térmico iônico reduz pontas duplas em 62% desde o primeiro uso..."
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= 4. PORTFÓLIO ================= */}
      <section id="portfolio" className="py-20 md:py-28 px-6 md:px-12 xl:px-24 bg-gradient-to-b from-[#030303] via-[#0D001C]/60 to-[#030303] relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-purple-400 bg-purple-950/40 border border-purple-800/30 px-4 py-1.5 rounded-full inline-block">
              VALOR COMPROVADO EM MERCADO
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Projetos desenvolvidos para impulsionar negócios reais.
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-light">
              Tecnologia, criatividade e performance aplicadas em soluções escaláveis.
            </p>
          </div>

          {/* Portfolio Filter Navigation Controls */}
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto bg-white/5 border border-white/5 p-1 rounded-2xl">
            {["all", "performance", "websites", "sistemas", "criativos", "automacao"].map((tag) => (
              <button
                key={tag}
                onClick={() => setPortfolioFilter(tag)}
                className={`px-4.5 py-2.5 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all ${
                  portfolioFilter === tag
                    ? "bg-gradient-to-r from-purple-800 to-[#EC4899] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tag === "all" ? "Todos os Cases" : ""}
                {tag === "performance" ? "Cases de Performance" : ""}
                {tag === "websites" ? "Websites/LPs Criados" : ""}
                {tag === "sistemas" ? "Sistemas Desenvolvidos" : ""}
                {tag === "criativos" ? "Criativos & Branding" : ""}
                {tag === "automacao" ? "Automação & IA" : ""}
              </button>
            ))}
          </div>

          {/* Grid of Case cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {[
              {
                id: "case-glow",
                title: "Funil de Vendas de Cosméticos - E-commerce Glow",
                tag: "performance",
                metric: "ROI +340% • ROAS 4.20x",
                desc: "Reestruturação completa de campanhas de tráfego pago integradas com pixel avançado de Meta e automação de abandonos pelo WhatsApp.",
                image: "💄 COSMÉTICOS"
              },
              {
                id: "case-stutz",
                title: "Landing Pages de Imóveis de Alto Padrão - Stutz",
                tag: "websites",
                metric: "Tempo de carregamento < 0.7s",
                desc: "Design de alta conversão para empreendimentos de luxo nas capitais, focado em agilidade máxima e retenção de leads qualificados.",
                image: "🏢 LUXURY REAL ESTATE"
              },
              {
                id: "case-meliuz",
                title: "Painel de Auditoria de Telecomunicação & Cashback",
                tag: "sistemas",
                metric: "SaaS Enterprise Core Integration",
                desc: "Desenvolvimento de interface em React 19 com mapeamento e segmentação de cashback corporativo para tomadores de decisões chave.",
                image: "💳 SAAS CORPORATIVO"
              },
              {
                id: "case-brand-lux",
                title: "Identidade Visual Cyber-Tech - Plataforma Nexora",
                tag: "criativos",
                metric: "Redesign de Branding Consistente",
                desc: "Desenho da marca futurista com gradientes neon, paletas cibernéticas, tipografias robustas em displays digitais de impacto global.",
                image: "🌌 DESIGN CHROME"
              },
              {
                id: "case-bot-evolution",
                title: "Chatbot de WhatsApp Integrado de Resposta < 4s",
                tag: "automacao",
                metric: "95% das dúvidas resolvidas de forma autônoma",
                desc: "Conexão de agentes do Gemini com WhatsApp Evolution nativo, lendo históricos em CRM das negociações no Kanban.",
                image: "🤖 CHATBOT GEMINI"
              },
              {
                id: "case-analytics-dashboard",
                title: "Central de BI e Telemetria de Leads em Massa",
                tag: "performance",
                metric: "Unificação de 5 origens de dados",
                desc: "Mapeamento em tempo real de lances no Google Search e Meta Ads gerando alertas precisos sobre fadigas precoces de público.",
                image: "📊 ANALYTICS COCKPIT"
              }
            ]
              .filter((item) => portfolioFilter === "all" || item.tag === portfolioFilter)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-[#070709] border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/50 hover:shadow-[0_15px_30px_rgba(147,51,234,0.08)] transition-all flex flex-col justify-between group"
                >
                  <div className="h-44 bg-gradient-to-br from-purple-950/40 via-purple-900/10 to-transparent flex items-center justify-center border-b border-white/5 relative overflow-hidden text-sm uppercase tracking-widest font-mono text-purple-300 font-bold">
                    <div className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-x-0 bottom-4 text-center text-[10px] text-purple-400 font-black tracking-[0.2em]">
                      NEXORA PULSE CASE STUDIES
                    </div>
                    {item.image}
                  </div>
                  <div className="p-6 text-left space-y-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] bg-purple-950 text-purple-300 font-extrabold px-2.5 py-1 rounded inline-block uppercase font-mono tracking-wide">
                        {item.metric}
                      </span>
                      <h3 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-light leading-relaxed font-sans">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 mt-auto flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-500 text-[10px] font-mono">STATUS: VALIDADO</span>
                      <button
                        onClick={onAccessApp}
                        className="text-purple-400 font-bold hover:text-white transition-colors flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        <span>Simular no App</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ================= 5. SOBRE NÓS ================= */}
      <section id="sobre" className="py-20 md:py-28 px-6 md:px-12 xl:px-24 bg-black/40 border-t border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Description Column */}
          <div className="lg:col-span-6 space-y-6 text-left" id="sobre-left-col">
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-[#EC4899] bg-pink-950/40 border border-pink-900/30 px-4 py-1.5 rounded-full inline-block">
              QUEM SOMOS E NOSSA HISTÓRIA
            </span>
            <h2 className="text-3xl md:text-4.5xl font-black text-white tracking-tight leading-tight">
              Tecnologia, criatividade e inteligência para acelerar empresas.
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-light">
              A Nexora Pulse nasceu para unir tecnologia, automação, inteligência artificial e performance em uma única experiência digital. Fomos modelados para reorientar a forma como marcas escalam faturamento na era da IA generativa.
            </p>

            <div className="grid grid-cols-3 gap-4 py-4" id="sobre-kpis">
              <div className="border border-white/5 bg-white/5 rounded-2xl p-4">
                <span className="text-[9px] text-purple-400 font-bold tracking-wider block font-mono">MISSÃO</span>
                <p className="text-[11px] text-slate-300 font-light mt-1.5">Acabar com achismos em funis e automatizar inteligência operacional.</p>
              </div>
              <div className="border border-white/5 bg-white/5 rounded-2xl p-4">
                <span className="text-[9px] text-[#EC4899] font-bold tracking-wider block font-mono">VISÃO</span>
                <p className="text-[11px] text-slate-300 font-light mt-1.5">Ser a plataforma SaaS omnichannel líder na América Latina até 2028.</p>
              </div>
              <div className="border border-white/5 bg-white/5 rounded-2xl p-4">
                <span className="text-[9px] text-purple-400 font-bold tracking-wider block font-mono">VALORES</span>
                <p className="text-[11px] text-slate-300 font-light mt-1.5">Transparência cirúrgica em dados, velocidade e design premium.</p>
              </div>
            </div>

            <div className="space-y-2 text-xs md:text-sm text-slate-300 font-light">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Integração nativa com IA operacional e assistentes baseados em Gemini da Google</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Dashboards integrados multi-canal para eliminar planilhas defasadas</span>
              </div>
            </div>
          </div>

          {/* Right Visual Pillars Column */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 text-left" id="sobre-right-col">
            
            <div className="bg-[#09090D] border border-white/5 rounded-3xl p-5 md:p-6 space-y-3">
              <div className="w-10 h-10 bg-purple-950 rounded-xl flex items-center justify-center text-lg font-mono">🛰️</div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">IA Operacional</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">Substituição de criativos saturados e escrita heurística gerada na nuvem.</p>
            </div>

            <div className="bg-[#09090D] border border-white/5 rounded-3xl p-5 md:p-6 space-y-3">
              <div className="w-36 h-14 bg-black rounded-xl overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-500/30">
                <img
                  src={nexoraLogoImg}
                  alt="Nexora Pulse"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Dashboards Enterprise</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light font-sans">Controle unificado de dezenas de métricas complexas de tráfego por marca.</p>
            </div>

            <div className="bg-[#09090D] border border-white/5 rounded-3xl p-5 md:p-6 space-y-3">
              <div className="w-10 h-10 bg-purple-950 rounded-xl flex items-center justify-center text-lg font-mono">🤖</div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Automação Inteligente</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light font-sans">Chatbots integrados Evolution e fluxo de leads quentes no funil.</p>
            </div>

            <div className="bg-[#09090D] border border-white/5 rounded-3xl p-5 md:p-6 space-y-3">
              <div className="w-10 h-10 bg-pink-950 rounded-xl flex items-center justify-center text-lg font-mono">🌎</div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Experiência Premium</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">Atendimento omnichannel, acompanhamento por gerentes de contas de nível sênior.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 6. BLOG ================= */}
      <section id="blog" className="py-20 md:py-28 px-6 md:px-12 xl:px-24 bg-gradient-to-b from-[#030303] to-[#080211]/50 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-purple-400 bg-purple-950/40 border border-purple-800/30 px-4 py-1.5 rounded-full inline-block">
              CONHECIMENTO GERA PERFORMANCE
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center">
              Fique por dentro das maiores novidades digitais
            </h2>
            <p className="text-xs md:text-sm text-slate-400 text-center font-light">
              Insights semanais sobre novas tecnologias, APIs de WhatsApp, hacks de tráfego pago e calibração com inteligência artificial.
            </p>
          </div>

          {/* Categories Toggle Carousel */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto bg-white/5 border border-white/5 p-1 rounded-2xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setBlogCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all ${
                  blogCategory === cat
                    ? "bg-gradient-to-r from-purple-800 to-[#EC4899] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat === "all" ? "Todos os artigos" : cat}
              </button>
            ))}
          </div>

          {/* Grid of Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts
              .filter((post) => blogCategory === "all" || post.category === blogCategory)
              .map((post) => (
                <div
                  key={post.id}
                  className="bg-[#070709] border border-white/5 rounded-3xl overflow-hidden hover:border-purple-500/50 hover:shadow-[0_12px_24px_rgba(147,51,234,0.06)] transition-all flex flex-col justify-between group cursor-pointer text-left"
                  onClick={() => {
                    alert(`📚 Artigo do Blog simulado: "${post.title}".\nO conteúdo completo está sincronizado na nossa base corporativa Nexora de SEO!`);
                    if (addXP) addXP(10, `Leu artigo de blog: ${post.title.slice(0, 20)}`);
                  }}
                >
                  <div className="h-32 bg-gradient-to-br from-purple-900/30 to-slate-950 border-b border-white/5 flex items-center justify-center font-black text-xs uppercase tracking-widest text-[#EC4899] font-mono select-none">
                    <span className="drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">{post.imageText} • NEXORA BLOG</span>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-mono text-white/40">
                        <span>{post.category}</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-light line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-white/30">
                      <span>{post.date}</span>
                      <span className="text-[#EC4899] font-extrabold group-hover:text-white transition-colors">ACESSAR</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ================= 7. PLANOS ================= */}
      <section id="planos" className="py-20 md:py-28 px-6 md:px-12 xl:px-24 bg-black/40 border-t border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-[#EC4899] bg-pink-950/40 border border-pink-900/30 px-4 py-1.5 rounded-full inline-block">
              VALORES TRANSPARENTES
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Nossos Planos SaaS Omnichannel
            </h2>
            <p className="text-xs md:text-sm text-slate-400 font-light">
              Escolha a assinatura ideal e comece a calibrar de forma instantânea suas campanhas de marketing com IA real.
            </p>

            {/* billing toggle */}
            <div className="flex justify-center items-center gap-3 pt-4">
              <span className={`text-xs font-semibold ${billingCycle === "mensal" ? "text-purple-400 font-black" : "text-slate-400"}`}>Faturamento Mensal</span>
              <button
                onClick={() => setBillingCycle(billingCycle === "mensal" ? "anual" : "mensal")}
                className="w-12 h-6 px-1 rounded-full bg-white/10 hover:bg-white/15 transition-all flex items-center z-10 relative"
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-gradient-to-r from-purple-500 to-[#EC4899] transition-transform ${billingCycle === "anual" ? "translate-x-6" : "translate-x-0"}`} />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === "anual" ? "text-purple-400 font-black" : "text-slate-400"}`}>
                <span>Faturamento Anual</span>
                <span className="bg-emerald-950 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded uppercase leading-none">-20% OFF</span>
              </span>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Basic plan */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6.5 text-left flex flex-col justify-between opacity-95 hover:opacity-100 transition-all hover:border-purple-950">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] text-[#EC4899] font-bold uppercase tracking-wider font-mono">PEQUENAS EMPRESAS</span>
                  <h3 className="text-lg font-black text-white mt-1 uppercase">BASIC STARTER</h3>
                  <p className="text-xs text-slate-400 font-light mt-1.5">Ideal para profissionais liberais, e-commerce iniciantes testando canais primários.</p>
                </div>

                <div className="py-2 border-b border-t border-white/5 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {billingCycle === "mensal" ? "R$ 197" : "R$ 157"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">/ mês</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 font-normal py-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> 1 Canal Social Conectado
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Legendas autônomas AI Lite
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Dashboard simplificado de canais
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Suporte padrão via e-mail corporativo
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={onAccessApp}
                  className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase text-white transition-all border border-white/5"
                >
                  Começar Agora
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-[#0E0716]/90 border-2 border-purple-500/50 rounded-3xl p-6.5 text-left flex flex-col justify-between relative shadow-[0_0_40px_rgba(147,51,234,0.15)] scale-105">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-800 to-[#EC4899] text-[8px] text-white font-black px-3.5 py-1 rounded-full uppercase tracking-widest leading-none">
                RECOMENDADO
              </span>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] text-[#EC4899] font-bold uppercase tracking-wider font-mono">EMPRESAS EM CRESCIMENTO</span>
                  <h3 className="text-lg font-black text-white mt-1 uppercase">AUTOMATION PRO</h3>
                  <p className="text-xs text-purple-200/90 font-light mt-1.5">Funis unificados de CRM, assistente de legendas avançado, disparo integrado e equipe gestora.</p>
                </div>

                <div className="py-2 border-b border-t border-purple-500/20 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {billingCycle === "mensal" ? "R$ 497" : "R$ 397"}
                  </span>
                  <span className="text-[10px] text-purple-300 font-mono">/ mês</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-200 font-normal py-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Multi-canais sociais de marcas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> CRM Pipeline Kanban completo
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Histórico avançado com monitoramento
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Suporte VIP via WhatsApp em horário útil
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={onAccessApp}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 via-purple-900 to-[#EC4899] text-xs font-bold uppercase text-white hover:opacity-95 transition-all shadow-md"
                >
                  Começar Agora
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6.5 text-left flex flex-col justify-between opacity-95 hover:opacity-100 transition-all hover:border-purple-950">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] text-[#EC4899] font-bold uppercase tracking-wider font-mono">OPERAÇÕES CORPORATIVAS</span>
                  <h3 className="text-lg font-black text-white mt-1 uppercase">ENTERPRISE CORE</h3>
                  <p className="text-xs text-slate-400 font-light mt-1.5">Para escalar marcas de milhões de acessos, com infraestrutura de dados dedicada e relatórios BI.</p>
                </div>

                <div className="py-2 border-b border-t border-white/5 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">
                    {billingCycle === "mensal" ? "R$ 997" : "R$ 797"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">/ mês</span>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 font-normal py-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Subcontas ilimitadas corporativas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Mapeamento de desvios via WhatsApp real
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Automações dedicadas de fluxos internos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> Gerente sênior dedicado omnichannel 24/7
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={onAccessApp}
                  className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase text-white transition-all border border-white/5"
                >
                  Falar com Comercial
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 8. CONTATO/LEADS ================= */}
      <section id="contato" className="py-20 md:py-28 px-6 md:px-12 xl:px-24 bg-gradient-to-b from-[#030303] via-[#0E0021]/50 to-black border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-5 text-left space-y-6">
            <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-[#EC4899] bg-pink-950/40 border border-pink-900/30 px-4 py-1.5 rounded-full inline-block">
              FALE CONOSCO HOJE
            </span>
            <h2 className="text-3xl md:text-4.5xl font-black text-white tracking-tight lead-snug">
              Pronto para impulsionar suas vendas reais?
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-light">
              Fale com um de nossos especialistas elite e desenhe o mapa de automação, tráfego pago e inteligência artificial para sua marca acelerar ainda este mês.
            </p>
            <div className="space-y-3.5 text-xs text-slate-350">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-950/40 border border-purple-900/40 rounded-xl flex items-center justify-center text-purple-400">
                  <Mail className="w-4 h-4" />
                </div>
                <span>contato@nexorapulse.com.br</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-950/40 border border-purple-900/40 rounded-xl flex items-center justify-center text-purple-400">
                  <Phone className="w-4 h-4" />
                </div>
                <span>+55 (11) 99887-7665 (WhatsApp Direto)</span>
              </div>
            </div>
          </div>

          {/* Right Lead capture Form */}
          <div className="lg:col-span-7" id="lead-form-container">
            <div className="bg-[#0A0A0E] border border-white/10 rounded-3xl p-6 md:p-9 shadow-2xl relative overflow-hidden text-left font-sans">
              
              <div className="absolute top-0 right-0 w-44 h-44 bg-purple-500/5 rounded-full blur-3xl" />
              
              <div className="mb-6.5 text-xs border-b border-white/5 pb-4 md:pb-5">
                <span className="font-extrabold tracking-wider text-purple-300 uppercase block">FORMULÁRIO SEGURO CORPORATIVO</span>
                <span className="text-white/40 text-[10px] block mt-0.5 font-mono">LGPD Compliant • Respostas aceleradas em até 10 minutos</span>
              </div>

              {formSubmitted ? (
                <div className="py-12 text-center space-y-4" id="form-success-alert">
                  <div className="w-14 h-14 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h3 className="text-lg font-black text-white">Formulário Enviado com Sucesso!</h3>
                  <p className="text-xs text-slate-400 font-light max-w-sm mx-auto leading-relaxed">
                    Nossa equipe de especialistas foi notificada no CRM e responderá ao e-mail <strong>{formData.email}</strong> ou pelo WhatsApp corporativo informado em instantes.
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ nome: "", empresa: "", email: "", telefone: "", segmento: "" });
                    }}
                    className="mt-4 px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-xs text-slate-300 font-semibold"
                  >
                    Enviar outra solicitação
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4" id="form-lead-capture">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 block font-mono font-bold uppercase tracking-wide">Seu Nome *</label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3.5 w-4 h-4 text-purple-500/60" />
                        <input
                          type="text"
                          required
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="Ex: Amanda Silva"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:border-[#EC4899] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 block font-mono font-bold uppercase tracking-wide">Sua Empresa *</label>
                      <div className="relative flex items-center">
                        <Building className="absolute left-3.5 w-4 h-4 text-purple-500/60" />
                        <input
                          type="text"
                          required
                          value={formData.empresa}
                          onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                          placeholder="Ex: Glow Cosméticos LTDA"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:border-[#EC4899] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 block font-mono font-bold uppercase tracking-wide">Seu E-mail Corporativo *</label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3.5 w-4 h-4 text-purple-500/60" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Ex: amanda@glowcosmeticos.com.br"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:border-[#EC4899] transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 block font-mono font-bold uppercase tracking-wide">Seu Telefone / WhatsApp *</label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3.5 w-4 h-4 text-purple-500/60" />
                        <input
                          type="tel"
                          required
                          value={formData.telefone}
                          onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                          placeholder="Ex: (11) 99887-7665"
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-xs font-sans text-white focus:outline-none focus:border-[#EC4899] transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 block font-mono font-bold uppercase tracking-wide">Segmento de Mercado</label>
                    <select
                      value={formData.segmento}
                      onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-4 text-xs font-sans text-white focus:outline-none focus:border-[#EC4899] transition-colors"
                    >
                      <option value="" className="bg-[#0c0c0e]">Selecione o segmento...</option>
                      <option value="cosmeticos" className="bg-[#0c0c0e]">Varejo & Cosméticos</option>
                      <option value="imoveis" className="bg-[#0c0c0e]">Alto Padrão & Real Estate</option>
                      <option value="financeiro" className="bg-[#0c0c0e]">Fintech, SaaS & Corporativo</option>
                      <option value="educacional" className="bg-[#0c0c0e]">Infoprodutos & Educação</option>
                      <option value="outro" className="bg-[#0c0c0e]">Outros Segmentos</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-purple-800 to-[#EC4899] text-xs font-extrabold tracking-widest uppercase text-white hover:scale-[1.01] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      id="btn-lead-form-submit"
                    >
                      {contactLoading ? (
                        <span>Enviando Dados no CRM...</span>
                      ) : (
                        <>
                          <span>Falar com Especialista</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ================= SERVICE MODAL OVERLAY ================= */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#09090D] border-2 border-purple-500/50 rounded-3xl p-6 md:p-8 max-w-xl text-left relative shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 bg-white/5 border border-white/5 rounded-full p-1.5 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-900/30 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-mono font-bold tracking-wider">ECOSSISTEMA</span>
                <h3 className="text-xl font-bold text-white mt-1 leading-none">{selectedService.title}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-light font-sans">{selectedService.fullText}</p>

            <div className="bg-[#040406] border border-white/5 p-4 rounded-xl space-y-2.5 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between items-center text-[#EC4899] font-black">
                <span>INDICADOR CHAVE DE VALOR:</span>
                <span>{selectedService.metrics}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>EFICÁCIA DE CONVERSÃO:</span>
                <span className="text-white">{selectedService.conversionRate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>INTEGRADO NO SAAS:</span>
                <span className="text-emerald-400 font-bold">SIM / 100% ONLINE</span>
              </div>
            </div>

            <div className="flex gap-4.5 pt-2">
              <button
                onClick={() => {
                  setSelectedService(null);
                  onAccessApp();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-purple-800 to-pink-700 text-xs font-bold uppercase rounded-xl transition-all text-white hover:opacity-90 tracking-wider text-center"
              >
                Testar esta funcionalidade no App
              </button>
              <button
                onClick={() => {
                  setSelectedService(null);
                  handleScrollTo("contato");
                }}
                className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase text-white hover:bg-white/10 transition-all font-sans"
              >
                Falar c/ Especialista
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FOOTER PREMIUM ================= */}
      <footer className="bg-[#020202] border-t border-white/5 py-12 md:py-16 px-6 md:px-12 xl:px-24 text-left z-10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          <div className="md:col-span-4 space-y-4">
            <NexoraLogo showText={false} size="sm" />
            <p className="text-xs text-slate-500 leading-relaxed font-light font-sans">
              Transformando tráfego pago, inteligência artificial e automações omnichannel de alta conversão em escala e crescimento real para operações corporativas modernas.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 font-sans">Navegação Rápida</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => handleScrollTo("inicio")} className="hover:text-[#EC4899] transition-colors cursor-pointer">Início</button></li>
              <li><button onClick={() => handleScrollTo("servicos")} className="hover:text-[#EC4899] transition-colors cursor-pointer">Serviços corporativos</button></li>
              <li><button onClick={() => handleScrollTo("plataforma")} className="hover:text-[#EC4899] transition-colors cursor-pointer">SaaS Plataforma Pulse</button></li>
              <li><button onClick={() => handleScrollTo("portfolio")} className="hover:text-[#EC4899] transition-colors cursor-pointer">Cases de portfólio</button></li>
              <li><button onClick={() => handleScrollTo("sobre")} className="hover:text-[#EC4899] transition-colors cursor-pointer">Sobre nossa história</button></li>
              <li><button onClick={() => handleScrollTo("planos")} className="hover:text-[#EC4899] transition-colors cursor-pointer">Nossos Planos</button></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 font-sans">Canais SaaS Oficiais</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li><span className="text-[#EC4899] font-bold">SITE:</span> nexorapulse.com.br</li>
              <li><span className="text-[#EC4899] font-bold">PLATAFORMA:</span> app.nexorapulse.com.br</li>
              <li><span className="text-[#EC4899] font-bold">API INTEGRADA:</span> api.nexorapulse.com.br</li>
              <li><span className="text-[#EC4899] font-bold">COCKPIT ADMIN:</span> admin.nexorapulse.com.br</li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-4 text-slate-400 text-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 font-sans">Plataforma SaaS</h4>
            <p className="text-[10px] text-slate-500 font-light leading-relaxed">Pronto para auditar seus canais e criar copies instantâneos?</p>
            <button
              onClick={onAccessApp}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-pink-700 hover:opacity-90 transition-all text-[10px] font-black tracking-widest uppercase text-white text-center inline-block"
            >
              Acessar App SaaS
            </button>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono font-medium">
          <span>© 2026 NEXORA PULSE S.A. Todos os direitos reservados. CNPJ: 45.182.229/0001-75</span>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white transition-colors">POLÍTICA DE PRIVACIDADE</span>
            <span className="cursor-pointer hover:text-white transition-colors">TERMOS JURÍDICOS</span>
            <span className="cursor-pointer hover:text-white transition-colors">LGPD COMPLIANCE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
