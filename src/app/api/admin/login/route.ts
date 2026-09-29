import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Read server-only environment variable (never leaked to client browser bundle)
    const expectedPassword =
      process.env.ADMIN_PASSWORD ||
      process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
      'admin1234'

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, message: 'รหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // Generate secure auth token
    const secret =
      process.env.ADMIN_PASSWORD ||
      process.env.SUPABASE_SECRET_KEY ||
      'aru-admin-secure-key'
    const token = crypto
      .createHmac('sha256', secret)
      .update('admin_session_authenticated')
      .digest('hex')

    // Set secure HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('aru_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน' },
      { status: 500 }
    )
  }
}
