
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) NOT NULL,
    is_group BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    online BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    text TEXT,
    is_own BOOLEAN DEFAULT TRUE,
    status VARCHAR(10) DEFAULT 'sent',
    file_name VARCHAR(500),
    file_size VARCHAR(50),
    file_type VARCHAR(20),
    file_url TEXT,
    sent_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sent_at ON messages(chat_id, sent_at DESC);

INSERT INTO chats (name, avatar, is_group, is_pinned, online) VALUES
  ('Алексей Петров', 'АП', false, true, true),
  ('Команда проекта', 'КП', true, true, false),
  ('Мария Соколова', 'МС', false, false, true),
  ('Дмитрий Иванов', 'ДИ', false, false, false),
  ('Разработка', 'РА', true, false, false),
  ('Анна Кузнецова', 'АК', false, false, false),
  ('Игорь Смирнов', 'ИС', false, false, true),
  ('Маркетинг', 'МК', true, false, false);

INSERT INTO messages (chat_id, text, is_own, status, sent_at) VALUES
  (1, 'Привет! Как дела?', false, 'read', NOW() - INTERVAL '2 hours'),
  (1, 'Всё отлично, работаю над новым проектом', true, 'read', NOW() - INTERVAL '115 minutes'),
  (1, 'Круто! Что за проект?', false, 'read', NOW() - INTERVAL '110 minutes'),
  (1, 'Разрабатываю мессенджер NextChat — минималистичный и быстрый', true, 'read', NOW() - INTERVAL '105 minutes'),
  (1, 'Окей, увидимся завтра!', false, 'read', NOW() - INTERVAL '30 minutes'),
  (2, 'Всем привет! Сегодня обсуждаем новый дизайн', false, 'read', NOW() - INTERVAL '300 minutes'),
  (2, 'Я готов, подключаюсь', true, 'read', NOW() - INTERVAL '295 minutes'),
  (2, 'Дизайн готов к ревью', false, 'read', NOW() - INTERVAL '60 minutes'),
  (3, 'Помогли с отчётом — очень выручили!', false, 'read', NOW() - INTERVAL '180 minutes'),
  (3, 'Спасибо за помощь 🙏', false, 'read', NOW() - INTERVAL '150 minutes');
