/**
 * SyndeoCare Web — Application Entry Point
 *
 * Initialises React with:
 *   - i18n (Arabic RTL + English)
 *   - TanStack Query (server state)
 *   - Error Boundary (crash protection)
 *   - Auth Provider (session management)
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { getSupabaseClient } from "@syndeocare/database";
import { AuthProvider } from "@syndeocare/auth";
import { QUERY } from "@syndeocare/config";
import "@syndeocare/i18n"; // Side-effect: initialises i18next
import App from "./App";
import "./index.css";

// ── Query Client ────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY.staleTime,
      gcTime: QUERY.gcTime,
      retry: QUERY.retryCount,
      refetchOnWindowFocus: false,
    },
  },
});

// ── Supabase Client ─────────────────────────────────────────────────────────
const supabase = getSupabaseClient();

// ── Render ──────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider supabase={supabase}>
          <App />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
