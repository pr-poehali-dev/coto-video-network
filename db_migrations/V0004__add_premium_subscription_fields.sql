-- Add premium subscription fields to users table
ALTER TABLE t_p38550132_coto_video_network.users 
ADD COLUMN is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN premium_until TIMESTAMP NULL,
ADD COLUMN subscription_type VARCHAR(50) DEFAULT 'free';

-- Create payments table
CREATE TABLE IF NOT EXISTS t_p38550132_coto_video_network.payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p38550132_coto_video_network.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RUB',
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255) UNIQUE,
    subscription_months INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster user premium lookups
CREATE INDEX idx_users_premium ON t_p38550132_coto_video_network.users(is_premium, premium_until);