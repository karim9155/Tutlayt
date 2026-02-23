-- ============================================================
-- 019 Payment System
-- Adds balance, transactions, and invoices for client accounts
-- ============================================================

-- 1. Add balance column to companies (actual monetary value, e.g. TND / USD / EUR)
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00;

-- Migrate existing integer credits to balance (1 credit = 1 currency unit)
UPDATE companies SET balance = credits WHERE credits > 0 AND balance = 0;

-- 2. Transaction type enum
DO $$ BEGIN
  CREATE TYPE transaction_type AS ENUM ('credit_purchase', 'booking_deduction', 'refund');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Transaction status enum
DO $$ BEGIN
  CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type              transaction_type NOT NULL,
  amount            DECIMAL(12, 2) NOT NULL,         -- base amount (positive for purchase, negative for deduction)
  currency          TEXT NOT NULL DEFAULT 'TND',
  tva_amount        DECIMAL(10, 2),                  -- only for local client purchases (19% TVA)
  total_amount      DECIMAL(12, 2) NOT NULL,          -- amount + tva_amount (or same as amount if no TVA)
  status            transaction_status NOT NULL DEFAULT 'pending',
  payment_reference TEXT,                             -- Click2Pay reference when available
  booking_id        UUID REFERENCES bookings(id) ON DELETE SET NULL,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Auto-increment invoice counter per year
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Function to generate invoice numbers: INV-YYYY-NNNNN
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  yr TEXT;
  seq_val BIGINT;
BEGIN
  yr := to_char(now(), 'YYYY');
  seq_val := nextval('invoice_number_seq');
  RETURN 'INV-' || yr || '-' || lpad(seq_val::TEXT, 5, '0');
END;
$$;

-- 6. Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id    UUID NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
  client_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_number    TEXT NOT NULL UNIQUE DEFAULT generate_invoice_number(),
  amount            DECIMAL(12, 2) NOT NULL,
  tva_amount        DECIMAL(10, 2),
  total_amount      DECIMAL(12, 2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'TND',
  client_name       TEXT NOT NULL,
  client_company    TEXT NOT NULL,
  client_fiscal_id  TEXT,
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_url           TEXT                                -- Supabase Storage path once generated
);

-- 7. Indexes
CREATE INDEX IF NOT EXISTS transactions_client_id_idx ON transactions(client_id);
CREATE INDEX IF NOT EXISTS transactions_booking_id_idx ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);
CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON invoices(client_id);
CREATE INDEX IF NOT EXISTS invoices_transaction_id_idx ON invoices(transaction_id);

-- 8. Updated_at trigger for transactions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Clients can read their own transactions
CREATE POLICY "clients_read_own_transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = client_id);

-- Clients can read their own invoices
CREATE POLICY "clients_read_own_invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = client_id);

-- Service role can do everything (used from server actions with service key)
CREATE POLICY "service_role_transactions"
  ON transactions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_invoices"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');

-- 10. Storage bucket for invoices (run via Supabase dashboard or storage API, SQL shown for reference)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', false) ON CONFLICT DO NOTHING;
