-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица видео
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    duration VARCHAR(20),
    views INTEGER DEFAULT 0,
    is_short BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица лайков
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    video_id INTEGER REFERENCES videos(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id)
);

-- Таблица комментариев
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    video_id INTEGER REFERENCES videos(id),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица подписок
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    subscriber_id INTEGER REFERENCES users(id),
    channel_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subscriber_id, channel_id)
);

-- Таблица истории просмотров
CREATE TABLE IF NOT EXISTS watch_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    video_id INTEGER REFERENCES videos(id),
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица избранного
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    video_id INTEGER REFERENCES videos(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, video_id)
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_video_id ON likes(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_video_id ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_channel_id ON subscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
