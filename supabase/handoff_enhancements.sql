-- Handoff Flow Enhancements
-- Adds support for scheduled handoffs and distinct methods (Drop-off, Meet-up, Digital)

-- 1. Add new columns to transactions
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS handoff_method TEXT DEFAULT 'meet_up' 
  CHECK (handoff_method IN ('meet_up', 'drop_off', 'digital', 'service_rendered')),
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS handoff_details JSONB; -- For flexible metadata like locker codes, etc.

-- 2. Update status comment to reflect potential granular states
COMMENT ON COLUMN public.transactions.status IS 'pending = loop created, vendor_confirmed = vendor marked fulfilled/dropped off, completed = buyer confirmed receipt, cancelled = either party cancelled, disputed = issue flagged';

-- 3. Update existing records to default 'meet_up'
UPDATE public.transactions SET handoff_method = 'meet_up' WHERE handoff_method IS NULL;
