import { Crown } from "lucide-react"; // Usamos Crown para os diamantes (30d)

export function Avatar({ user, size = "md", streak = 0, fallbackIniciais }) {
  // Definição de tamanhos padrão
  const sizes = {
    sm: "h-9 w-9 text-xs", // Para o Header/Sidebar lá em cima (GP)
    md: "h-14 w-14 text-lg", // Para o Dashboard Grande (GA)
    lg: "h-24 w-24 text-2xl" // Para o ecrã de Configurações (upload)
  };

  // Lógica de iniciais: Prioridade para o nome real, depois fallback, depois "U"
  const gerarIniciais = () => {
    if (fallbackIniciais) return fallbackIniciais;
    if (!user?.name) return "U";
    return user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  // Integração da Gamificação (Bordas de Metal/Brilho) de acordo com a sequência real
  const obterPremioVisível = (dias) => {
    if (dias >= 30) return { borda: "border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse", medalha: "💎" }; // Cyberpunk/Stealth
    if (dias >= 14) return { borda: "border-amber-400 shadow-md", medalha: "🥇" }; // Ouro
    if (dias >= 7) return { borda: "border-slate-300 shadow-sm", medalha: "🥈" }; // Prata
    if (dias >= 3) return { borda: "border-amber-700", medalha: "🥉" }; // Bronze
    return { borda: "border-border/30", medalha: null }; // Normal
  };

  const status = obterPremioVisível(streak);
  const iniciais = gerarIniciais();

  return (
    <div className="relative inline-block select-none shrink-0 st-animate-icon">
      {/* Círculo Principal: Exibe IMAGEM se existir, senão INICIAIS */}
      <div className={`flex items-center justify-center rounded-full font-bold text-foreground border-2 transition-all duration-500 overflow-hidden ${sizes[size]} ${status.borda} ${user?.avatarUrl ? "" : "bg-muted/60"}`}>
        {user?.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={`Avatar de ${user.name}`} 
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-foreground">{iniciais}</span>
        )}
      </div>
      
      {/* Mini Medalha de Conquista no Canto */}
      {status.medalha && (
        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-card text-[9px] shadow-sm border border-border">
          {status.medalha}
        </div>
      )}
    </div>
  );
}