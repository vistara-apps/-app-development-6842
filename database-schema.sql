-- HealthSync AI Database Schema for Supabase
-- This file contains the complete database schema for the HealthSync AI application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL, -- Privy user ID or onchain identifier
    username VARCHAR(100),
    email VARCHAR(255),
    wallet_address VARCHAR(42), -- Ethereum address
    selected_conditions TEXT[] DEFAULT '{}',
    subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    payment_method VARCHAR(20) DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'crypto')),
    notification_preferences JSONB DEFAULT '{"trends": true, "patterns": true, "subscriptions": true}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Conditions table
CREATE TABLE conditions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    condition_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table
CREATE TABLE content (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    url TEXT,
    type VARCHAR(50) CHECK (type IN ('article', 'video', 'research', 'podcast')),
    summary TEXT,
    relevant_conditions TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    ipfs_hash VARCHAR(100), -- IPFS hash for decentralized storage
    ipfs_url TEXT, -- IPFS gateway URL
    source_url TEXT,
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptom logs table
CREATE TABLE symptom_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    log_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    symptoms TEXT[] NOT NULL,
    triggers TEXT[] DEFAULT '{}',
    treatment_responses TEXT,
    notes TEXT,
    severity INTEGER CHECK (severity >= 1 AND severity <= 10),
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health trend alerts table
CREATE TABLE health_trend_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alert_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    source_url TEXT,
    relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
    key_takeaways TEXT[],
    action_items TEXT[],
    is_read BOOLEAN DEFAULT FALSE,
    is_saved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions table (for tracking subscription history)
CREATE TABLE user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
    payment_hash VARCHAR(100), -- Blockchain transaction hash for crypto payments
    stripe_subscription_id VARCHAR(100), -- Stripe subscription ID for fiat payments
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User analytics table (for storing computed analytics)
CREATE TABLE user_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_logs INTEGER DEFAULT 0,
    health_score INTEGER DEFAULT 0,
    logging_streak INTEGER DEFAULT 0,
    most_common_symptoms JSONB,
    most_common_triggers JSONB,
    ai_insights JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Content interactions table (for tracking user engagement)
CREATE TABLE content_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content_id VARCHAR(100) NOT NULL REFERENCES content(content_id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) CHECK (interaction_type IN ('view', 'save', 'share', 'like')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_id, interaction_type)
);

