-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Add cancellation_fee column if not exists (for cancellation policy)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'bookings' 
                 AND column_name = 'cancellation_fee') THEN
    ALTER TABLE public.bookings ADD COLUMN cancellation_fee numeric DEFAULT 0;
  END IF;
END $$;