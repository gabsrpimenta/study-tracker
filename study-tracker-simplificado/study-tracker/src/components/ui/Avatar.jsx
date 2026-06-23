// <Avatar />: Exibe um círculo com as iniciais do utilizador e uma medalha de gamificação.
// Simplificado: Focado apenas em texto, sem lógica de carregamento de imagens.

import { cn } from "@/lib/utils";

export function Avatar({ user, size = "md", streak = 0, fallbackIniciais }) {
  // Configuração dos tamanhos (Design System)
  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-14 w-14 text-lg",
    lg: "h-24 w-24 text-2xl"
  };

  // Lógica de iniciais: Extrai a primeira letra de cada palavra do nome
  const iniciais = fallbackIniciais || (user?.nome ? user.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U");

  // Lógica de gamificação: Determina a cor da borda e a medalha pela sequência de dias
  const getStreakStyle = (dias) => {
    if (dias >= 30) return { border: "border-purple-400", medal: "💎" };
    if (dias >= 14) return { border: "border-amber-400", medal: "🥇" };
    if (dias >= 7)  return { border: "border-slate-300", medal: "🥈" };
    if (dias >= 3)  return { border: "border-amber-700", medal: "🥉" };
    return { border: "border-border", medal: null };
  };

  const status = getStreakStyle(streak);

  return (
    <div className="relative inline-block select-none shrink-0">
      {/* Círculo Principal: Exibe as iniciais */}
      <div className={cn(
        "flex items-center justify-center rounded-full font-bold text-foreground border-2 bg-muted/60 transition-all",
        sizes[size],
        status.border
      )}>
        {iniciais}
      </div>
      
      {/* Medalha de Conquista: Só aparece se o utilizador tiver streak relevante */}
      {status.medal && (
        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-card text-[9px] border shadow-sm">
          {status.medal}
        </div>
      )}
    </div>
  );
}