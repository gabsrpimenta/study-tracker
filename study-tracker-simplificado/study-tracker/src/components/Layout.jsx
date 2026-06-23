// ==========================================
// LAYOUT PRINCIPAL (Template das páginas privadas)
// ==========================================
// Este componente é o "esqueleto" que envolve todas as páginas.
// O <Outlet /> é o ponto de inserção: o React Router desenha aqui a página atual.

import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, GraduationCap,
  ListTodo, Menu, Moon, Sun, LogOut,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { getUser, logout } from "@/lib/auth";

// ESTRUTURA DO MENU: Centralizada aqui para facilitar a manutenção.
// Se precisares de adicionar ou remover uma página no menu, só editas este array.
const sections = [
  { label: "Geral", items: [{ to: "/", icon: LayoutDashboard, label: "Dashboard" }] },
  { label: "Planeamento", items: [{ to: "/tarefas", icon: ListTodo, label: "Organização" }] },
  { label: "Desempenho", items: [{ to: "/disciplinas", icon: BookOpen, label: "Espaço Académico" }] },
];

export default function Layout() {
  // open: Estado para controlar a Sidebar em dispositivos mobile.
  // userMenuOpen: Estado para controlar o dropdown (menu) do perfil.
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // AUTHENTICATION CHECK: Extraímos o utilizador para exibir as suas iniciais no avatar.
  const user = getUser();
  const initials = user?.nome
    ? user.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* ============== SIDEBAR (MENU LATERAL) ============== */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-card transition-transform md:relative md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full" // Logica de toggle para Mobile
        )}
      >
        <Link to="/" className="flex items-center gap-2 border-b px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">Study Tracker</span>
        </Link>

        <nav className="space-y-4 p-3">
          {sections.map((sec) => (
            <div key={sec.label}>
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {sec.label}
              </p>
              {sec.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === "/"}
                  onClick={() => setOpen(false)} // Fecha o menu ao clicar (importante no mobile)
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      // Estilo dinâmico: se a rota estiver ativa, aplica a classe de 'active'
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Sombra de fundo (Overlay) para fechar o menu mobile ao clicar fora */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      {/* ============== ÁREA PRINCIPAL ============== */}
      <div className="flex flex-1 flex-col min-w-0">
        
        {/* CABEÇALHO */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
          
          {/* Botão de Menu (Mobile) */}
          <button
            className="rounded-md p-2 hover:bg-accent md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            
            {/* Tema (Sol/Lua) */}
            <button onClick={toggleTheme} className="rounded-md p-2 hover:bg-accent">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Avatar do Utilizador e Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground hover:opacity-80"
              >
                {initials}
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 rounded-md border bg-card p-1 shadow-lg z-40 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b">
                      <p className="text-xs font-semibold truncate">{user?.nome ?? "Estudante"}</p>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair da conta
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* O <Outlet /> injeta aqui o componente da página que foi escolhida na rota */}
        <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

        <footer className="border-t bg-background/50 py-4">
          <p className="text-center text-xs text-muted-foreground">
            © Study Tracker — Técnico Especialista em Programação de Sistemas 2025/2026
          </p>
        </footer>
      </div>
    </div>
  );
}