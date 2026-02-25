-- Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('offer', 'message', 'referral', 'system')),
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)" 
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Create a function to auto-delete old notifications (optional but good practice)
-- This keeps the database lean.
CREATE OR REPLACE FUNCTION delete_old_notifications() RETURNS trigger AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE created_at < now() - interval '30 days';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Enable Real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
