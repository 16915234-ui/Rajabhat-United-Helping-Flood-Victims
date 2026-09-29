'use client'

interface HeroBannerProps {
  title?: string
  subtitle?: string
  children?: React.ReactNode
}

export default function HeroBanner({
  title = 'ราชภัฏร่วมใจ ช่วยภัยน้ำท่วม',
  subtitle = 'ระบบลงทะเบียนขอรับความช่วยเหลือผู้ประสบอุทกภัย (สำหรับนักศึกษา)',
  children,
}: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-maroon-950 via-[#68001c] to-maroon-900 text-white pt-8 sm:pt-12">
      {/* ── Subtle Ambient Light Accents (Dignified & Prestigious) ── */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-maroon-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* ── Delicate Geometric Texture ── */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* ── Official University Transparent Banner ── */}
        <div className="flex justify-center mb-6">
          <div className="relative group inline-block">
            <div className="absolute -inset-3 bg-gradient-to-r from-gold-500/20 via-white/10 to-gold-500/20 rounded-2xl blur-xl opacity-60 pointer-events-none" />
            <img
              src="/aru-banner-darkmode.png"
              alt="Phranakhon Si Ayutthaya Rajabhat University"
              className="relative h-14 sm:h-20 w-auto object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>

        {/* ── Official Title & Subtitle ── */}
        <div className="max-w-2xl mx-auto space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm leading-tight">
            {title}
          </h1>

          {/* Thin gold royal divider */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto my-2.5 rounded-full" />

          <p className="text-white/80 text-sm sm:text-base font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Optional child slot (e.g. search box in /track) */}
        {children && <div className="mt-6">{children}</div>}
      </div>

      {/* ── Bottom Wave Curve (Seamless transition into page body) ── */}
      <div className="relative w-full overflow-hidden leading-none mt-8 -mb-0.5">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="relative block w-full h-8 sm:h-12 text-gray-50 fill-current"
        >
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </div>
  )
}
