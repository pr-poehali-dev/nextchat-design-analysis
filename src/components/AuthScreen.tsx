import { useState } from "react";
import Icon from "@/components/ui/icon";

const API_AUTH = "https://functions.poehali.dev/6446d4e1-2a65-402c-b76f-f3cfabd0d02e";

interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
  status?: string;
}

interface AuthScreenProps {
  onAuth: (token: string, user: User) => void;
}

export default function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    if (!username.trim() || !password.trim()) { setError("Заполните все поля"); return; }
    if (mode === "register" && !name.trim()) { setError("Введите имя"); return; }

    setLoading(true);
    try {
      const body: Record<string, string> = { username: username.trim().toLowerCase(), password };
      if (mode === "register") body.name = name.trim();

      const res = await fetch(`${API_AUTH}?action=${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка"); return; }
      localStorage.setItem("nc_token", data.token);
      onAuth(data.token, data.user);
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", fontSize: 15,
    border: "1.5px solid var(--nc-border)", borderRadius: 12,
    background: "var(--nc-chat-bg)", color: "var(--nc-text-primary)",
    outline: "none", fontFamily: "'Golos Text', sans-serif",
    boxSizing: "border-box" as const, transition: "border-color 0.15s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--nc-chat-bg)", fontFamily: "'Golos Text', sans-serif", padding: 16,
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        background: "var(--nc-panel)", borderRadius: 24,
        padding: 40, boxShadow: "0 24px 64px rgba(0,0,0,0.08)",
        border: "1px solid var(--nc-border)",
      }} className="animate-scale-in">

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32, gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, overflow: "hidden", boxShadow: "0 8px 24px rgba(42,93,255,0.25)" }}>
            <img
              src="https://cdn.poehali.dev/projects/8ad0a852-8f58-44b9-91c1-f968494c353f/bucket/d90bdd7d-71bf-4c1c-9091-f09679b3dc28.jpg"
              alt="NextChat"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--nc-text-primary)", letterSpacing: "-0.5px" }}>NextChat</div>
            <div style={{ fontSize: 13, color: "var(--nc-text-secondary)", marginTop: 2 }}>
              {mode === "login" ? "Войдите в свой аккаунт" : "Создайте аккаунт"}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", background: "var(--nc-chat-bg)",
          borderRadius: 12, padding: 4, marginBottom: 24,
          border: "1px solid var(--nc-border)",
        }}>
          {(["login", "register"] as const).map(tab => (
            <button key={tab}
              style={{
                flex: 1, padding: "9px 0", border: "none", cursor: "pointer",
                borderRadius: 9, fontFamily: "'Golos Text', sans-serif",
                fontSize: 14, fontWeight: 600, transition: "all 0.2s",
                background: mode === tab ? "var(--nc-panel)" : "transparent",
                color: mode === tab ? "var(--nc-blue)" : "var(--nc-text-secondary)",
                boxShadow: mode === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
              onClick={() => { setMode(tab); setError(""); }}
            >
              {tab === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mode === "register" && (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--nc-text-secondary)", display: "flex" }}>
                <Icon name="User" size={17} />
              </div>
              <input
                style={{ ...inputStyle, paddingLeft: 42 }}
                placeholder="Ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "var(--nc-blue)"; }}
                onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "var(--nc-border)"; }}
              />
            </div>
          )}

          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--nc-text-secondary)", display: "flex" }}>
              <Icon name="AtSign" size={17} />
            </div>
            <input
              style={{ ...inputStyle, paddingLeft: 42 }}
              placeholder="Имя пользователя"
              value={username}
              onChange={e => setUsername(e.target.value.replace(/\s/g, ""))}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "var(--nc-blue)"; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "var(--nc-border)"; }}
              onKeyDown={e => e.key === "Enter" && submit()}
            />
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--nc-text-secondary)", display: "flex" }}>
              <Icon name="Lock" size={17} />
            </div>
            <input
              type={showPass ? "text" : "password"}
              style={{ ...inputStyle, paddingLeft: 42, paddingRight: 44 }}
              placeholder={mode === "register" ? "Пароль (минимум 6 символов)" : "Пароль"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "var(--nc-blue)"; }}
              onBlur={e => { (e.target as HTMLInputElement).style.borderColor = "var(--nc-border)"; }}
              onKeyDown={e => e.key === "Enter" && submit()}
            />
            <button
              onClick={() => setShowPass(p => !p)}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--nc-text-secondary)", display: "flex" }}
            >
              <Icon name={showPass ? "EyeOff" : "Eye"} size={17} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#DC2626", borderRadius: 10, padding: "10px 14px",
              fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }} className="animate-fade-in">
              <Icon name="AlertCircle" size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%", padding: "13px 0", background: loading ? "var(--nc-text-secondary)" : "var(--nc-blue)",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Golos Text', sans-serif",
              transition: "all 0.15s", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--nc-blue-hover)"; }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = "var(--nc-blue)"; }}
          >
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                {mode === "login" ? "Входим..." : "Регистрируем..."}
              </>
            ) : (
              <>
                <Icon name={mode === "login" ? "LogIn" : "UserPlus"} size={18} style={{ color: "#fff" }} />
                {mode === "login" ? "Войти" : "Зарегистрироваться"}
              </>
            )}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--nc-text-secondary)", marginTop: 20, lineHeight: 1.6 }}>
          Продолжая, вы принимаете условия использования NextChat
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
