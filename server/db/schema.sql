CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS app_users(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS trading_sessions(id UUID PRIMARY KEY DEFAULT gen_random_uuid(),user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,symbol TEXT NOT NULL DEFAULT 'R_100',mode TEXT NOT NULL DEFAULT 'DEMO' CHECK(mode IN('DEMO','LIVE')),status TEXT NOT NULL DEFAULT 'STOPPED',config JSONB NOT NULL DEFAULT '{}'::jsonb,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS trade_events(id BIGSERIAL PRIMARY KEY,session_id UUID NOT NULL REFERENCES trading_sessions(id) ON DELETE CASCADE,event_type TEXT NOT NULL,payload JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS sessions_user_idx ON trading_sessions(user_id);
CREATE INDEX IF NOT EXISTS events_session_idx ON trade_events(session_id,created_at DESC);
