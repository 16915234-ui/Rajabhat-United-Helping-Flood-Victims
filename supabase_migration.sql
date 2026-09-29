-- ============================================================
-- Supabase SQL Migration for "Rajabhat Ruam Jai Flood Relief"
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the relief_registrations table
CREATE TABLE IF NOT EXISTS public.relief_registrations (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  full_name         TEXT        NOT NULL,
  user_type         TEXT        NOT NULL DEFAULT 'student' CHECK (user_type IN ('student', 'citizen')),
  faculty           TEXT,
  major             TEXT,
  phone             TEXT        NOT NULL,
  line_id           TEXT,
  address           TEXT        NOT NULL,
  district          TEXT,
  image_url         TEXT        NOT NULL,
  landmark          TEXT,
  google_maps_link  TEXT,
  access_condition  TEXT        NOT NULL CHECK (access_condition IN ('car', 'pickup', 'boat')),
  status            TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed'))
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.relief_registrations ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone (anon) to INSERT (public registration form)
CREATE POLICY "Allow public insert"
  ON public.relief_registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Allow anyone to SELECT (admin reads via anon key — adjust for production)
CREATE POLICY "Allow public read"
  ON public.relief_registrations
  FOR SELECT
  TO anon
  USING (true);

-- 5. Allow anyone to UPDATE status (for admin dashboard)
CREATE POLICY "Allow public update"
  ON public.relief_registrations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 6. Allow anyone to DELETE (for admin dashboard deletion)
CREATE POLICY "Allow public delete"
  ON public.relief_registrations
  FOR DELETE
  TO anon
  USING (true);

-- ============================================================
-- Storage Setup (do this in Supabase Dashboard > Storage)
-- 1. Create a bucket named: flood-photos
-- 2. Set bucket to PUBLIC
-- 3. Add storage policy: Allow anon uploads
-- ============================================================

-- Storage policy for uploads (run after creating bucket in dashboard):
-- INSERT policy for storage.objects:
-- Name: Allow anon upload to flood-photos
-- Target: authenticated, anon
-- Expression: bucket_id = 'flood-photos'
