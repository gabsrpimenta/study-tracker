// Pequeno utilitário para combinar classes do Tailwind de forma segura.
// Exemplo: cn("p-2", isActive && "bg-blue-500", "p-4") -> "bg-blue-500 p-4"
// twMerge resolve conflitos (p-2 + p-4 fica só p-4).

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
