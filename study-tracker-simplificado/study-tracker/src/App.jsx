// Arquivo principal de rotas da aplicação.
// Aqui definimos quais URLs (ex: /tarefas) mostram qual página.
// Usamos a biblioteca react-router-dom para gerir a navegação sem recarregar a página (SPA).

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas Públicas
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";

// Páginas Privadas (Centralizadas e Otimizadas)
import Dashboard from "./pages/Dashboard";
import DesempenhoAcademico from "./pages/DesempenhoAcademico";
import Organizacao from "./pages/Organizacao";

// Lista de rotas privadas (só acessíveis depois de fazer login).
// Em vez de repetir <Route ... /> várias vezes, geramos com .map().
const rotasPrivadas = [
  // Dashboard agora concentra também as Estatísticas e os Objetivos
  { path: "/", element: <Dashboard /> },
  
  // CORREÇÃO: O path agora é "/disciplinas" para bater certo com o Menu Lateral (Espaço Acadêmico)
  { path: "/disciplinas", element: <DesempenhoAcademico /> },
  
  // Tarefas agora concentra também o Horário e a Agenda (Calendário)
  { path: "/tarefas", element: <Organizacao /> },
];

export default function App() {
  return (
    <Routes>
      {/* Rotas públicas: qualquer pessoa pode aceder sem estar logada */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* Rotas privadas: ProtectedRoute verifica login; Layout adiciona a sidebar/menu */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {rotasPrivadas.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>
      </Route>
    </Routes>
  );
}