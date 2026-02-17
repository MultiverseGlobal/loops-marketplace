-- 🤝 QR Handshake: Physical Verification Schema
-- This script enables secure physical confirmation of Loops.

-- 1. Add verification fields to transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS verification_token TEXT DEFAULT substring(md5(random()::text) from 1 for 8),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Index the token for lookup efficiency during scanning
CREATE INDEX IF NOT EXISTS idx_transactions_verification_token ON public.transactions(verification_token);

-- 3. Function to verify a handshake
CREATE OR REPLACE FUNCTION public.verify_handoff_handshake(
    p_transaction_id UUID,
    p_token TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN;
BEGIN
    UPDATE public.transactions
    SET 
        status = 'completed',
        verified_at = now(),
        completed_at = now()
    WHERE id = p_transaction_id 
      AND verification_token = p_token
      AND status != 'completed'
    RETURNING TRUE INTO v_updated;

    RETURN COALESCE(v_updated, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN public.transactions.verification_token IS 'A short unique token used to generate a secure QR code for handoff verification.';
COMMENT ON COLUMN public.transactions.verified_at IS 'Timestamp when the physical handoff was verified via QR code scan.';
