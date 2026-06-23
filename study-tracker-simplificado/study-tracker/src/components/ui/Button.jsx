// ==========================================
// COMPONENTE DE BOTÃO REUTILIZÁVEL
// ==========================================
// Em vez de duplicar classes CSS por toda a app, centralizamos aqui o estilo.

import { cn } from "@/lib/utils";

// 1. MAPEAMENTO DE VARIANTES (Estilos visuais)
// Permite mudar a aparência do botão apenas mudando a "prop" 'variant'.
const variants = {
  default:     "bg-primary text-primary-foreground hover:bg-primary/90",
  outline:     "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost:       "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
};

// 2. MAPEAMENTO DE TAMANHOS (Escalabilidade)
const sizes = {
  default: "h-9 px-4 py-2",
  sm:      "h-8 px-3 text-xs",
  lg:      "h-10 px-6",
  icon:    "h-9 w-9",
};

export function Button({ className, variant = "default", size = "default", ...props }) {
  return (
    <button
      className={cn(
        // Classes base: aplicadas a TODOS os botões
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variants[variant], // Aplica o estilo conforme a variante escolhida
        sizes[size],       // Aplica o tamanho conforme escolhido
        className          // Permite sobrescrever classes pontualmente se necessário
      )}
      {...props} // "Prop Spreading": passa qualquer atributo (onClick, disabled, type) diretamente para a tag <button>
    />
  );
}