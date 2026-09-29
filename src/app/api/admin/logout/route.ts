import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('aru_admin_session')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}
