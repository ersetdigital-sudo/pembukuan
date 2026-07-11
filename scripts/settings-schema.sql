-- ============================================================
-- OOS SHOP - Settings Table
-- Run ini di Supabase SQL Editor -> Run
-- ============================================================

-- Settings table (key-value store for app config)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: allow all (no auth yet)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY allow_all_settings ON settings FOR ALL USING (true) WITH CHECK (true);

-- Default settings: marketplaces
INSERT INTO settings (id, key, value) VALUES
  ('set-1', 'marketplaces', '["Shopee", "Tokopedia", "Bukalapak", "Blibli", "Instagram", "WhatsApp", "Akulaku"]')
ON CONFLICT (key) DO NOTHING;

-- Default settings: profit sharing percentages
INSERT INTO settings (id, key, value) VALUES
  ('set-2', 'profit_sharing', '{
    "plugin": {
      "partners": [
        { "name": "Andri", "initials": "A", "percentage": 40 },
        { "name": "Asrud", "initials": "As", "percentage": 40 },
        { "name": "Modal & Dev", "initials": "M", "percentage": 20 }
      ]
    },
    "jasa": {
      "partners": [
        { "name": "Andri", "initials": "A", "percentage": 40 },
        { "name": "Asrud", "initials": "As", "percentage": 60 }
      ]
    }
  }')
ON CONFLICT (key) DO NOTHING;