-- Farcaster frames table (for tracking frame interactions)
CREATE TABLE farcaster_frames (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    frame_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(255) REFERENCES users(user_id) ON DELETE CASCADE,
    fid INTEGER, -- Farcaster ID
    frame_type VARCHAR(50) CHECK (frame_type IN ('symptom_log', 'trend_alert', 'content', 'dashboard')),
    interaction_data JSONB,
    button_clicked INTEGER,
    input_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX idx_symptom_logs_timestamp ON symptom_logs(timestamp DESC);
CREATE INDEX idx_health_trend_alerts_user_id ON health_trend_alerts(user_id);
CREATE INDEX idx_health_trend_alerts_timestamp ON health_trend_alerts(timestamp DESC);
CREATE INDEX idx_content_relevant_conditions ON content USING GIN(relevant_conditions);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_analytics_user_id_date ON user_analytics(user_id, date DESC);
CREATE INDEX idx_content_interactions_user_id ON content_interactions(user_id);
CREATE INDEX idx_farcaster_frames_user_id ON farcaster_frames(user_id);
CREATE INDEX idx_farcaster_frames_fid ON farcaster_frames(fid);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_trend_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farcaster_frames ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

-- Symptom logs policies
CREATE POLICY "Users can view own symptom logs" ON symptom_logs
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert own symptom logs" ON symptom_logs
    FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own symptom logs" ON symptom_logs
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

-- Health trend alerts policies
CREATE POLICY "Users can view own alerts" ON health_trend_alerts
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own alerts" ON health_trend_alerts
    FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

-- Content is publicly readable
CREATE POLICY "Content is publicly readable" ON content
    FOR SELECT USING (true);

-- User subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- User analytics policies
CREATE POLICY "Users can view own analytics" ON user_analytics
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Content interactions policies
CREATE POLICY "Users can manage own interactions" ON content_interactions
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Farcaster frames policies
CREATE POLICY "Users can view own frame interactions" ON farcaster_frames
    FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Insert default conditions
INSERT INTO conditions (condition_id, name, description, category) VALUES
('diabetes', 'Diabetes', 'A group of metabolic disorders characterized by high blood sugar levels', 'endocrine'),
('hypertension', 'Hypertension', 'High blood pressure condition', 'cardiovascular'),
('migraine', 'Migraine', 'Recurring headaches with moderate to severe pain', 'neurological'),
('arthritis', 'Arthritis', 'Inflammation of one or more joints', 'musculoskeletal'),
('asthma', 'Asthma', 'Respiratory condition with inflamed airways', 'respiratory'),
('depression', 'Depression', 'Mental health disorder with persistent sadness', 'mental_health'),
('anxiety', 'Anxiety', 'Mental health disorder with excessive worry', 'mental_health'),
('ibs', 'Irritable Bowel Syndrome', 'Gastrointestinal disorder affecting the large intestine', 'gastrointestinal'),
('fibromyalgia', 'Fibromyalgia', 'Chronic pain condition affecting muscles and soft tissues', 'musculoskeletal'),
('chronic_fatigue', 'Chronic Fatigue Syndrome', 'Extreme tiredness that cannot be explained by underlying medical condition', 'general');

-- Insert sample content
INSERT INTO content (content_id, title, url, type, summary, relevant_conditions, category, source_url) VALUES
('diabetes_guide_001', 'Complete Guide to Managing Blood Sugar Levels', 'https://example.com/diabetes-guide', 'article', 'Comprehensive guide covering diet, exercise, and medication management for diabetes patients.', ARRAY['diabetes'], 'management', 'https://example.com/diabetes-guide'),
('hypertension_diet_001', 'DASH Diet for Hypertension Management', 'https://example.com/dash-diet', 'article', 'Evidence-based dietary approach to reducing blood pressure through nutrition.', ARRAY['hypertension'], 'diet', 'https://example.com/dash-diet'),
('migraine_triggers_001', 'Understanding Common Migraine Triggers', 'https://example.com/migraine-triggers', 'video', 'Educational video explaining environmental, dietary, and lifestyle triggers for migraines.', ARRAY['migraine'], 'education', 'https://example.com/migraine-triggers'),
('mental_health_001', 'Mindfulness Techniques for Anxiety and Depression', 'https://example.com/mindfulness', 'article', 'Practical mindfulness exercises and techniques for managing anxiety and depression symptoms.', ARRAY['anxiety', 'depression'], 'mental_health', 'https://example.com/mindfulness');

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_health_score(p_user_id VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    symptom_count INTEGER;
    logging_streak INTEGER;
    subscription_bonus INTEGER;
    health_score INTEGER;
BEGIN
    -- Count recent symptoms (last 7 days)
    SELECT COUNT(*) INTO symptom_count
    FROM symptom_logs
    WHERE user_id = p_user_id
    AND timestamp >= NOW() - INTERVAL '7 days';
    
    -- Calculate logging streak
    SELECT COALESCE(logging_streak, 0) INTO logging_streak
    FROM user_analytics
    WHERE user_id = p_user_id
    ORDER BY date DESC
    LIMIT 1;
    
    -- Check subscription status
    SELECT CASE 
        WHEN subscription_status = 'premium' THEN 5 
        ELSE 0 
    END INTO subscription_bonus
    FROM users
    WHERE user_id = p_user_id;
    
    -- Calculate health score
    health_score := 100 - (symptom_count * 2) + LEAST(logging_streak * 2, 20) + subscription_bonus;
    health_score := GREATEST(0, LEAST(100, health_score));
    
    RETURN health_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update user analytics daily
CREATE OR REPLACE FUNCTION update_user_analytics(p_user_id VARCHAR, p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    total_logs INTEGER;
    health_score INTEGER;
    streak INTEGER;
    symptoms JSONB;
    triggers JSONB;
BEGIN
    -- Count total logs for the date
    SELECT COUNT(*) INTO total_logs
    FROM symptom_logs
    WHERE user_id = p_user_id
    AND DATE(timestamp) = p_date;
    
    -- Get health score
    SELECT get_user_health_score(p_user_id) INTO health_score;
    
    -- Calculate logging streak (simplified)
    SELECT COUNT(DISTINCT DATE(timestamp)) INTO streak
    FROM symptom_logs
    WHERE user_id = p_user_id
    AND timestamp >= p_date - INTERVAL '30 days';
    
    -- Get most common symptoms and triggers (last 30 days)
    SELECT json_agg(json_build_object('symptom', symptom, 'count', count)) INTO symptoms
    FROM (
        SELECT unnest(symptoms) as symptom, COUNT(*) as count
        FROM symptom_logs
        WHERE user_id = p_user_id
        AND timestamp >= p_date - INTERVAL '30 days'
        GROUP BY symptom
        ORDER BY count DESC
        LIMIT 5
    ) s;
    
    SELECT json_agg(json_build_object('trigger', trigger, 'count', count)) INTO triggers
    FROM (
        SELECT unnest(triggers) as trigger, COUNT(*) as count
        FROM symptom_logs
        WHERE user_id = p_user_id
        AND timestamp >= p_date - INTERVAL '30 days'
        GROUP BY trigger
        ORDER BY count DESC
        LIMIT 5
    ) t;
    
    -- Insert or update analytics
    INSERT INTO user_analytics (user_id, date, total_logs, health_score, logging_streak, most_common_symptoms, most_common_triggers)
    VALUES (p_user_id, p_date, total_logs, health_score, streak, symptoms, triggers)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        total_logs = EXCLUDED.total_logs,
        health_score = EXCLUDED.health_score,
        logging_streak = EXCLUDED.logging_streak,
        most_common_symptoms = EXCLUDED.most_common_symptoms,
        most_common_triggers = EXCLUDED.most_common_triggers;
END;
$$ LANGUAGE plpgsql;
