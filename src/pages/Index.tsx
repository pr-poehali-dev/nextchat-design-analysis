import { useState, useRef, useEffect } from "react";
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
  text?: string;
  time: string;
  isOwn: boolean;
  status?: "sent" | "read";
  file?: { name: string; size: string; type: "image" | "video" | "doc"; url: string };
}

const INITIAL_CHATS: Chat[] = [
  { id: 1, name: "Алексей Петров", avatar: "АП", lastMessage: "Окей, увидимся завтра!", time: "14:32", unread: 2, online: true, pinned: true },
  { id: 2, name: "Команда проекта", avatar: "КП", lastMessage: "Дизайн готов к ревью", time: "13:15", unread: 7, online: false, isGroup: true, pinned: true },
  { id: 3, name: "Мария Соколова", avatar: "МС", lastMessage: "Спасибо за помощь 🙏", time: "12:44", unread: 0, online: true },
  { id: 4, name: "Дмитрий Иванов", avatar: "ДИ", lastMessage: "Отправил документы на почту", time: "11:20", unread: 0, online: false },
  { id: 5, name: "Разработка", avatar: "РА", lastMessage: "Баг исправлен, деплой завтра", time: "Вчера", unread: 0, online: false, isGroup: true },
  { id: 6, name: "Анна Кузнецова", avatar: "АК", lastMessage: "Хорошо, договорились!", time: "Вчера", unread: 0, online: false },
  { id: 7, name: "Игорь Смирнов", avatar: "ИС", lastMessage: "Позвоню чуть позже", time: "Пн", unread: 0, online: true },
  { id: 8, name: "Маркетинг", avatar: "МК", lastMessage: "Кампания запущена 🚀", time: "Пн", unread: 0, online: false, isGroup: true },
];

const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Привет! Как дела?", time: "14:10", isOwn: false },
    { id: 2, text: "Всё отлично, работаю над новым проектом", time: "14:12", isOwn: true, status: "read" },
    { id: 3, text: "Круто! Что за проект?", time: "14:15", isOwn: false },
    { id: 4, text: "Разрабатываю мессенджер NextChat — минималистичный, быстрый и с ИИ-ассистентом", time: "14:18", isOwn: true, status: "read" },
    { id: 5, text: "Окей, увидимся завтра!", time: "14:32", isOwn: false },
  ],
  2: [
    { id: 1, text: "Всем привет! Сегодня обсуждаем новый дизайн", time: "09:00", isOwn: false },
    { id: 2, text: "Я готов, подключаюсь", time: "09:05", isOwn: true, status: "read" },
    { id: 3, text: "Дизайн готов к ревью", time: "13:15", isOwn: false },
  ],
  3: [
    { id: 1, text: "Помогли с отчётом — очень выручили!", time: "12:40", isOwn: false },
    { id: 2, text: "Спасибо за помощь 🙏", time: "12:44", isOwn: false },
  ],
};

const CONTACTS = [
  { id: 1, name: "Алексей Петров", avatar: "АП", status: "В сети", online: true, chatId: 1 },
  { id: 2, name: "Анна Кузнецова", avatar: "АК", status: "Был(а) час назад", online: false, chatId: 6 },
  { id: 3, name: "Дмитрий Иванов", avatar: "ДИ", status: "Был(а) вчера", online: false, chatId: 4 },
  { id: 4, name: "Игорь Смирнов", avatar: "ИС", status: "В сети", online: true, chatId: 7 },
  { id: 5, name: "Мария Соколова", avatar: "МС", status: "В сети", online: true, chatId: 3 },
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

function AvatarComp({ initials, size = 40, color = "blue" }: { initials: string; size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 600, flexShrink: 0,
      background: color === "blue" ? "var(--nc-blue)" : "#E8EAF0",
      color: color === "blue" ? "#fff" : "var(--nc-text-secondary)",
    }}>
      {initials}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " Б";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
  return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
}

