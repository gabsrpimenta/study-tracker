import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// ==========================================
// DIALOG (Janela Modal)
// ==========================================
export function Dialog({ open, onClose, title, description, children, footer, className }) {
  
  // EFEITO DE ACESSIBILIDADE: Gestão de eventos de teclado e DOM
  useEffect(() => {
    if (!open) return;
    
    // Fecha a janela se o utilizador pressionar a tecla 'Escape'
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    
    // Bloqueia o scroll da página enquanto a janela estiver aberta
    document.body.style.overflow = "hidden";
    
    // Cleanup: Quando a janela fechar, remove o eventListener e libera o scroll
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null; // Se 'open' for false, não desenha nada no ecrã

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay (Fundo escuro atrás do modal) */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Container do Modal */}
      <div className={cn("relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-xl", className)}>
        <button onClick={onClose} className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-accent">
          <X className="h-4 w-4" />
        </button>
        {title && <h2 className="mb-1 text-lg font-semibold tracking-tight">{title}</h2>}
        {description && <p className="mb-4 text-sm text-muted-foreground">{description}</p>}
        
        <div className="space-y-3">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ==========================================
// SELECT (Dropdown estilizado)
// ==========================================
export function Select({ value, onChange, options, className }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
    >
      {/* Mapeia a lista de opções recebida via props para tags <option> */}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}