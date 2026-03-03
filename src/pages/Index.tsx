import { useState } from "react";
import Icon from "@/components/ui/icon";

type Section = "chats" | "contacts" | "bots" | "profile" | "settings" | "archive";
type Theme = "light" | "dark";

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  pinned?: boolean;
  isGroup?: boolean;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
  status?: "sent" | "read";
  replyTo?: string;
}

const CHATS: Chat[] = [
  { id: 1, name: "Алексей Петров", avatar: "АП", lastMessage: "Окей, увидимся завтра!", time: "14:32", unread: 2, online: true, pinned: true },
  { id: 2, name: "Команда проекта", avatar: "КП", lastMessage: "Дизайн готов к ревью", time: "13:15", unread: 7, online: false, isGroup: true, pinned: true },
  { id: 3, name: "Мария Соколова", avatar: "МС", lastMessage: "Спасибо за помощь 🙏", time: "12:44", unread: 0, online: true },
  { id: 4, name: "Дмитрий Иванов", avatar: "ДИ", lastMessage: "Отправил документы на почту", time: "11:20", unread: 0, online: false },
  { id: 5, name: "Разработка", avatar: "РА", lastMessage: "Баг исправлен, деплой завтра", time: "Вчера", unread: 0, online: false, isGroup: true },
  { id: 6, name: "Анна Кузнецова", avatar: "АК", lastMessage: "Хорошо, договорились!", time: "Вчера", unread: 0, online: false },
  { id: 7, name: "Игорь Смирнов", avatar: "ИС", lastMessage: "Позвоню чуть позже", time: "Пн", unread: 0, online: true },
  { id: 8, name: "Маркетинг", avatar: "МК", lastMessage: "Кампания запущена 🚀", time: "Пн", unread: 0, online: false, isGroup: true },
];

const MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Привет! Как дела?", time: "14:10", isOwn: false },
    { id: 2, text: "Всё отлично, работаю над новым проектом", time: "14:12", isOwn: true, status: "read" },
    { id: 3, text: "Круто! Что за проект?", time: "14:15", isOwn: false },
    { id: 4, text: "Разрабатываю мессенджер NextChat — минималистичный, быстрый и с ИИ-ассистентом", time: "14:18", isOwn: true, status: "read" },
    { id: 5, text: "Звучит интересно! Когда можно будет попробовать?", time: "14:25", isOwn: false },
    { id: 6, text: "Первая версия уже скоро. Запишу тебя в бета-тестеры!", time: "14:28", isOwn: true, status: "read" },
    { id: 7, text: "Окей, увидимся завтра!", time: "14:32", isOwn: false },
  ],
  2: [
    { id: 1, text: "Всем привет! Сегодня обсуждаем новый дизайн", time: "09:00", isOwn: false },
    { id: 2, text: "Я готов, подключаюсь", time: "09:05", isOwn: true, status: "read" },
    { id: 3, text: "Дизайн готов к ревью", time: "13:15", isOwn: false },
  ],
  3: [
    { id: 1, text: "Помогли с отчётом — очень выручили!", time: "12:40", isOwn: false },
    { id: 2, text: "Не за что, всегда рад помочь", time: "12:42", isOwn: true, status: "read" },
    { id: 3, text: "Спасибо за помощь 🙏", time: "12:44", isOwn: false },
  ],
};

const CONTACTS = [
  { id: 1, name: "Алексей Петров", avatar: "АП", status: "В сети", online: true },
  { id: 2, name: "Анна Кузнецова", avatar: "АК", status: "Был(а) час назад", online: false },
  { id: 3, name: "Дмитрий Иванов", avatar: "ДИ", status: "Был(а) вчера", online: false },
  { id: 4, name: "Игорь Смирнов", avatar: "ИС", status: "В сети", online: true },
  { id: 5, name: "Мария Соколова", avatar: "МС", status: "В сети", online: true },
];

const BOTS = [
  { id: 1, name: "Погода", avatar: "🌤", desc: "Прогноз погоды в любом городе", category: "Утилиты" },
  { id: 2, name: "Переводчик", avatar: "🌐", desc: "Перевод на 50+ языков", category: "Языки" },
  { id: 3, name: "ИИ-ассистент", avatar: "🤖", desc: "Умный помощник на базе ИИ", category: "ИИ" },
  { id: 4, name: "Напоминания", avatar: "⏰", desc: "Умные напоминания и задачи", category: "Продуктивность" },
  { id: 5, name: "Курсы валют", avatar: "💱", desc: "Актуальные курсы и конвертер", category: "Финансы" },
  { id: 6, name: "Новости", avatar: "📰", desc: "Главные новости дня", category: "Медиа" },
];

