-- Run once in Supabase SQL Editor before deploying the updated application.
BEGIN;
ALTER TABLE public.relief_registrations ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.relief_registrations ADD COLUMN IF NOT EXISTS sub_district TEXT;
ALTER TABLE public.relief_registrations ADD COLUMN IF NOT EXISTS image_urls TEXT[];
ALTER TABLE public.relief_registrations ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'delivery';

-- Backfill only addresses using the application's existing ต. / อ. / จ. format.
UPDATE public.relief_registrations SET
  province = COALESCE(province, NULLIF(btrim(substring(address from 'จ\.(.+)$')), '')),
  sub_district = COALESCE(sub_district, NULLIF(btrim(substring(address from 'ต\.(.+?)\s+อ\.')), ''))
WHERE province IS NULL OR sub_district IS NULL;

UPDATE public.relief_registrations
SET image_urls = CASE
  WHEN image_url IS NOT NULL AND image_url <> '' AND image_url NOT LIKE '%images.unsplash.com/photo-1541829070764-84a7d30dd3f3%'
    THEN ARRAY[image_url]
  ELSE ARRAY[]::TEXT[]
END
WHERE image_urls IS NULL;

CREATE INDEX IF NOT EXISTS relief_registrations_area_idx
ON public.relief_registrations (province, district, sub_district);
NOTIFY pgrst, 'reload schema';
COMMIT;
