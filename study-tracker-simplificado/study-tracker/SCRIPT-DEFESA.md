# Script de Defesa — Study Tracker

Cola informal pra apresentar pra banca. Lê em voz alta como se estivesses a explicar pra um colega — depois adapta com as tuas palavras.

---

## 1. Arquitetura geral da aplicação

O Study Tracker é uma **SPA (Single Page Application)** feita em **React 18** com **Vite** como bundler (é ele que junta o código todo e dá o "servidor de desenvolvimento" rápido) e **Tailwind CSS** para estilizar — em vez de escrever ficheiros `.css` separados, eu coloco classes utilitárias diretamente no JSX (tipo `className="flex items-center"`).

A app não recarrega a página quando o utilizador muda de ecrã: o **React Router DOM** intercepta os cliques nos links e troca só a parte do meio (o `<Outlet />`), mantendo a sidebar fixa. Isso dá uma experiência muito mais fluida, parecida com uma aplicação desktop.

> **Termos para a banca:** SPA, componentização, virtual DOM, declarativo, JSX.

---

## 2. Componentização e organização de pastas

Eu separei o código em pastas com responsabilidades bem definidas — é o princípio da **separação de responsabilidades (separation of concerns)**:

- `src/pages/` → cada ficheiro é uma página inteira (Dashboard, Tarefas, Notas...).
- `src/components/` → componentes reutilizáveis (`Layout`, `ProtectedRoute`).
- `src/components/ui/` → "tijolos" visuais pequenos (`Button`, `Card`, `Dialog`) que aparecem em várias páginas.
- `src/lib/` → lógica que não tem ecrã (autenticação, chamadas à API, utilitários).
- `src/context/` → estado partilhado entre toda a app (tema claro/escuro).

A ideia é que **se eu precisar mudar o aspeto de todos os botões da app, mudo um só ficheiro** (`ui/Button.jsx`) e o resto atualiza automaticamente. Isto é reutilização de código na prática.

> **Termos para a banca:** modularidade, props, componentes reutilizáveis, DRY (Don't Repeat Yourself).

---

## 3. Gestão de estado e persistência de dados

O estado dentro de cada componente é gerido com o hook **`useState`** do React, e os efeitos colaterais (ler dados ao abrir a página, guardar tema quando muda) com o **`useEffect`**.

Para os dados ficarem guardados mesmo quando o utilizador fecha o navegador, eu uso duas estratégias:

- **`localStorage`** — uma "mini base de dados" do próprio browser. Guardo lá tarefas, notas, eventos, horário, objetivos. No ficheiro `src/lib/api.js` criei uma função-fábrica `crud(chave, seed)` que devolve as 4 operações básicas (list, create, update, remove) em vez de eu repetir o mesmo código para cada entidade. Isto reduz o ficheiro em mais de metade.
- **Backend C#/.NET via REST** — para as Disciplinas, em vez do localStorage, faço chamadas `fetch()` autenticadas com um **token JWT** que é guardado depois do login. A função `authFetch()` adiciona automaticamente o cabeçalho `Authorization: Bearer <token>` em todas as chamadas, evitando repetir esse código.

> **Termos para a banca:** hooks (useState, useEffect), CRUD, Web Storage API, REST API, JSON, JWT (JSON Web Token), autenticação.

---

## 4. Proteção de rotas e Context API (tema)

Duas funcionalidades que mostram bem como o React permite resolver problemas globais de forma elegante:

- **`ProtectedRoute.jsx`** — antes de mostrar páginas privadas, verifica se existe um token JWT válido no `localStorage`. Se não houver, redireciona para `/login`. É um padrão simples mas crítico de segurança no frontend (a segurança real fica no backend, mas isto evita mostrar ecrãs vazios a quem não está autenticado).

- **`ThemeContext.jsx`** — usa o **Context API** do React para partilhar o estado do tema (claro/escuro) com toda a app, sem ter que passar "props" manualmente por cada nível de componentes (problema chamado *prop drilling*). Qualquer componente que precise pode chamar `useTheme()` e ler ou alterar o tema. A escolha do utilizador é guardada no `localStorage` para que, ao voltar à app, o tema preferido seja aplicado automaticamente.

> **Termos para a banca:** rotas privadas/públicas, Context API, prop drilling, persistência de preferências, dark mode.

---

## Bónus — perguntas que a banca pode fazer

| Pergunta provável | Resposta curta |
|---|---|
| "Porquê React e não HTML puro?" | Reutilização de componentes, atualização automática do ecrã quando o estado muda, ecossistema enorme. |
| "Porquê Tailwind?" | Escrevo o estilo junto ao componente, evito ficheiros CSS gigantes e classes duplicadas; o build final só inclui as classes que uso (purge). |
| "O que é o JWT?" | É um token assinado pelo backend que prova que o utilizador está autenticado. Tem 3 partes (header, payload, signature) em base64. |
| "Se eu apagar o localStorage o que acontece?" | Os dados desaparecem e a próxima vez que abrires a app os dados-seed são recriados. Por isso as Disciplinas vão para o backend — para serem permanentes. |
| "Como adicionas uma página nova?" | Crio um ficheiro em `src/pages/`, importo-o no `App.jsx` e adiciono uma entrada ao array `rotasPrivadas`. Pronto. |

Boa sorte na defesa! 🎓
