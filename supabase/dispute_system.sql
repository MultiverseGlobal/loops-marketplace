-- ⚖️ Loops Dispute Resolution System
-- This script enables buyers and sellers to flag problematic transactions.

-- 1. Create Disputes Table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.profiles(id),
    reason TEXT NOT NULL, -- e.g., 'no_show', 'item_not_as_described', 'item_damaged'
    description TEXT,
    evidence_urls TEXT[], -- Array of image URLs
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_refunded', 'resolved_released')),
    admin_id UUID REFERENCES public.profiles(id), -- Admin assigned to the case
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trigger to set transaction status to 'disputed'
CREATE OR REPLACE FUNCTION public.on_dispute_opened_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.transactions
    SET status = 'disputed'
    WHERE id = NEW.transaction_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_dispute_opened ON public.disputes;
CREATE TRIGGER tr_on_dispute_opened
AFTER INSERT ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION public.on_dispute_opened_trigger();

-- 3. Policy: Users can view their own disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own disputes" ON public.disputes;
CREATE POLICY "Users can view their own disputes" ON public.disputes
FOR SELECT USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can view all disputes" ON public.disputes;
CREATE POLICY "Admins can view all disputes" ON public.disputes
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- 4. Constraint: Prevent Handshake if Disputed
-- Modification to verify_handoff_handshake to check for active disputes.
-- (Existing function in payment_v1_migration.sql should be updated or we can add a check here)

COMMENT ON TABLE public.disputes IS 'Stores records of failed or problematic transactions for admin intervention.';
