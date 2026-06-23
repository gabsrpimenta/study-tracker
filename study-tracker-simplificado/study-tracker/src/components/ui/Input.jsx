// ==========================================
// FORMULÁRIO BASE (Input, Textarea, Label)
// ==========================================
// Centralizam o estilo visual (Tailwind) para garantir consistência em toda a app.

import { cn } from "@/lib/utils";

// Input: O campo de texto padrão.
// O uso de {...props} permite que este componente aceite atributos nativos (type, placeholder, onChange, etc).
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// Textarea: Para blocos de texto maiores (usado nas Notas).
export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

// Label: Garante que os títulos dos campos de formulário estão uniformes.
export function Label({ className, ...props }) {
  return <label className={cn("text-sm font-medium leading-none", className)} {...props} />;
}