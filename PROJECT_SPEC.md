# Project Prompt: Next.js & Supabase Flood Relief Web Application ("Rajabhat Ruam Jai Flood Relief")

## 1. Project Overview
Build a modern, mobile-friendly web application for the flood relief project called "ราชภัฏอยุธยาร่วมใจ ช่วยภัยน้ำท่วม" (Rajabhat Ruam Jai Flood Relief) organized by Phranakhon Si Ayutthaya Rajabhat University (ARU) student organization. The app allows flood victims (both students and general citizens) to register for assistance, upload house photos, provide location details, and gives staff/volunteers an admin dashboard to manage and organize relief deployment efficiently.

## 2. Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database & Storage:** Supabase (PostgreSQL for data, Supabase Storage for house photos)
- **Deployment:** Vercel
- **Icons:** `lucide-react`

## 3. Brand Identity & UI/UX (ARU Theme)
- Align with Phranakhon Si Ayutthaya Rajabhat University's brand identity:
  - **Primary Color:** Maroon / Burgundy (e.g., `#800020` or similar deep red)
  - **Secondary/Accent Color:** Warm Gold / Amber
  - **Background:** Clean, compassionate, and readable (White / Gray-50)
- **Navbar:** Feature the ARU logo and the campaign title clearly.

## 4. Pages & Key Features

### Page 1: Public Landing Page (`/`)
- **Hero Section:** Showcase the project title, campaign description, donation/relief items accepted (Drinking water, dry food, rice, personal care, cleaning supplies), and drop-off points.
- **Call to Action (CTA):** Prominent button to navigate to the registration form ("ลงทะเบียนขอรับความช่วยเหลือ").

### Page 2: Registration Form Page (`/register`)
A clean, step-by-step or single-page mobile-first form with proper validation:
1. **Personal Information:**
   - Full Name (Mandatory)
   - User Type (Student / General Citizen)
   - Phone Number (Mandatory, with validation)
   - Line ID (Optional)
2. **Address & House Photo:**
   - Full Address (House number, village, sub-district, district, province) (Mandatory)
   - **House Photo Upload:** File input that uploads directly to a Supabase storage bucket (`flood-photos`) and saves the public URL (Mandatory).
3. **Field Deployment Information:**
   - Nearby Landmark
   - Google Maps Link (Optional)
   - Accessibility Condition (e.g., Normal car, High-lift pickup truck, Boat only)
- **Submission Feedback:** Success screen displaying a unique tracking/case ID upon completion.

### Page 3: Admin Dashboard (`/admin`)
- **Security:** Simple authentication or protected route.
- **Data Table:** Displays all submissions sorted by newest first.
- **Filters & Search:** Filter by status (`pending`, `in_progress`, `completed`), search by name or district.
- **Detail Modal / Drawer:**
   - View victim details and full-size house photo.
   - Direct link to Google Maps for navigation.
   - Option to update case status (Pending -> In Progress -> Completed).

## 5. Supabase Database Schema
Create a table named `relief_registrations`:
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `created_at` (Timestamp, Default: `now()`)
- `full_name` (Text, Required)
- `user_type` (Text: 'student' | 'citizen', Required)
- `phone` (Text, Required)
- `line_id` (Text, Optional)
- `address` (Text, Required)
- `district` (Text, Optional)
- `image_url` (Text, Required)
- `landmark` (Text, Optional)
- `google_maps_link` (Text, Optional)
- `access_condition` (Text, Required)
- `status` (Text, Default: 'pending')

## 6. Development Workflow
1. Initialize Next.js project with Tailwind CSS and TypeScript.
2. Configure Supabase client and set up the storage bucket (`flood-photos`).
3. Build the Landing Page incorporating the ARU color scheme.
4. Implement the Registration form with Supabase storage integration.
5. Build the Admin Dashboard with status updating and filtering capabilities.
6. Test responsive layouts for mobile devices and deploy to Vercel.