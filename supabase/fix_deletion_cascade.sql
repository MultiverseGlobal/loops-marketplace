-- Fix constraints for ON DELETE CASCADE

-- 1. Drop existing constraints if they don't have cascade
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_listing_id_fkey;

ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_listing_id_fkey;

ALTER TABLE reports 
DROP CONSTRAINT IF EXISTS reports_listing_id_fkey;

-- 2. Re-add with CASCADE
ALTER TABLE messages
ADD CONSTRAINT messages_listing_id_fkey
FOREIGN KEY (listing_id)
REFERENCES listings(id)
ON DELETE CASCADE;

ALTER TABLE transactions
ADD CONSTRAINT transactions_listing_id_fkey
FOREIGN KEY (listing_id)
REFERENCES listings(id)
ON DELETE CASCADE;

ALTER TABLE reports
ADD CONSTRAINT reports_listing_id_fkey
FOREIGN KEY (listing_id)
REFERENCES listings(id)
ON DELETE CASCADE;
