// ==========================================
// COMPONENTE DE ROTA PROTEGIDA (Guarda-costas)
// ==========================================
// Este componente envolve (abraça) todas as rotas privadas no ficheiro App.jsx.
// O seu único trabalho é verificar se o utilizador tem a "pulseira VIP" (o Token) antes de o deixar entrar.

import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "@/lib/auth";

export default function ProtectedRoute() {
  // O Operador Ternário (condição ? verdadeiro : falso) toma a decisão instantaneamente:
  
  return isLoggedIn() 
    // 1. SE ESTIVER LOGADO (true): 
    // O <Outlet /> atua como uma janela mágica. Ele diz ao React: "Podes desenhar aqui a página que o utilizador pediu" (ex: Dashboard ou Tarefas).
    ? <Outlet /> 
    
    // 2. SE NÃO ESTIVER LOGADO (false): 
    // O <Navigate /> atira o utilizador imediatamente para a página de login.
    // A propriedade 'replace' é crucial: ela apaga a tentativa de acesso do histórico do navegador, 
    // impedindo que o utilizador tente usar a "Seta de Voltar" para contornar o bloqueio.
    : <Navigate to="/login" replace />;
}