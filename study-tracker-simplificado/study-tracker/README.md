# Study Tracker

Aplicação web de gestão de estudos construída com **React + Vite + Tailwind CSS** e **JavaScript puro** (sem TypeScript).

## Como correr no teu MacBook

1. Extrai o ZIP e abre a pasta no VS Code.
2. Instala as dependências:

```bash
npm install
```

3. Inicia o servidor de desenvolvimento:

```bash
npm run dev
```

4. Abre o navegador em http://localhost:5173

## Funcionalidades

- **Dashboard** — visão geral com gráfico semanal, tarefas em foco, próximos eventos e disciplinas.
- **Calendário** — eventos académicos (testes, entregas, projetos) com CRUD.
- **Horário** — grelha semanal de aulas.
- **Disciplinas** — gestão de disciplinas com progresso.
- **Tarefas** — to-do com prioridade, prazo e filtros.
- **Pomodoro** — timer 25/5 que regista sessões de estudo automaticamente.
- **Notas** — apontamentos por disciplina com pesquisa.
- **Objetivos** — metas semanais com progresso.
- **Avaliações** — notas com média ponderada por disciplina.
- **Estatísticas** — gráficos de horas estudadas e desempenho.
- **Configurações** — tema claro/escuro, perfil, notificações.

## Persistência

Todos os dados são guardados no `localStorage` do navegador via `src/lib/api.js`.
Para ligar a uma API real (REST, Supabase, Firebase...), basta substituir o corpo das funções
nesse ficheiro por chamadas `fetch`/SDK. As assinaturas já são assíncronas.

## Estrutura

```
src/
├── components/
│   ├── ui/             # Componentes UI (Card, Button, Input, Dialog, etc.)
│   └── Layout.jsx      # Sidebar + Header + Footer
├── context/
│   └── ThemeContext.jsx
├── lib/
│   ├── api.js          # Camada de dados (localStorage)
│   └── utils.js        # cn() helper
├── pages/              # Uma página por rota
├── App.jsx
├── main.jsx
└── index.css
```

---
© Study Tracker — Técnico Especialista em Programação de Sistemas 2025/2026