export default function Index() {
  const [theme, setTheme] = useState<Theme>("light");
  const [section, setSection] = useState<Section>("chats");
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<Record<number, Message[]>>(INITIAL_MESSAGES);
  const [callModal, setCallModal] = useState<{ name: string; type: "voice" | "video" } | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDark = theme === "dark";

  const EMOJIS = ["😀","😂","❤️","👍","🔥","✨","🙏","😍","🎉","😎","👏","💪","🤔","😅","🥳","💯","🚀","💬","📎","🌟"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const openChat = (chat: Chat) => {
    setActiveChat(chat);
    setSection("chats");
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
  };

  const openContactChat = (chatId: number) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) openChat(chat);
  };

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = (text?: string) => {
    const content = text || inputText.trim();
    if (!content || !activeChat) return;
    const chatId = activeChat.id;
    const now = new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = { id: Date.now(), text: content, time: now, isOwn: true, status: "sent" };
    setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), newMsg] }));
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMessage: content, time: now } : c));
    if (!text) setInputText("");

    // Simulate reply after 1.5s
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = ["Понял, спасибо!", "Окей 👍", "Интересно!", "Хорошо, договорились", "Буду иметь в виду"];
      const reply: Message = {
        id: Date.now() + 1,
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }),
        isOwn: false,
      };
      setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), reply] }));
    }, 1500);
  };

  const handleTyping = (val: string) => {
    setInputText(val);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {}, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "doc") => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;
    const url = URL.createObjectURL(file);
    const now = new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = {
      id: Date.now(),
      time: now,
      isOwn: true,
      status: "sent",
      file: { name: file.name, size: formatFileSize(file.size), type, url },
    };
    const chatId = activeChat.id;
    setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), newMsg] }));
    const label = type === "image" ? "📷 Фото" : type === "video" ? "🎥 Видео" : `📎 ${file.name}`;
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMessage: label, time: now } : c));
    setShowAttachMenu(false);
    e.target.value = "";
  };

  const s = {
    app: { display: "flex", height: "100vh", overflow: "hidden", background: "var(--nc-chat-bg)", fontFamily: "'Golos Text', sans-serif" } as React.CSSProperties,
    nav: { width: 64, background: "var(--nc-sidebar)", borderRight: "1px solid var(--nc-border)", display: "flex", flexDirection: "column" as const, alignItems: "center", paddingTop: 16, paddingBottom: 16, gap: 4, flexShrink: 0, zIndex: 10 },
    navLogo: { width: 36, height: 36, borderRadius: 10, overflow: "hidden", marginBottom: 16, flexShrink: 0 },
    navBtn: (active: boolean) => ({ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.18s", background: active ? "var(--nc-blue-light)" : "transparent", color: active ? "var(--nc-blue)" : "var(--nc-text-secondary)", border: "none", outline: "none" } as React.CSSProperties),
    sidebar: { width: 300, background: "var(--nc-sidebar)", borderRight: "1px solid var(--nc-border)", display: "flex", flexDirection: "column" as const, flexShrink: 0 },
    sidebarHeader: { padding: "20px 16px 12px", borderBottom: "1px solid var(--nc-border)" },
    sidebarTitle: { fontSize: 20, fontWeight: 700, color: "var(--nc-text-primary)", marginBottom: 12 },
    searchBox: { display: "flex", alignItems: "center", gap: 8, background: "var(--nc-chat-bg)", borderRadius: 10, padding: "8px 12px", border: "1px solid var(--nc-border)" },
    searchInput: { flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--nc-text-primary)", fontFamily: "'Golos Text', sans-serif" } as React.CSSProperties,
    chatItem: (active: boolean) => ({ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", cursor: "pointer", transition: "background 0.15s", background: active ? "var(--nc-blue-light)" : "transparent", borderLeft: active ? "3px solid var(--nc-blue)" : "3px solid transparent" } as React.CSSProperties),
    chatName: { fontSize: 14, fontWeight: 600, color: "var(--nc-text-primary)", lineHeight: 1.3 },
    chatLast: { fontSize: 13, color: "var(--nc-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: 150 },
    chatTime: { fontSize: 12, color: "var(--nc-text-secondary)", flexShrink: 0 },
    unreadBadge: { background: "var(--nc-blue)", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "2px 7px", minWidth: 20, textAlign: "center" as const },
    chatArea: { flex: 1, display: "flex", flexDirection: "column" as const, background: "var(--nc-chat-bg)", overflow: "hidden" },
    chatHeader: { padding: "12px 20px", background: "var(--nc-panel)", borderBottom: "1px solid var(--nc-border)", display: "flex", alignItems: "center", gap: 12 },
    chatMessages: { flex: 1, overflowY: "auto" as const, padding: "20px 24px", display: "flex", flexDirection: "column" as const, gap: 6 },
    bubbleWrap: (own: boolean) => ({ display: "flex", justifyContent: own ? "flex-end" : "flex-start" } as React.CSSProperties),
    bubble: (own: boolean) => ({ maxWidth: "62%", padding: "10px 14px", borderRadius: own ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: own ? "var(--nc-bubble-out)" : "var(--nc-bubble-in)", color: own ? "#fff" : "var(--nc-text-primary)", fontSize: 14, lineHeight: 1.55, boxShadow: own ? "none" : "0 1px 3px rgba(0,0,0,0.08)", border: own ? "none" : "1px solid var(--nc-border)" } as React.CSSProperties),
    bubbleTime: (own: boolean) => ({ fontSize: 11, marginTop: 4, textAlign: "right" as const, color: own ? "rgba(255,255,255,0.65)" : "var(--nc-text-secondary)", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3 } as React.CSSProperties),
    inputArea: { padding: "12px 20px", background: "var(--nc-panel)", borderTop: "1px solid var(--nc-border)", display: "flex", alignItems: "flex-end", gap: 10, position: "relative" as const },
    inputBox: { flex: 1, background: "var(--nc-chat-bg)", border: "1px solid var(--nc-border)", borderRadius: 22, padding: "10px 16px", fontSize: 14, outline: "none", color: "var(--nc-text-primary)", fontFamily: "'Golos Text', sans-serif", resize: "none" as const, lineHeight: 1.4, maxHeight: 120, overflowY: "auto" as const } as React.CSSProperties,
    sendBtn: { width: 44, height: 44, borderRadius: "50%", background: "var(--nc-blue)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s", color: "#fff" } as React.CSSProperties,
    iconBtn: { width: 36, height: 36, borderRadius: "50%", background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--nc-text-secondary)", transition: "all 0.15s", flexShrink: 0 } as React.CSSProperties,
    empty: { flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", color: "var(--nc-text-secondary)", gap: 12 },
    sectionContent: { flex: 1, display: "flex", flexDirection: "column" as const, background: "var(--nc-panel)", padding: 28, overflowY: "auto" as const },
    sectionTitle: { fontSize: 22, fontWeight: 700, color: "var(--nc-text-primary)", marginBottom: 20 },
    card: { background: "var(--nc-chat-bg)", borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 14, border: "1px solid var(--nc-border)", cursor: "pointer", transition: "all 0.15s" } as React.CSSProperties,
  };

  const chatMsgs = activeChat ? (messages[activeChat.id] || []) : [];
  const pinnedChats = filteredChats.filter(c => c.pinned);
  const regularChats = filteredChats.filter(c => !c.pinned);

  const ChatRow = ({ chat }: { chat: Chat }) => (
    <div
      style={s.chatItem(activeChat?.id === chat.id)}
      onClick={() => openChat(chat)}
      onMouseEnter={e => { if (activeChat?.id !== chat.id) (e.currentTarget as HTMLElement).style.background = "var(--nc-chat-bg)"; }}
      onMouseLeave={e => { if (activeChat?.id !== chat.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <div style={{ position: "relative" }}>
        <AvatarComp initials={chat.avatar} size={42} color={chat.isGroup ? "gray" : "blue"} />
        {chat.online && !chat.isGroup && (
          <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "var(--nc-online)", border: "2px solid var(--nc-sidebar)" }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
          <div style={{ ...s.chatName, display: "flex", alignItems: "center", gap: 5 }}>
            {chat.name}
            {chat.pinned && <Icon name="Pin" size={11} style={{ color: "var(--nc-text-secondary)" }} />}
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

  const renderSidebar = () => (
    <div style={s.sidebar}>
      <div style={s.sidebarHeader}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={s.sidebarTitle}>Сообщения</div>
          <button style={{ ...s.iconBtn, width: 32, height: 32, background: "var(--nc-blue-light)", borderRadius: 8 }} title="Новый чат">
            <Icon name="Plus" size={16} style={{ color: "var(--nc-blue)" }} />
          </button>
        </div>
        <div style={s.searchBox}>
          <Icon name="Search" size={16} style={{ color: "var(--nc-text-secondary)", flexShrink: 0 }} />
          <input style={s.searchInput} placeholder="Поиск чатов..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nc-text-secondary)", padding: 0 }}>
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {pinnedChats.length > 0 && (
          <>
            <div style={{ padding: "8px 16px 4px", fontSize: 11, fontWeight: 600, color: "var(--nc-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Закреплённые</div>
            {pinnedChats.map(chat => <ChatRow key={chat.id} chat={chat} />)}
          </>
        )}
        {regularChats.length > 0 && (
          <>
            {pinnedChats.length > 0 && <div style={{ padding: "8px 16px 4px", fontSize: 11, fontWeight: 600, color: "var(--nc-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Все чаты</div>}
            {regularChats.map(chat => <ChatRow key={chat.id} chat={chat} />)}
          </>
        )}
        {filteredChats.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "var(--nc-text-secondary)", fontSize: 14 }}>Ничего не найдено</div>
        )}
      </div>
    </div>
  );

  const renderChatView = () => {
    if (!activeChat) {
      return (
        <div style={s.empty} className="animate-fade-in">
          <div style={{ width: 72, height: 72, borderRadius: 22, overflow: "hidden", boxShadow: "0 8px 32px rgba(42,93,255,0.25)" }}>
            <img src="https://cdn.poehali.dev/projects/8ad0a852-8f58-44b9-91c1-f968494c353f/bucket/d90bdd7d-71bf-4c1c-9091-f09679b3dc28.jpg" alt="NextChat" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--nc-text-primary)" }}>Добро пожаловать в NextChat</div>
          <div style={{ fontSize: 14, maxWidth: 260, textAlign: "center", lineHeight: 1.7, color: "var(--nc-text-secondary)" }}>Выберите чат из списка слева или перейдите в контакты, чтобы начать переписку</div>
          <button
            style={{ marginTop: 8, background: "var(--nc-blue)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Golos Text', sans-serif" }}
            onClick={() => setSection("contacts")}
          >
            Перейти к контактам
          </button>
        </div>
      );
    }

    return (
      <div style={s.chatArea} onClick={() => { setShowAttachMenu(false); setShowEmojiPicker(false); }}>
        {/* Header */}
        <div style={s.chatHeader}>
          <div style={{ position: "relative" }}>
            <AvatarComp initials={activeChat.avatar} size={40} color={activeChat.isGroup ? "gray" : "blue"} />
            {activeChat.online && !activeChat.isGroup && (
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "var(--nc-online)", border: "2px solid var(--nc-panel)" }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--nc-text-primary)" }}>{activeChat.name}</div>
            <div style={{ fontSize: 12, color: isTyping ? "var(--nc-blue)" : activeChat.online && !activeChat.isGroup ? "var(--nc-online)" : "var(--nc-text-secondary)" }}>
              {isTyping ? "печатает..." : activeChat.isGroup ? "групповой чат" : activeChat.online ? "В сети" : "Был(а) недавно"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={s.iconBtn} title="Голосовой звонок" onClick={() => setCallModal({ name: activeChat.name, type: "voice" })}>
              <Icon name="Phone" size={18} />
            </button>
            <button style={s.iconBtn} title="Видеозвонок" onClick={() => setCallModal({ name: activeChat.name, type: "video" })}>
              <Icon name="Video" size={18} />
            </button>
            <button style={s.iconBtn} title="Поиск в чате">
              <Icon name="Search" size={18} />
            </button>
            <button style={s.iconBtn} title="Ещё">
              <Icon name="MoreVertical" size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={s.chatMessages}>
          {chatMsgs.map((msg, i) => (
            <div key={msg.id} style={{ ...s.bubbleWrap(msg.isOwn), animationDelay: `${i * 0.02}s` }} className="animate-fade-in">
              <div style={{ maxWidth: "62%" }}>
                <div style={s.bubble(msg.isOwn)}>
                  {msg.file ? (
                    msg.file.type === "image" ? (
                      <div>
                        <img src={msg.file.url} alt={msg.file.name} style={{ maxWidth: "100%", borderRadius: 10, display: "block", maxHeight: 240, objectFit: "cover" }} />
                      </div>
                    ) : msg.file.type === "video" ? (
                      <div>
                        <video src={msg.file.url} controls style={{ maxWidth: "100%", borderRadius: 10, display: "block", maxHeight: 200 }} />
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: msg.isOwn ? "rgba(255,255,255,0.2)" : "var(--nc-blue-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon name="FileText" size={20} style={{ color: msg.isOwn ? "#fff" : "var(--nc-blue)" }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: msg.isOwn ? "#fff" : "var(--nc-text-primary)" }}>{msg.file.name}</div>
                          <div style={{ fontSize: 11, color: msg.isOwn ? "rgba(255,255,255,0.7)" : "var(--nc-text-secondary)" }}>{msg.file.size}</div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div>{msg.text}</div>
                  )}
                  <div style={s.bubbleTime(msg.isOwn)}>
                    {msg.time}
                    {msg.isOwn && (
                      <Icon name={msg.status === "read" ? "CheckCheck" : "Check"} size={13} style={{ color: msg.status === "read" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={s.bubbleWrap(false)}>
              <div style={{ ...s.bubble(false), padding: "12px 16px" }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--nc-text-secondary)", animation: "pulse-dot 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={s.inputArea} onClick={e => e.stopPropagation()}>
          {/* Hidden file inputs */}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFileUpload(e, "image")} />
          <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleFileUpload(e, "video")} />
          <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" style={{ display: "none" }} onChange={e => handleFileUpload(e, "doc")} />

          {/* Attach menu */}
          <div style={{ position: "relative" }}>
            <button
              style={{ ...s.iconBtn, color: showAttachMenu ? "var(--nc-blue)" : "var(--nc-text-secondary)" }}
              title="Прикрепить"
              onClick={() => { setShowAttachMenu(p => !p); setShowEmojiPicker(false); }}
            >
              <Icon name="Paperclip" size={20} />
            </button>
            {showAttachMenu && (
              <div style={{ position: "absolute", bottom: 48, left: 0, background: "var(--nc-panel)", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid var(--nc-border)", padding: 8, minWidth: 180, zIndex: 100 }} className="animate-scale-in">
                {[
                  { icon: "Image", label: "Фото", action: () => fileInputRef.current?.click() },
                  { icon: "Video", label: "Видео", action: () => videoInputRef.current?.click() },
                  { icon: "FileText", label: "Документ", action: () => docInputRef.current?.click() },
                ].map(item => (
                  <button
                    key={item.label}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", borderRadius: 8, color: "var(--nc-text-primary)", fontSize: 14, fontFamily: "'Golos Text', sans-serif", transition: "background 0.15s" }}
                    onClick={item.action}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-chat-bg)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <Icon name={item.icon} size={17} style={{ color: "var(--nc-blue)" }} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            style={{ ...s.inputBox, height: 44 }}
            placeholder="Написать сообщение..."
            value={inputText}
            onChange={e => handleTyping(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            rows={1}
          />

          {/* Emoji */}
          <div style={{ position: "relative" }}>
            <button
              style={{ ...s.iconBtn, color: showEmojiPicker ? "var(--nc-blue)" : "var(--nc-text-secondary)" }}
              title="Эмодзи"
              onClick={() => { setShowEmojiPicker(p => !p); setShowAttachMenu(false); }}
            >
              <Icon name="Smile" size={20} />
            </button>
            {showEmojiPicker && (
              <div style={{ position: "absolute", bottom: 48, right: 0, background: "var(--nc-panel)", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid var(--nc-border)", padding: 12, zIndex: 100, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }} className="animate-scale-in">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6, transition: "background 0.1s" }}
                    onClick={() => { setInputText(p => p + emoji); setShowEmojiPicker(false); }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-chat-bg)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {inputText.trim() ? (
            <button style={s.sendBtn} onClick={() => sendMessage()} title="Отправить"
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-blue-hover)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-blue)"; }}
            >
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
                <AvatarComp initials={c.avatar} size={44} />
                {c.online && (
                  <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: "var(--nc-online)", border: "2px solid var(--nc-chat-bg)" }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "var(--nc-text-primary)" }}>{c.name}</div>
                <div style={{ fontSize: 13, color: c.online ? "var(--nc-online)" : "var(--nc-text-secondary)" }}>{c.status}</div>
              </div>
              <button
                style={{ ...s.iconBtn, background: "var(--nc-blue-light)", borderRadius: 10, width: 38, height: 38, color: "var(--nc-blue)" }}
                title="Написать сообщение"
                onClick={() => openContactChat(c.chatId)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-blue)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-blue-light)"; (e.currentTarget as HTMLElement).style.color = "var(--nc-blue)"; }}
              >
                <Icon name="MessageCircle" size={17} />
              </button>
              <button
                style={{ ...s.iconBtn, background: "var(--nc-chat-bg)", borderRadius: 10, width: 38, height: 38 }}
                title="Позвонить"
                onClick={() => setCallModal({ name: c.name, type: "voice" })}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-blue-light)"; (e.currentTarget as HTMLElement).style.color = "var(--nc-blue)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-chat-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--nc-text-secondary)"; }}
              >
                <Icon name="Phone" size={17} />
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
              <div key={bot.id} style={{ ...s.card, flexDirection: "column", alignItems: "flex-start", gap: 10 }}
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
                <button
                  style={{ background: "var(--nc-blue)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "'Golos Text', sans-serif", transition: "background 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-blue-hover)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-blue)"; }}
                  onClick={() => alert(`Бот "${bot.name}" будет доступен в следующей версии!`)}
                >
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
              <AvatarComp initials="ВИ" size={88} />
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
            <div key={row.label} style={s.card}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--nc-blue)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--nc-border)"; }}
            >
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
                { icon: "Volume2", label: "Звук сообщений", value: "Вкл" },
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
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 12, paddingTop: 60 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--nc-chat-bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--nc-border)" }}>
              <Icon name="Archive" size={28} style={{ color: "var(--nc-text-secondary)" }} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--nc-text-primary)" }}>Архив пуст</div>
            <div style={{ fontSize: 14, textAlign: "center", maxWidth: 240, lineHeight: 1.6, color: "var(--nc-text-secondary)" }}>Сюда попадут чаты, которые вы перенесёте в архив</div>
          </div>
        </div>
      );
    }

    if (section === "chats") return renderChatView();
    return null;
  };

  return (
    <div style={s.app} onClick={() => { setShowAttachMenu(false); setShowEmojiPicker(false); }}>
      {/* Call modal */}
      {callModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} className="animate-fade-in">
          <div style={{ background: "var(--nc-panel)", borderRadius: 24, padding: 36, textAlign: "center", minWidth: 280, boxShadow: "0 24px 64px rgba(0,0,0,0.25)" }} className="animate-scale-in" onClick={e => e.stopPropagation()}>
            <AvatarComp initials={callModal.name.split(" ").map(w => w[0]).join("").slice(0, 2)} size={72} />
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--nc-text-primary)", marginTop: 16 }}>{callModal.name}</div>
            <div style={{ fontSize: 14, color: "var(--nc-text-secondary)", marginTop: 4, marginBottom: 28 }}>
              {callModal.type === "voice" ? "Голосовой вызов..." : "Видеовызов..."}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
              <button
                style={{ width: 60, height: 60, borderRadius: "50%", background: "#EF4444", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                onClick={() => setCallModal(null)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#DC2626"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#EF4444"; }}
              >
                <Icon name="PhoneOff" size={26} style={{ color: "#fff" }} />
              </button>
              {callModal.type === "video" && (
                <button style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--nc-blue)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="Video" size={26} style={{ color: "#fff" }} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={s.nav} onClick={e => e.stopPropagation()}>
        <div style={s.navLogo}>
          <img src="https://cdn.poehali.dev/projects/8ad0a852-8f58-44b9-91c1-f968494c353f/bucket/d90bdd7d-71bf-4c1c-9091-f09679b3dc28.jpg" alt="NextChat" style={{ width: 36, height: 36, borderRadius: 10, objectFit: "cover", display: "block" }} />
        </div>
        {NAV_ITEMS.map(item => (
          <button key={item.id} style={s.navBtn(section === item.id)}
            onClick={() => { setSection(item.id); if (item.id !== "chats") setActiveChat(null); }}
            title={item.label}
            onMouseEnter={e => { if (section !== item.id) (e.currentTarget as HTMLElement).style.background = "var(--nc-chat-bg)"; }}
            onMouseLeave={e => { if (section !== item.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            <Icon name={item.icon} size={20} />
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={s.navBtn(false)} onClick={toggleTheme} title="Сменить тему"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--nc-chat-bg)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <Icon name={isDark ? "Sun" : "Moon"} size={20} />
        </button>
      </nav>

      {/* Sidebar */}
      {section === "chats" && renderSidebar()}

      {/* Main */}
      <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {renderMainArea()}
      </main>
    </div>
  );
}
