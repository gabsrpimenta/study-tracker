// Ponto de entrada da aplicação React.
// É aqui que dizemos ao React: "começa a desenhar o <App /> dentro do elemento #root do index.html".

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner"; // mostra notificações pop-up (ex: "Tarefa criada!")
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext"; // gere tema claro/escuro
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* ThemeProvider partilha o tema com toda a app */}
    <ThemeProvider>
      {/* BrowserRouter ativa o sistema de rotas (URLs) */}
      <BrowserRouter>
        <App />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
