import Image from 'next/image'
import type { ReactNode } from 'react'

interface HeroBannerProps {
  title?: string
  subtitle?: string
  children?: ReactNode
}

export default function HeroBanner({
  title = 'ราชภัฏอยุธยาร่วมใจ ช่วยภัยน้ำท่วม',
  subtitle = 'ระบบลงทะเบียนขอรับความช่วยเหลือผู้ประสบอุทกภัย (สำหรับนักศึกษา)',
  children,
}: HeroBannerProps) {
  return (
    <section className="brand-hero relative isolate overflow-hidden text-white">
      <div className="relative mx-auto max-w-5xl px-4 pb-14 pt-7 sm:px-6 sm:pb-16 sm:pt-10">
        <div className="grid items-center gap-6 text-center md:grid-cols-[240px_1fr] md:gap-10 md:text-left">
          <div className="mx-auto w-48 sm:w-56 md:w-full">
            <Image
              src="/brand/aru-student-banner.webp"
              alt="องค์การนักศึกษา มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา"
              width={480}
              height={384}
              priority
              className="brand-wordmark h-auto w-full"
            />
          </div>
          <div className="md:border-l md:border-gold-300/30 md:pl-10">
            <p className="mb-3 text-xs font-semibold tracking-wide text-gold-200 sm:text-sm">องค์การนักศึกษา • มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา</p>
            <h1 className="text-2xl font-bold leading-normal sm:text-4xl sm:leading-snug">{title}</h1>
            <div className="mx-auto my-4 h-0.5 w-12 rounded-full bg-gold-400 md:mx-0" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-white/80 sm:text-base">{subtitle}</p>
          </div>
        </div>
        {children && <div className="relative mt-7">{children}</div>}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-5 rounded-t-[50%] bg-gray-50" aria-hidden="true" />
    </section>
  )
}
