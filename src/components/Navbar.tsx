'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: '/register', label: 'ลงทะเบียนขอความช่วยเหลือ' },
    { href: '/track', label: 'ติดตามสถานะ' },
    { href: '/admin', label: 'สำหรับเจ้าหน้าที่' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-maroon-100 shadow-sm">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Minimal Luxurious Banner Link */}
          <Link href="/register" className="flex items-center gap-3 sm:gap-4 group py-1">
            <Image
              src="/brand/aru-logo.png"
              width={120}
              height={120}
              priority
              alt="ตราสัญลักษณ์ มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา"
              className="brand-crest h-11 w-11 sm:h-12 sm:w-12 shrink-0 object-contain"
            />
            <span className="h-6 w-px bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-maroon-900 group-hover:text-maroon-700 transition-colors">
                ราชภัฏอยุธยาร่วมใจ ช่วยภัยน้ำท่วม
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider hidden sm:block">
                องค์การนักศึกษา มรภ.พระนครศรีอยุธยา
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-maroon-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-maroon-50 hover:text-maroon-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 rounded-lg text-maroon-700 hover:bg-maroon-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div id="mobile-navigation" className="lg:hidden pb-4 pt-2 flex flex-col gap-1 border-t border-gray-100 mt-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? 'bg-maroon-700 text-white'
                    : 'text-gray-700 hover:bg-maroon-50 hover:text-maroon-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="mt-1 px-4 py-3 bg-gradient-to-r from-maroon-700 to-maroon-800 text-white text-sm font-semibold rounded-xl text-center"
            >
              ลงทะเบียนขอรับความช่วยเหลือ
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
