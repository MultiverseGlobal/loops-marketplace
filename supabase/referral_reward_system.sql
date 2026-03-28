-- 🎁 Referral Reward System
-- This script automates the crediting of referrers when their friends complete a Loop.

-- 1. Function to handle referral rewards safely
CREATE OR REPLACE FUNCTION public.process_referral_reward(p_new_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_referrer_code TEXT;
    v_referrer_id UUID;
    v_reward_amount DECIMAL := 200.00; -- Current flat reward: ₦200
    v_already_rewarded BOOLEAN;
BEGIN
    -- Check if this user was referred by someone
    SELECT referred_by_code INTO v_referrer_code 
    FROM public.profiles 
    WHERE id = p_new_user_id;

    IF v_referrer_code IS NOT NULL THEN
        -- Find the referrer
        SELECT id INTO v_referrer_id 
        FROM public.profiles 
        WHERE referral_code = v_referrer_code;

        -- Ensure we haven't already paid out for this specific referral
        SELECT EXISTS (
            SELECT 1 FROM public.referral_rewards 
            WHERE referred_id = p_new_user_id AND status = 'earned'
        ) INTO v_already_rewarded;

        IF v_referrer_id IS NOT NULL AND NOT v_already_rewarded THEN
            -- 1. Create reward record
            INSERT INTO public.referral_rewards (referrer_id, referred_id, reward_amount, status)
            VALUES (v_referrer_id, p_new_user_id, v_reward_amount, 'earned');

            -- 2. Credit referrer's balance
            UPDATE public.profiles
            SET 
                available_balance = available_balance + v_reward_amount,
                lifetime_earnings = lifetime_earnings + v_reward_amount
            WHERE id = v_referrer_id;

            -- 3. Notify Referrer
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
                v_referrer_id, 
                'Referral Bonus! 🎁', 
                'Your friend completed their first Loop! ₦200 has been added to your wallet.',
                'success'
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger on transactions to detect first "completed" activity
CREATE OR REPLACE FUNCTION public.on_transaction_completed_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger on successful completion
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Reward referrer for both Buyer and Seller if it's their first time
        PERFORM public.process_referral_reward(NEW.buyer_id);
        PERFORM public.process_referral_reward(NEW.seller_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_transaction_completed_referral ON public.transactions;
CREATE TRIGGER tr_on_transaction_completed_referral
AFTER UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.on_transaction_completed_referral();
