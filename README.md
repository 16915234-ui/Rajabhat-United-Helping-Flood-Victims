This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Address dropdowns and house photos (2026-09-30)

Before deploying this version, run `supabase/migrations/20260930_address_photos.sql` in the Supabase SQL Editor. It adds province, sub_district and image_urls, and backfills recognized legacy addresses and existing photos. It does not change access policies. This migration has not been applied by the local code changes.

The form defaults to Ayutthaya and supports all 77 provinces. Province changes clear district and subdistrict; district changes clear subdistrict. Both delivery and self-pickup require 1–3 house-damage photos, with three separate inputs (JPEG, PNG, WebP; 10MB per file). The flood-photos bucket must allow those file types and file sizes.

Admin area filters combine with status, delivery and text filters. Excel export uses the filtered list; selected-row export uses the selected rows. Old records without recognizable location data appear when area filters are cleared.

Checks: `node --test tests/registration-details.test.cjs` and `npx tsc --noEmit`.
