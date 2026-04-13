import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Initialize theme before render to prevent flash
const initializeTheme = () => {
  const stored = localStorage.getItem("syndeocare-theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  let theme: "light" | "dark";
  if (stored === "light" || stored === "dark") {
    theme = stored;
  } else {
    theme = systemPrefersDark ? "dark" : "light";
  }
  
  document.documentElement.classList.add(theme);
};

initializeTheme();

createRoot(document.getElementById("root")!).render(<App />);
