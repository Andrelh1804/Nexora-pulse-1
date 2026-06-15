import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Bot, Megaphone, Users, BarChart3,
  Settings, CreditCard, Globe, Palette, Workflow,
  ChevronLeft, ChevronRight, LogOut, Bell, Search,
  Shield, Zap, MessageSquare, TrendingUp, Menu, X
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import NexoraLogo from "../components/NexoraLogo";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  plan?: "premium" | "enterprise";
  badge?: string;
}

const navItems: NavItem[] = [
  { to: "/app/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
  { to: "/app/ai", icon: <Bot className="w-4 h-4" />, label: "Agentes IA", plan: "premium" },
  { to: "/app/traffic", icon: <Megaphone className="w-4 h-4" />, label: "Tráfego Pago" },
  { to: "/app/crm", icon: <Users className="w-4 h-4" />, label: "CRM" },
  { to: "/app/social", icon: <MessageSquare className="w-4 h-4" />, label: "Social Media" },
  { to: "/app/analytics", icon: <BarChart3 className="w-4 h-4" />, label: "Analytics" },
  { to: "/app/sites", icon: <Globe className="w-4 h-4" />, label: "Sites", plan: "premium" },
  { to: "/app/design", icon: <Palette className="w-4 h-4" />, label: "Design Studio", plan: "premium" },
  { to: "/app/automation", icon: <Workflow className="w-4 h-4" />, label: "Automações", plan: "premium" },
  { to: "/app/billing", icon: <CreditCard className="w-4 h-4" />, label: "Assinatura" },
  { to: "/app/settings", icon: <Settings className="w-4 h-4" />, label: "Configurações" },
];

const planColors: Record<string, string> = {
  basic: "text-gray-400 border-gray-700",
  premium: "text-purple-400 border-purple-700",
  enterprise: "text-amber-400 border-amber-700",
};

const planLabels: Record<string, string> = {
  basic: "Starter",
  premium: "Pro",
  enterprise: "Enterprise",
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const plan = user?.plan ?? "basic";
  const isPremiumPlus = plan === "premium" || plan === "enterprise";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`h-16 flex items-center border-b border-white/5 shrink-0 ${collapsed ? "px-3 justify-center" : "px-4 gap-3"}`}>
        {!collapsed && <NexoraLogo size="sm" />}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-sm">N</div>
        )}
      </div>

      {/* Plan badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <div className={`text-[9px] font-black uppercase tracking-widest border rounded-lg px-2 py-1 inline-flex items-center gap-1.5 ${planColors[plan]}`}>
            <Zap className="w-2.5 h-2.5" />
            Plano {planLabels[plan]}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const locked = item.plan === "premium" && !isPremiumPlus;
          return (
            <NavLink
              key={item.to}
              to={locked ? "/app/billing" : item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                  isActive && !locked
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                } ${locked ? "opacity-50 cursor-not-allowed" : ""}`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {locked && <span className="text-[8px] text-yellow-500/70 font-black uppercase border border-yellow-600/30 rounded px-1">Pro</span>}
                  {item.badge && <span className="text-[8px] bg-purple-600 text-white rounded-full px-1.5 py-0.5 font-bold">{item.badge}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name ?? "Usuário"}</p>
              <p className="text-[10px] text-white/40 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors" title="Sair">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full flex justify-center text-white/30 hover:text-red-400 transition-colors py-1" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex font-sans antialiased">
      {/* Ambient backgrounds */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-[180px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-900/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — desktop */}
      <aside
        className={`hidden md:flex flex-col bg-[#0A0A0F] border-r border-white/5 transition-all duration-200 shrink-0 ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+1px)] w-5 h-8 bg-[#0A0A0F] border border-white/5 rounded-r-lg flex items-center justify-center text-white/30 hover:text-white/70 transition-colors z-10"
          style={{ marginLeft: collapsed ? "3.5rem" : "14rem" }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Sidebar — mobile */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#0A0A0F] border-r border-white/5 z-50 md:hidden transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-white/5 bg-[#050505]/90 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-white/50 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 w-56">
              <Search className="w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent text-xs text-white placeholder-white/30 focus:outline-none w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="hidden md:flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/30 hover:text-white/70 border border-white/8 rounded-xl px-3 py-2 hover:bg-white/5 transition-all"
            >
              <Globe className="w-3 h-3" />
              Site
            </button>
            <div className="flex items-center gap-2 ml-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