const NAV_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: "chats", icon: "MessageCircle", label: "Чаты" },
  { id: "contacts", icon: "Users", label: "Контакты" },
  { id: "bots", icon: "Bot", label: "Боты" },
  { id: "profile", icon: "User", label: "Профиль" },
  { id: "settings", icon: "Settings", label: "Настройки" },
  { id: "archive", icon: "Archive", label: "Архив" },
];

function Avatar({ initials, size = 40, color = "blue" }: { initials: string; size?: number; color?: string }) {
  const colors: Record<string, string> = {
    blue: "background: var(--nc-blue); color: #fff",
    gray: "background: var(--nc-border); color: var(--nc-text-secondary)",
  };
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.36, fontWeight: 600, flexShrink: 0,
        background: color === "blue" ? "var(--nc-blue)" : "#E8EAF0",
        color: color === "blue" ? "#fff" : "var(--nc-text-secondary)",
      }}
    >
      {initials}
    </div>
  );
}

export default function Index() {
  const [theme, setTheme] = useState<Theme>("light");
  const [section, setSection] = useState<Section>("chats");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState(MESSAGES);

  const isDark = theme === "dark";

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const filteredChats = CHATS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!inputText.trim() || !activeChat) return;
    const chatId = activeChat.id;
    const newMsg: Message = {
      id: Date.now(),
      text: inputText.trim(),
      time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
      isOwn: true,
      status: "sent",
    };
    setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), newMsg] }));
    setInputText("");
  };

  const s = {
    app: {
      display: "flex", height: "100vh", overflow: "hidden",
      background: "var(--nc-chat-bg)",
      fontFamily: "'Golos Text', sans-serif",
    } as React.CSSProperties,
    // Left nav
    nav: {
      width: 64, background: "var(--nc-sidebar)",
      borderRight: "1px solid var(--nc-border)",
      display: "flex", flexDirection: "column" as const,
      alignItems: "center", paddingTop: 16, paddingBottom: 16, gap: 4,
      flexShrink: 0, zIndex: 10,
    },
    navLogo: {
      width: 36, height: 36, borderRadius: 10,
      background: "var(--nc-blue)", display: "flex",
      alignItems: "center", justifyContent: "center",
      marginBottom: 16, flexShrink: 0,
    },
    navBtn: (active: boolean) => ({
      width: 44, height: 44, borderRadius: 12,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", transition: "all 0.18s",
      background: active ? "var(--nc-blue-light)" : "transparent",
      color: active ? "var(--nc-blue)" : "var(--nc-text-secondary)",
      border: "none", outline: "none",
    } as React.CSSProperties),
    // Sidebar
    sidebar: {
      width: 300, background: "var(--nc-sidebar)",
      borderRight: "1px solid var(--nc-border)",
      display: "flex", flexDirection: "column" as const, flexShrink: 0,
    },
    sidebarHeader: {
      padding: "20px 16px 12px",
      borderBottom: "1px solid var(--nc-border)",
    },
    sidebarTitle: {
      fontSize: 20, fontWeight: 700,
      color: "var(--nc-text-primary)",
      marginBottom: 12,
    },
    searchBox: {
      display: "flex", alignItems: "center", gap: 8,
      background: "var(--nc-chat-bg)",
      borderRadius: 10, padding: "8px 12px",
      border: "1px solid var(--nc-border)",
    },
    searchInput: {
      flex: 1, border: "none", outline: "none",
      background: "transparent", fontSize: 14,
      color: "var(--nc-text-primary)",
      fontFamily: "'Golos Text', sans-serif",
    } as React.CSSProperties,
    // Chat item
    chatItem: (active: boolean) => ({
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 16px", cursor: "pointer",
      transition: "background 0.15s",
      background: active ? "var(--nc-blue-light)" : "transparent",
      borderLeft: active ? "3px solid var(--nc-blue)" : "3px solid transparent",
    } as React.CSSProperties),
    chatName: {
      fontSize: 14, fontWeight: 600,
      color: "var(--nc-text-primary)", lineHeight: 1.3,
    },
    chatLast: {
      fontSize: 13, color: "var(--nc-text-secondary)",
      overflow: "hidden", textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const, maxWidth: 150,
    },
    chatTime: { fontSize: 12, color: "var(--nc-text-secondary)", flexShrink: 0 },
    unreadBadge: {
      background: "var(--nc-blue)", color: "#fff",
      borderRadius: 10, fontSize: 11, fontWeight: 700,
      padding: "2px 7px", minWidth: 20, textAlign: "center" as const,
    },
    // Main chat area
    chatArea: {
      flex: 1, display: "flex", flexDirection: "column" as const,
      background: "var(--nc-chat-bg)", overflow: "hidden",
    },
    chatHeader: {
      padding: "12px 20px", background: "var(--nc-panel)",
      borderBottom: "1px solid var(--nc-border)",
      display: "flex", alignItems: "center", gap: 12,
    },
    chatMessages: {
      flex: 1, overflowY: "auto" as const, padding: "20px 24px",
      display: "flex", flexDirection: "column" as const, gap: 6,
    },
    // Message bubbles
    bubbleWrap: (own: boolean) => ({
      display: "flex", justifyContent: own ? "flex-end" : "flex-start",
      animation: "fade-in 0.2s ease-out",
    } as React.CSSProperties),
    bubble: (own: boolean) => ({
      maxWidth: "62%", padding: "10px 14px", borderRadius: own ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
      background: own ? "var(--nc-bubble-out)" : "var(--nc-bubble-in)",
      color: own ? "#fff" : "var(--nc-text-primary)",
      fontSize: 14, lineHeight: 1.55,
      boxShadow: own ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
      border: own ? "none" : "1px solid var(--nc-border)",
    } as React.CSSProperties),
    bubbleTime: (own: boolean) => ({
      fontSize: 11, marginTop: 4, textAlign: "right" as const,
      color: own ? "rgba(255,255,255,0.65)" : "var(--nc-text-secondary)",
      display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3,
    } as React.CSSProperties),
    // Input
    inputArea: {
      padding: "12px 20px", background: "var(--nc-panel)",
      borderTop: "1px solid var(--nc-border)",
      display: "flex", alignItems: "center", gap: 12,
    },
    inputBox: {
      flex: 1, background: "var(--nc-chat-bg)",
      border: "1px solid var(--nc-border)",
      borderRadius: 22, padding: "10px 16px",
      fontSize: 14, outline: "none",
      color: "var(--nc-text-primary)",
      fontFamily: "'Golos Text', sans-serif",
      resize: "none" as const,
      lineHeight: 1.4,
    } as React.CSSProperties,
    sendBtn: {
      width: 44, height: 44, borderRadius: "50%",
      background: "var(--nc-blue)", border: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
      color: "#fff",
    } as React.CSSProperties,
    iconBtn: {
      width: 36, height: 36, borderRadius: "50%",
      background: "transparent", border: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", color: "var(--nc-text-secondary)", transition: "all 0.15s",
    } as React.CSSProperties,
    // Empty state
    empty: {
      flex: 1, display: "flex", flexDirection: "column" as const,
      alignItems: "center", justifyContent: "center",
      color: "var(--nc-text-secondary)", gap: 12,
    },
    // Sections
    sectionContent: {
      flex: 1, display: "flex", flexDirection: "column" as const,
      background: "var(--nc-panel)", padding: 28,
      overflowY: "auto" as const,
    },
    sectionTitle: {
      fontSize: 22, fontWeight: 700, color: "var(--nc-text-primary)", marginBottom: 20,
    },
    card: {
      background: "var(--nc-chat-bg)", borderRadius: 14,
      padding: "14px 16px", marginBottom: 8,
      display: "flex", alignItems: "center", gap: 14,
      border: "1px solid var(--nc-border)", cursor: "pointer",
      transition: "all 0.15s",
    } as React.CSSProperties,
  };

  const chatMsgs = activeChat ? (messages[activeChat.id] || []) : [];
  const pinnedChats = filteredChats.filter(c => c.pinned);
  const regularChats = filteredChats.filter(c => !c.pinned);

  const renderChatList = () => (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {pinnedChats.length > 0 && (
        <>
          <div style={{ padding: "8px 16px 4px", fontSize: 11, fontWeight: 600, color: "var(--nc-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Закреплённые
          </div>
          {pinnedChats.map(chat => <ChatRow key={chat.id} chat={chat} />)}
        </>
      )}
      {regularChats.length > 0 && (
        <>
          {pinnedChats.length > 0 && (
            <div style={{ padding: "8px 16px 4px", fontSize: 11, fontWeight: 600, color: "var(--nc-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Все чаты
            </div>
          )}
          {regularChats.map(chat => <ChatRow key={chat.id} chat={chat} />)}
        </>
      )}
      {filteredChats.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: "var(--nc-text-secondary)", fontSize: 14 }}>
          Ничего не найдено
        </div>
      )}
    </div>
  );

  const ChatRow = ({ chat }: { chat: Chat }) => (
    <div
      style={s.chatItem(activeChat?.id === chat.id)}
      onClick={() => { setActiveChat(chat); setSection("chats"); }}
      onMouseEnter={e => { if (activeChat?.id !== chat.id) (e.currentTarget as HTMLElement).style.background = "var(--nc-chat-bg)"; }}
      onMouseLeave={e => { if (activeChat?.id !== chat.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <div style={{ position: "relative" }}>
        <Avatar initials={chat.avatar} size={42} color={chat.isGroup ? "gray" : "blue"} />
        {chat.online && !chat.isGroup && (
          <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "var(--nc-online)", border: "2px solid var(--nc-sidebar)" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
          <div style={{ ...s.chatName, display: "flex", alignItems: "center", gap: 5 }}>
            {chat.name}
            {chat.pinned && <Icon name="Pin" size={11} style={{ color: "var(--nc-text-secondary)" }} />}
            {chat.isGroup && <Icon name="Users" size={11} style={{ color: "var(--nc-text-secondary)" }} />}
          </div>
          <span style={s.chatTime}>{chat.time}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={s.chatLast}>{chat.lastMessage}</span>
          {chat.unread > 0 && <span style={s.unreadBadge}>{chat.unread}</span>}
        </div>
      </div>
    </div>
  );

  const renderSidebar = () => {
    if (section === "chats") {
      return (
        <div style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <div style={s.sidebarTitle}>Сообщения</div>
            <div style={s.searchBox}>
              <Icon name="Search" size={16} style={{ color: "var(--nc-text-secondary)", flexShrink: 0 }} />
              <input
                style={s.searchInput}
                placeholder="Поиск чатов..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          {renderChatList()}
        </div>
      );
    }
    return null;
  };

  const renderMainArea = () => {
    if (section === "contacts") {
      return (
        <div style={s.sectionContent} className="animate-fade-in">
          <div style={s.sectionTitle}>Контакты</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, background: "var(--nc-chat-bg)", borderRadius: 10, padding: "8px 14px", border: "1px solid var(--nc-border)" }}>
            <Icon name="Search" size={16} style={{ color: "var(--nc-text-secondary)" }} />
            <input style={{ ...s.searchInput, background: "transparent" }} placeholder="Поиск контактов..." />
          </div>
          {CONTACTS.map(c => (
            <div key={c.id} style={s.card}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--nc-blue)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--nc-border)"; }}
            >
              <div style={{ position: "relative" }}>
                <Avatar initials={c.avatar} size={44} />
                {c.online && (
                  <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: "var(--nc-online)", border: "2px solid var(--nc-chat-bg)" }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--nc-text-primary)" }}>{c.name}</div>
                <div style={{ fontSize: 13, color: c.online ? "var(--nc-online)" : "var(--nc-text-secondary)" }}>{c.status}</div>
              </div>
              <button style={s.iconBtn} title="Написать сообщение">
                <Icon name="MessageCircle" size={18} />
              </button>
              <button style={s.iconBtn} title="Позвонить">
                <Icon name="Phone" size={18} />
              </button>
            </div>
          ))}
        </div>
      );
    }

    if (section === "bots") {
      return (
        <div style={s.sectionContent} className="animate-fade-in">
          <div style={s.sectionTitle}>Боты и сервисы</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {BOTS.map(bot => (
              <div key={bot.id}
                style={{ ...s.card, flexDirection: "column", alignItems: "flex-start", gap: 10 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--nc-blue)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(42,93,255,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--nc-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                  <div style={{ fontSize: 32, lineHeight: 1 }}>{bot.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "var(--nc-text-primary)" }}>{bot.name}</div>
                    <span style={{ fontSize: 11, background: "var(--nc-blue-light)", color: "var(--nc-blue)", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{bot.category}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--nc-text-secondary)", lineHeight: 1.5 }}>{bot.desc}</div>
                <button style={{ background: "var(--nc-blue)", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "'Golos Text', sans-serif" }}>
                  Запустить
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (section === "profile") {
      return (
        <div style={s.sectionContent} className="animate-fade-in">
          <div style={s.sectionTitle}>Профиль</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 20, paddingBottom: 32 }}>
            <div style={{ position: "relative" }}>
              <Avatar initials="ВИ" size={88} />
              <button style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "var(--nc-blue)", border: "2px solid var(--nc-panel)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Icon name="Camera" size={13} style={{ color: "#fff" }} />
              </button>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--nc-text-primary)" }}>Владимир Иванов</div>
              <div style={{ fontSize: 14, color: "var(--nc-text-secondary)", marginTop: 4 }}>@vladimir_iv</div>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.1)", color: "#16a34a", borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E" }} />
              В сети
            </div>
          </div>
          {[
            { icon: "Phone", label: "Телефон", value: "+7 (999) 123-45-67" },
            { icon: "Mail", label: "Email", value: "v.ivanov@email.com" },
            { icon: "Info", label: "О себе", value: "Разрабатываю NextChat 🚀" },
            { icon: "MapPin", label: "Город", value: "Москва, Россия" },
          ].map(row => (
            <div key={row.label} style={{ ...s.card, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--nc-blue-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={row.icon} size={18} style={{ color: "var(--nc-blue)" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "var(--nc-text-secondary)" }}>{row.label}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--nc-text-primary)" }}>{row.value}</div>
              </div>
              <Icon name="ChevronRight" size={16} style={{ color: "var(--nc-text-secondary)" }} />
            </div>
          ))}
        </div>
      );
    }

    if (section === "settings") {
      return (
        <div style={s.sectionContent} className="animate-fade-in">
          <div style={s.sectionTitle}>Настройки</div>
          {[
            {
              group: "Внешний вид", items: [
                { icon: isDark ? "Moon" : "Sun", label: "Тема", value: isDark ? "Тёмная" : "Светлая", action: toggleTheme },
                { icon: "Type", label: "Шрифт", value: "Golos Text" },
                { icon: "Palette", label: "Акцентный цвет", value: "Синий (#2A5DFF)" },
              ]
            },
            {
              group: "Уведомления", items: [
                { icon: "Bell", label: "Push-уведомления", value: "Включены" },
                { icon: "VolumeX", label: "Звук сообщений", value: "Вкл" },
              ]
            },
            {
              group: "Приватность", items: [
                { icon: "Shield", label: "Двухфакторная аутентификация", value: "Включена" },
                { icon: "Eye", label: "Кто видит фото профиля", value: "Все" },
                { icon: "Clock", label: "Время последнего захода", value: "Только контакты" },
              ]
            },
          ].map(group => (
            <div key={group.group} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--nc-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, paddingLeft: 4 }}>{group.group}</div>
              {group.items.map(item => (
                <div key={item.label}
                  style={{ ...s.card, cursor: item.action ? "pointer" : "default" }}
                  onClick={item.action}
                  onMouseEnter={e => { if (item.action) (e.currentTarget as HTMLElement).style.borderColor = "var(--nc-blue)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--nc-border)"; }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--nc-blue-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={item.icon} size={17} style={{ color: "var(--nc-blue)" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--nc-text-primary)" }}>{item.label}</div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--nc-text-secondary)" }}>{item.value}</div>
                  <Icon name="ChevronRight" size={15} style={{ color: "var(--nc-text-secondary)" }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (section === "archive") {
      return (
        <div style={s.sectionContent} className="animate-fade-in">
          <div style={s.sectionTitle}>Архив</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12, color: "var(--nc-text-secondary)", paddingTop: 60 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--nc-chat-bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--nc-border)" }}>
              <Icon name="Archive" size={28} style={{ color: "var(--nc-text-secondary)" }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--nc-text-primary)" }}>Архив пуст</div>
            <div style={{ fontSize: 14, textAlign: "center", maxWidth: 240, lineHeight: 1.6 }}>Сюда попадут чаты, которые вы перенесёте в архив</div>
          </div>
        </div>
      );
    }

    // Chats section — main chat view
    if (section === "chats") {
      if (!activeChat) {
        return (
          <div style={s.empty} className="animate-fade-in">
            <div style={{ width: 72, height: 72, borderRadius: 22, overflow: "hidden", boxShadow: "0 8px 32px rgba(42,93,255,0.25)" }}>
              <img src="https://cdn.poehali.dev/projects/8ad0a852-8f58-44b9-91c1-f968494c353f/bucket/d90bdd7d-71bf-4c1c-9091-f09679b3dc28.jpg" alt="NextChat" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--nc-text-primary)" }}>Выберите чат</div>
            <div style={{ fontSize: 14, maxWidth: 240, textAlign: "center", lineHeight: 1.7, color: "var(--nc-text-secondary)" }}>
              Выберите чат из списка слева или начните новый разговор
            </div>
            <button style={{ marginTop: 8, background: "var(--nc-blue)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Golos Text', sans-serif" }}>
              Новый чат
            </button>
          </div>
        );
      }

      return (
        <div style={s.chatArea}>
          {/* Chat header */}
          <div style={s.chatHeader}>
            <div style={{ position: "relative" }}>
              <Avatar initials={activeChat.avatar} size={40} color={activeChat.isGroup ? "gray" : "blue"} />
              {activeChat.online && !activeChat.isGroup && (
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "var(--nc-online)", border: "2px solid var(--nc-panel)" }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--nc-text-primary)" }}>{activeChat.name}</div>
              <div style={{ fontSize: 12, color: activeChat.online && !activeChat.isGroup ? "var(--nc-online)" : "var(--nc-text-secondary)" }}>
                {activeChat.isGroup ? `${Math.floor(Math.random() * 20) + 5} участников` : activeChat.online ? "В сети" : "Был(а) недавно"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button style={s.iconBtn} title="Голосовой звонок">
                <Icon name="Phone" size={18} />
              </button>
              <button style={s.iconBtn} title="Видеозвонок">
                <Icon name="Video" size={18} />
              </button>
              <button style={s.iconBtn} title="Поиск">
                <Icon name="Search" size={18} />
              </button>
              <button style={s.iconBtn} title="Меню">
                <Icon name="MoreVertical" size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={s.chatMessages}>
            {chatMsgs.map((msg, i) => (
              <div key={msg.id} style={{ ...s.bubbleWrap(msg.isOwn), animationDelay: `${i * 0.03}s` }}>
                <div style={s.bubble(msg.isOwn)}>
                  <div>{msg.text}</div>
                  <div style={s.bubbleTime(msg.isOwn)}>
                    {msg.time}
                    {msg.isOwn && (
                      <Icon
                        name={msg.status === "read" ? "CheckCheck" : "Check"}
                        size={13}
                        style={{ color: msg.status === "read" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={s.inputArea}>
            <button style={s.iconBtn} title="Прикрепить файл">
              <Icon name="Paperclip" size={20} />
            </button>
            <textarea
              style={{ ...s.inputBox, height: 44, maxHeight: 120 }}
              placeholder="Написать сообщение..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              rows={1}
            />
            <button style={s.iconBtn} title="Эмодзи">
              <Icon name="Smile" size={20} />
            </button>
            {inputText.trim() ? (
              <button style={s.sendBtn} onClick={sendMessage} title="Отправить">
                <Icon name="Send" size={18} style={{ color: "#fff" }} />
              </button>
            ) : (
              <button style={s.iconBtn} title="Голосовое сообщение">
                <Icon name="Mic" size={20} />
              </button>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={s.app}>
      {/* Left nav */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <img
            src="https://cdn.poehali.dev/projects/8ad0a852-8f58-44b9-91c1-f968494c353f/bucket/d90bdd7d-71bf-4c1c-9091-f09679b3dc28.jpg"
            alt="NextChat"
            style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", display: "block" }}
          />
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            style={s.navBtn(section === item.id)}
            onClick={() => { setSection(item.id); if (item.id !== "chats") setActiveChat(null); }}
            title={item.label}
          >
            <Icon name={item.icon} size={20} />
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={s.navBtn(false)} onClick={toggleTheme} title="Сменить тему">
          <Icon name={isDark ? "Sun" : "Moon"} size={20} />
        </button>
      </nav>

      {/* Sidebar (only for chats) */}
      {section === "chats" && renderSidebar()}

      {/* Main content */}
      <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {renderMainArea()}
      </main>
    </div>
  );
}