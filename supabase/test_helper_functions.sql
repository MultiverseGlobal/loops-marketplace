-- 🧪 Test Helper for Backend Validation (Bypassing RLS)
-- DO NOT DEPLOY TO PRODUCTION WITHOUT SECURITY AUDIT

CREATE OR REPLACE FUNCTION public.create_test_transaction(
    p_listing_id UUID,
    p_buyer_id UUID,
    p_seller_id UUID,
    p_amount INT,
    p_platform_fee INT,
    p_payment_id TEXT
) RETURNS UUID AS $$
DECLARE
    v_new_id UUID;
BEGIN
    INSERT INTO public.transactions (
        listing_id, 
        buyer_id, 
        seller_id, 
        amount, 
        platform_fee, 
        payment_status, 
        payment_id, 
        status
    )
    VALUES (
        p_listing_id,
        p_buyer_id,
        p_seller_id,
        p_amount,
        p_platform_fee,
        'pending',
        p_payment_id,
        'pending'
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
