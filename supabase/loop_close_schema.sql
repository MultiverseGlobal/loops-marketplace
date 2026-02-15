-- Loop Close Transaction System Schema Updates
-- Creates the infrastructure for tracking marketplace transactions from interest to completion

-- 1. Update transactions table with new columns
ALTER TABLE transactions 
  ADD COLUMN IF NOT EXISTS pickup_location TEXT,
  ADD COLUMN IF NOT EXISTS vendor_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS buyer_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS vendor_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS buyer_proof_url TEXT;

-- 2. Add helpful comment for status field
COMMENT ON COLUMN transactions.status IS 'pending = loop created, vendor_confirmed = vendor marked fulfilled, completed = buyer confirmed receipt, cancelled = either party cancelled, disputed = issue flagged';

-- 3. Create RLS policies for transaction management
DROP POLICY IF EXISTS "Users can create loops for items they want to buy" ON transactions;
CREATE POLICY "Users can create loops for items they want to buy" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id AND auth.uid() != seller_id);

DROP POLICY IF EXISTS "Vendors can confirm fulfillment" ON transactions;
CREATE POLICY "Vendors can confirm fulfillment" 
  ON transactions FOR UPDATE 
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "Buyers can confirm receipt" ON transactions;
CREATE POLICY "Buyers can confirm receipt" 
  ON transactions FOR UPDATE 
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- 4. Create index for faster loop queries
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_status ON transactions(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_status ON transactions(seller_id, status);

-- 5. Verify the schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;
