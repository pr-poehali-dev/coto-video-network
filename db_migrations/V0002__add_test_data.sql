-- Добавление тестовых пользователей
INSERT INTO users (email, password_hash, username, avatar_url) VALUES 
('kod@example.com', 'hash1', 'Код Просто', 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'),
('dev@example.com', 'hash2', 'DevChannel', 'https://api.dicebear.com/7.x/avataaars/svg?seed=2'),
('web@example.com', 'hash3', 'Веб Мастер', 'https://api.dicebear.com/7.x/avataaars/svg?seed=3');

-- Добавление тестовых видео
INSERT INTO videos (user_id, title, description, thumbnail_url, duration, views, is_short) VALUES 
(1, 'Как создать свой первый сайт на React за 30 минут', 'Полный гайд для начинающих', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500', '28:15', 125000, false),
(2, 'TypeScript для начинающих: полный курс', 'Изучаем TypeScript с нуля', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500', '1:45:20', 89000, false),
(3, 'Лучшие практики CSS Grid в 2024', 'Современный подход к вёрстке', 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=500', '15:42', 54000, false);

-- Добавление тестовых shorts
INSERT INTO videos (user_id, title, thumbnail_url, views, is_short) VALUES 
(1, 'Топ-5 хаков CSS за 60 секунд!', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400', 78000, true),
(2, 'React хук который ты не знал', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400', 45000, true),
(3, 'Flexbox vs Grid - что выбрать?', 'https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=400', 62000, true);
