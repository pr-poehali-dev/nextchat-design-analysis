
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) NOT NULL DEFAULT 'НК',
    status VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    token VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user ON sessions(user_id);

ALTER TABLE messages ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE chats ADD COLUMN owner_id INTEGER REFERENCES users(id);
