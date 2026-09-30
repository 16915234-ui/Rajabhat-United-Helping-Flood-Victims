import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { deleteRegistrations } from '@/lib/delete-registrations'

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

    const body = await request.json()
    const requestedIds = body?.id ? [body.id] : body?.ids
    if (!Array.isArray(requestedIds) || requestedIds.length === 0 || requestedIds.length > 500 ||
      requestedIds.some((id: unknown) => typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
      return NextResponse.json({ success: false, message: 'รหัสรายการไม่ถูกต้อง หรือเลือกเกิน 500 รายการ' }, { status: 400 })
    }
    const ids = [...new Set(requestedIds as string[])]

    // 3. Create server-side Supabase client with secret key (bypasses RLS)
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://szqsktwlexdxlsmgshod.supabase.co'

    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseKey) {
      return NextResponse.json({ success: false, message: 'ยังไม่ได้ตั้งค่าคีย์ฝั่งเซิร์ฟเวอร์สำหรับลบข้อมูลและรูปภาพ' }, { status: 500 })
    }
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const result = await deleteRegistrations(supabaseAdmin, supabaseUrl, ids)
    return NextResponse.json({ success: true, ...result })
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Delete failed' },
      { status: 500 }
    )
  }
}
