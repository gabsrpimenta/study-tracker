import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard, Calendar, BookOpen, Settings, GraduationCap,
  ListTodo, Timer, FileText, Award, BarChart3, CalendarDays, Target,
  Menu, Moon, Sun, Bell,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Navegação",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/calendario", icon: Calendar, label: "Calendário" },
      { to: "/horario", icon: CalendarDays, label: "Horário" },
      { to: "/disciplinas", icon: BookOpen, label: "Disciplinas" },
    ],
  },
  {
    label: "Produtividade",
    items: [
      { to: "/tarefas", icon: ListTodo, label: "Tarefas" },
      { to: "/pomodoro", icon: Timer, label: "Pomodoro" },
      { to: "/notas", icon: FileText, label: "Notas" },
      { to: "/objetivos", icon: Target, label: "Objetivos" },
    ],
  },
  {
    label: "Análise",
    items: [
      { to: "/avaliacoes", icon: Award, label: "Avaliações" },
      { to: "/estatisticas", icon: BarChart3, label: "Estatísticas" },
    ],
  },
  {
    label: "Sistema",
    items: [{ to: "/configuracoes", icon: Settings, label: "Configurações" }],
  },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-card transition-transform md:relative md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
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
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{sec.label}</p>
              {sec.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-accent hover:text-foreground"
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

      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:px-6">
          <button
            className="rounded-md p-2 hover:bg-accent md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleTheme} className="rounded-md p-2 hover:bg-accent" aria-label="Tema">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="relative rounded-md p-2 hover:bg-accent" aria-label="Notificações">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">GA</div>
          </div>
        </header>

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
