-- AtlasKit Database Migration
-- Document Types Restructure
-- Run this migration to update the database schema
-- ────────────────────────────────────────────────────────────────

-- ═══════════════════════════════════════════════════════════════
-- 1. ENUMS
-- ═══════════════════════════════════════════════════════════════

-- Document Kind
DO $$ BEGIN
  CREATE TYPE doc_kind AS ENUM ('invoice', 'devis', 'bon_livraison', 'credit_note');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Document Status  
DO $$ BEGIN
  CREATE TYPE doc_status AS ENUM ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'delivered');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Country Code
DO $$ BEGIN
  CREATE TYPE country_code AS ENUM ('DZ', 'SA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Template Style
DO $$ BEGIN
  CREATE TYPE template_style AS ENUM ('classic', 'modern', 'minimal', 'bold', 'elegant', 'corporate');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Payment Method
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'ccp', 'card', 'other');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 2. UPDATE PROFILES TABLE
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS logo TEXT,
  ADD COLUMN IF NOT EXISTS stamp TEXT,
  ADD COLUMN IF NOT EXISTS ai TEXT,
  ADD COLUMN IF NOT EXISTS nis TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT,
  ADD COLUMN IF NOT EXISTS cr_number TEXT,
  ADD COLUMN IF NOT EXISTS country country_code DEFAULT 'DZ',
  ADD COLUMN IF NOT EXISTS default_template template_style DEFAULT 'modern',
  ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'ar',
  ADD COLUMN IF NOT EXISTS brand_color TEXT;

-- ═══════════════════════════════════════════════════════════════
-- 3. CREATE NEW DOCUMENTS TABLE (if migration from old structure)
-- ═══════════════════════════════════════════════════════════════

-- First backup old documents if exists
-- CREATE TABLE IF NOT EXISTS documents_backup AS SELECT * FROM documents;

-- Drop and recreate documents table with new structure
-- WARNING: This will delete existing data! Use migration approach instead.

CREATE TABLE IF NOT EXISTS documents_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Document identification
  kind doc_kind NOT NULL DEFAULT 'invoice',
  number TEXT NOT NULL,
  status doc_status NOT NULL DEFAULT 'draft',
  
  -- Dates
  date_iso DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  valid_until DATE,
  
  -- References
  reference TEXT,
  related_doc_id UUID REFERENCES documents_new(id) ON DELETE SET NULL,
  
  -- Client
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_snapshot JSONB NOT NULL DEFAULT '{}',
  
  -- Settings
  country country_code NOT NULL DEFAULT 'DZ',
  currency TEXT NOT NULL DEFAULT 'DZD',
  template template_style NOT NULL DEFAULT 'modern',
  language TEXT DEFAULT 'ar',
  color TEXT,
  
  -- Content
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  internal_notes TEXT,
  discount_rate NUMERIC(5,2) DEFAULT 0,
  timbre_fiscal NUMERIC(10,2) DEFAULT 0,
  
  -- Computed/cached totals
  subtotal NUMERIC(15,2),
  tax_total NUMERIC(15,2),
  total NUMERIC(15,2),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, number)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents_new(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_kind ON documents_new(kind);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents_new(status);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents_new(date_iso);
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents_new(client_id);

-- ═══════════════════════════════════════════════════════════════
-- 4. CREATE PAYMENTS TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents_new(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(15,2) NOT NULL,
  method payment_method NOT NULL DEFAULT 'cash',
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_document ON payments(document_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. CREATE DOCUMENT COUNTERS TABLE
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS document_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind doc_kind NOT NULL,
  year INTEGER NOT NULL,
  last_number INTEGER NOT NULL DEFAULT 0,
  prefix TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, kind, year)
);

-- ═══════════════════════════════════════════════════════════════
-- 6. UPDATE CLIENTS TABLE
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS nif TEXT,
  ADD COLUMN IF NOT EXISTS rc TEXT,
  ADD COLUMN IF NOT EXISTS vat_number TEXT,
  ADD COLUMN IF NOT EXISTS cr_number TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ═══════════════════════════════════════════════════════════════
-- 7. UPDATE PRODUCTS TABLE
-- ═══════════════════════════════════════════════════════════════

-- Rename tva to tva_rate if exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tva') THEN
    ALTER TABLE products RENAME COLUMN tva TO tva_rate;
  END IF;
END $$;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS tva_rate NUMERIC(5,2) DEFAULT 19,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Change price to numeric if it's text
-- ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(15,2) USING price::NUMERIC;

-- ═══════════════════════════════════════════════════════════════
-- 8. FUNCTION: GET NEXT DOCUMENT NUMBER
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_next_doc_number(p_user_id UUID, p_kind doc_kind)
RETURNS TEXT AS $$
DECLARE
  v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  v_prefix TEXT;
  v_next_num INTEGER;
  v_result TEXT;
BEGIN
  -- Get prefix based on kind
  v_prefix := CASE p_kind
    WHEN 'invoice' THEN 'FAC'
    WHEN 'devis' THEN 'DV'
    WHEN 'bon_livraison' THEN 'BL'
    WHEN 'credit_note' THEN 'AV'
  END;
  
  -- Insert or update counter
  INSERT INTO document_counters (user_id, kind, year, last_number, prefix)
  VALUES (p_user_id, p_kind, v_year, 1, v_prefix)
  ON CONFLICT (user_id, kind, year) 
  DO UPDATE SET 
    last_number = document_counters.last_number + 1,
    updated_at = NOW()
  RETURNING last_number INTO v_next_num;
  
  -- Format: PREFIX-YYYY-NNNN
  v_result := v_prefix || '-' || v_year || '-' || LPAD(v_next_num::TEXT, 4, '0');
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- 9. TRIGGERS: AUTO UPDATE TIMESTAMPS
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Documents
DROP TRIGGER IF EXISTS documents_updated_at ON documents_new;
CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents_new
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Clients
DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Products
DROP TRIGGER IF EXISTS products_updated_at ON products;
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 10. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on new tables
ALTER TABLE documents_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_counters ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents_new
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own documents" ON documents_new
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own documents" ON documents_new
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own documents" ON documents_new
  FOR DELETE USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    document_id IN (SELECT id FROM documents_new WHERE user_id = auth.uid())
  );
  
CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (
    document_id IN (SELECT id FROM documents_new WHERE user_id = auth.uid())
  );
  
CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (
    document_id IN (SELECT id FROM documents_new WHERE user_id = auth.uid())
  );
  
CREATE POLICY "Users can delete own payments" ON payments
  FOR DELETE USING (
    document_id IN (SELECT id FROM documents_new WHERE user_id = auth.uid())
  );

-- Document counters policies
CREATE POLICY "Users can view own counters" ON document_counters
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own counters" ON document_counters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own counters" ON document_counters
  FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- MIGRATION NOTES
-- ═══════════════════════════════════════════════════════════════
-- 
-- To complete migration from old documents table:
-- 
-- 1. Rename tables:
--    ALTER TABLE documents RENAME TO documents_old;
--    ALTER TABLE documents_new RENAME TO documents;
--
-- 2. Migrate data (example):
--    INSERT INTO documents (user_id, kind, number, status, ...)
--    SELECT user_id, 'invoice', 'FAC-' || title, 'draft', ...
--    FROM documents_old;
--
-- 3. Drop old table when confident:
--    DROP TABLE documents_old;
-- ═══════════════════════════════════════════════════════════════
