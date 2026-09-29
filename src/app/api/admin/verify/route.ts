import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('aru_admin_session')

    if (!sessionCookie?.value) {
      return NextResponse.json({ authed: false })
    }

    const secret =
      process.env.ADMIN_PASSWORD ||
      process.env.SUPABASE_SECRET_KEY ||
      'aru-admin-secure-key'
    const expectedToken = crypto
      .createHmac('sha256', secret)
      .update('admin_session_authenticated')
      .digest('hex')

    if (sessionCookie.value === expectedToken) {
      return NextResponse.json({ authed: true })
    }

    return NextResponse.json({ authed: false })
  } catch {
    return NextResponse.json({ authed: false })
  }
}
