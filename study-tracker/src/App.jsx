import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Calendario from "./pages/Calendario";
import Horario from "./pages/Horario";
import Disciplinas from "./pages/Disciplinas";
import Tarefas from "./pages/Tarefas";
import Pomodoro from "./pages/Pomodoro";
import Notas from "./pages/Notas";
import Objetivos from "./pages/Objetivos";
import Avaliacoes from "./pages/Avaliacoes";
import Estatisticas from "./pages/Estatisticas";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/horario" element={<Horario />} />
        <Route path="/disciplinas" element={<Disciplinas />} />
        <Route path="/tarefas" element={<Tarefas />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/notas" element={<Notas />} />
        <Route path="/objetivos" element={<Objetivos />} />
        <Route path="/avaliacoes" element={<Avaliacoes />} />
        <Route path="/estatisticas" element={<Estatisticas />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  );
}
