'use client'

import {
  Waves,
  Ship,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  GraduationCap,
} from 'lucide-react'

interface HeroBannerProps {
  badgeText?: string
  title?: string
  subtitle?: string
  showStats?: boolean
  children?: React.ReactNode
}

export default function HeroBanner({
  badgeText = 'โครงการจิตอาสา มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา',
  title = 'ราชภัฏร่วมใจ ช่วยภัยน้ำท่วม',
  subtitle = 'ศูนย์ประสานงานและส่งมอบความช่วยเหลือผู้ประสบอุทกภัย — องค์การบริหารนักศึกษา มรภ.พระนครศรีอยุธยา',
  showStats = true,
  children,
}: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-maroon-950 via-[#68001c] to-maroon-900 text-white pt-8 sm:pt-12">
      {/* ── Ambient Glowing Lights (Decorative) ── */}
      <div className="absolute -top-28 -left-28 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-maroon-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-gold-400/10 via-maroon-400/20 to-gold-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Subtle Geometric Grid Overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* ── Top University Badge ── */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-gold-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <Sparkles size={14} className="text-gold-300 animate-pulse flex-shrink-0" />
          <span>{badgeText}</span>
        </div>

        {/* ── Official Transparent Logo Banner (Minimal Luxury Style) ── */}
        <div className="flex justify-center mb-6">
          <div className="relative group inline-block">
            {/* Ambient golden glow aura */}
            <div className="absolute -inset-4 bg-gradient-to-r from-gold-500/30 via-white/15 to-gold-500/30 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none" />

            {/* Minimal Luxury Floating Glass Plate */}
            <div className="relative px-6 py-3.5 sm:px-10 sm:py-4 rounded-3xl bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-xl border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] transition-all duration-300">
              <img
                src="/aru-banner-darkmode.png"
                alt="Phranakhon Si Ayutthaya Rajabhat University"
                className="h-12 sm:h-20 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>

        {/* ── Grand Headline ── */}
        <div className="max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {title}
          </h1>

          {/* Golden accent bar */}
          <div className="flex items-center justify-center gap-2 my-3">
            <span className="w-12 sm:w-20 h-0.5 bg-gradient-to-r from-transparent to-gold-400 rounded-full" />
            <Waves size={20} className="text-gold-300 float-anim flex-shrink-0" />
            <span className="w-12 sm:w-20 h-0.5 bg-gradient-to-l from-transparent to-gold-400 rounded-full" />
          </div>

          <p className="text-white/85 text-sm sm:text-base font-normal leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* ── Highlight Badges ── */}
        {showStats && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-gold-400/20 text-gold-300 flex items-center justify-center mx-auto mb-2">
                <Ship size={18} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">เรือ & รถยกสูง</p>
              <p className="text-[11px] text-white/70 mt-0.5">เข้าถึงทุกพื้นที่น้ำท่วม</p>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-gold-400/20 text-gold-300 flex items-center justify-center mx-auto mb-2">
                <HeartHandshake size={18} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">ถุงยังชีพ & อาหาร</p>
              <p className="text-[11px] text-white/70 mt-0.5">น้ำดื่มและของใช้จำเป็น</p>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-gold-400/20 text-gold-300 flex items-center justify-center mx-auto mb-2">
                <MapPin size={18} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">ปักหมุดแผนที่</p>
              <p className="text-[11px] text-white/70 mt-0.5">นำทางแม่นยำถึงบ้าน</p>
            </div>

            <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 rounded-2xl p-3 sm:p-4 text-center transition-all duration-200">
              <div className="w-9 h-9 rounded-xl bg-gold-400/20 text-gold-300 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck size={18} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-white">ติดตามสถานะ</p>
              <p className="text-[11px] text-white/70 mt-0.5">ตรวจสอบคิวช่วยเหลือได้</p>
            </div>
          </div>
        )}

        {/* ── Emergency Hotline Pill ── */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600/80 to-maroon-700/80 border border-red-400/40 text-white text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-md">
          <PhoneCall size={15} className="text-gold-300 animate-pulse" />
          <span>
            สายด่วนประสานงานช่วยเหลือฉุกเฉิน ARU:{' '}
            <a href="tel:035221222" className="text-gold-300 underline font-mono font-bold hover:text-white transition-colors">
              035-221-222
            </a>
          </span>
        </div>

        {/* Optional child slot (e.g. search box in /track) */}
        {children && <div className="mt-8">{children}</div>}
      </div>

      {/* ── Bottom Wave Curve (Organic transition into gray-50) ── */}
      <div className="relative w-full overflow-hidden leading-none mt-8 -mb-0.5">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-8 sm:h-14 text-gray-50 fill-current"
        >
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  )
}
