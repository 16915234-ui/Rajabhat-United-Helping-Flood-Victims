import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    // 1. Verify admin session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('aru_admin_session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const secret =
      process.env.ADMIN_PASSWORD ||
      process.env.SUPABASE_SECRET_KEY ||
      'aru-admin-secure-key'
    const expectedToken = crypto
      .createHmac('sha256', secret)
      .update('admin_session_authenticated')
      .digest('hex')

    if (sessionCookie.value !== expectedToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { id, ids, status } = body

    if (!status) {
      return NextResponse.json({ success: false, message: 'Missing status' }, { status: 400 })
    }

    // 3. Create server-side Supabase client with secret key (bypasses RLS)
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://szqsktwlexdxlsmgshod.supabase.co'

    const supabaseKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    if (id) {
      const { error } = await supabaseAdmin
        .from('relief_registrations')
        .update({ status })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
      }
    } else if (ids && ids.length > 0) {
      const { error } = await supabaseAdmin
        .from('relief_registrations')
        .update({ status })
        .in('id', ids)

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Status update failed' },
      { status: 500 }
    )
  }
}
