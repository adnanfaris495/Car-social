-- Add a foreign key from marketplace_listings.user_id to users.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'marketplace_listings_user_id_fkey'
      AND table_name = 'marketplace_listings'
  ) THEN
    ALTER TABLE public.marketplace_listings
    ADD CONSTRAINT marketplace_listings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id);
  END IF;
END $$; 