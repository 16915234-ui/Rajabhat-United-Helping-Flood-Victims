import type { Metadata } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-thai',
})

export const metadata: Metadata = {
  title: 'ราชภัฏอยุธยาร่วมใจ ช่วยภัยน้ำท่วม | ARU Flood Relief',
  description:
    'โครงการ "ราชภัฏอยุธยาร่วมใจ ช่วยภัยน้ำท่วม" จัดโดยมหาวิทยาลัยราชภัฏพระนครศรีอยุธยา ลงทะเบียนขอรับความช่วยเหลือผู้ประสบภัยน้ำท่วม',
  keywords: ['น้ำท่วม', 'ช่วยเหลือ', 'ราชภัฏอยุธยา', 'ARU', 'flood relief', 'ลงทะเบียน'],
  openGraph: {
    title: 'ราชภัฏอยุธยาร่วมใจ ช่วยภัยน้ำท่วม',
    description: 'ลงทะเบียนขอรับความช่วยเหลือผู้ประสบภัยน้ำท่วม',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body className="font-thai antialiased bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
