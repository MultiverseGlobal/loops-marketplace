-- 💸 Release Escrow Funds on Handoff
-- This script ensures sellers are automatically credited when a transaction is physically verified.

CREATE OR REPLACE FUNCTION public.verify_handoff_handshake(
    p_transaction_id UUID,
    p_token TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_seller_id UUID;
    v_amount DECIMAL;
    v_payment_status TEXT;
BEGIN
    -- Get transaction details and check if it's already paid
    SELECT seller_id, amount, payment_status 
    INTO v_seller_id, v_amount, v_payment_status
    FROM public.transactions
    WHERE id = p_transaction_id AND verification_token = p_token;

    -- Update transaction status
    UPDATE public.transactions
    SET 
        status = 'completed',
        verified_at = now(),
        completed_at = now(),
        payout_status = CASE WHEN v_payment_status = 'paid' THEN 'completed' ELSE 'pending' END
    WHERE id = p_transaction_id 
      AND verification_token = p_token
      AND status != 'completed';

    -- If the transaction was paid via Escrow, release funds to the seller's balance
    IF v_payment_status = 'paid' AND v_seller_id IS NOT NULL THEN
        UPDATE public.profiles
        SET 
            available_balance = available_balance + v_amount,
            lifetime_earnings = lifetime_earnings + v_amount
        WHERE id = v_seller_id;
        
        RETURN TRUE;
    END IF;

    -- Return true if the update happened (even if not paid via escrow, e.g. manual cash loop)
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
