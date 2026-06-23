// ==========================================
// THEME CONTEXT (Gestor de Estado Global - Claro/Escuro)
// ==========================================
// A Context API permite partilhar o estado (theme) por toda a aplicação
// sem termos de passar variáveis manualmente de pai para filho (evitando Prop Drilling).

import { createContext, useContext, useEffect, useState } from "react";

// 1. CRIAR O CONTEXTO: É como criar um "canal de rádio" vazio onde vamos transmitir o tema.
const ThemeContext = createContext(null);

// 2. PROVEDOR DO CONTEXTO: Envolve a aplicação inteira (no App.jsx ou main.jsx) e fornece os dados.
export function ThemeProvider({ children }) {
  
  // Estado principal que guarda a palavra "light" ou "dark".
  const [theme, setTheme] = useState("light");

  // EFEITO 1 (Ao abrir a App): Descobrir qual é a preferência do utilizador.
  useEffect(() => {
    // Tenta ler o que foi salvo no navegador (localStorage) na última visita.
    const guardado = localStorage.getItem("theme");
    
    // Se não tiver nada guardado, verifica as definições do próprio Sistema Operativo (ex: Windows/Mac no modo noturno).
    const inicial = guardado || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    
    setTheme(inicial);
  }, []); // O array vazio indica que isto só corre uma única vez quando a aplicação arranca.

  // EFEITO 2 (Sempre que a variável 'theme' muda): Atualizar o DOM visualmente.
  useEffect(() => {
    // Injeta ou remove a classe CSS 'dark' diretamente na tag <html> do documento.
    // É esta classe que diz ao Tailwind CSS para ativar as cores do Dark Mode.
    document.documentElement.classList.toggle("dark", theme === "dark");
    
    // Guarda a nova preferência na memória do navegador.
    localStorage.setItem("theme", theme);
  }, [theme]); // Este useEffect corre sempre que o estado 'theme' for alterado.

  // Função utilitária atrelada ao botão de Sol/Lua no menu lateral (Layout.jsx).
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Transmitimos as variáveis (theme) e as funções (toggleTheme) para qualquer filho que queira ouvir.
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. HOOK PERSONALIZADO: O "Recetor de Rádio"
// Criamos a função useTheme() para que qualquer página possa simplesmente chamar: const { theme } = useTheme();
export const useTheme = () => useContext(ThemeContext);