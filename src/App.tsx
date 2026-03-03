
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthScreen from "./components/AuthScreen";

const API_AUTH = "https://functions.poehali.dev/6446d4e1-2a65-402c-b76f-f3cfabd0d02e";
const queryClient = new QueryClient();

interface User { id: number; name: string; username: string; avatar: string; status?: string; }

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("nc_token");
    if (!saved) { setChecking(false); return; }
    fetch(API_AUTH, { headers: { "Authorization": `Bearer ${saved}` } })
      .then(r => r.json())
      .then(data => {
        if (data.id) { setToken(saved); setUser(data); }
        else localStorage.removeItem("nc_token");
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleAuth = (t: string, u: User) => { setToken(t); setUser(u); };
  const handleLogout = () => { localStorage.removeItem("nc_token"); setToken(null); setUser(null); };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--nc-chat-bg)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden" }}>
          <img src="https://cdn.poehali.dev/projects/8ad0a852-8f58-44b9-91c1-f968494c353f/bucket/d90bdd7d-71bf-4c1c-9091-f09679b3dc28.jpg" style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    );
  }

  if (!token || !user) return <AuthScreen onAuth={handleAuth} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index currentUser={user} token={token} onLogout={handleLogout} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;