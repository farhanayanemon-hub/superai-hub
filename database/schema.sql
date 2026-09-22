-- =========================================================
-- SuperAI Hub - PostgreSQL / Supabase Database Schema
-- PRD Specification Section 5
-- =========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    encrypted_gemini_key TEXT, -- AES-256 encrypted Google AI Studio BYOK Key
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Subscriptions Table
-- Supports Monthly and Launch Special Yearly with 3-day grace period
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'grace_period')),
    amount_paid NUMERIC(10, 2) NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    renewal_price NUMERIC(10, 2) NOT NULL,
    payment_gateway VARCHAR(50) DEFAULT 'Card',
    gateway_transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WhatsApp Sessions Table
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    session_data JSONB, -- Baileys Multi-Device auth state credentials
    connection_status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'qr_ready', 'connecting')),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning-fast lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
