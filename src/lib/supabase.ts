import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://szqsktwlexdxlsmgshod.supabase.co'

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_jkW8y6MJqtivspTN8EOldg_yPffvtrv'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ReliefRegistration = {
  id: string
  created_at: string
  full_name: string
  student_id?: string | null
  user_type: 'student' | 'citizen'
  faculty?: string | null
  major?: string | null
  phone: string
  line_id: string | null
  address: string
  district: string | null
  image_url: string
  landmark: string | null
  google_maps_link: string | null
  access_condition: string
  status: 'pending' | 'in_progress' | 'completed'
}
