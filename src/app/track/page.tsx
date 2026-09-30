'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import HousePhotoGallery from '@/components/HousePhotoGallery'
import Navbar from '@/components/Navbar'
import HeroBanner from '@/components/HeroBanner'
import { supabase, ReliefRegistration } from '@/lib/supabase'
import {
  Search,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  MapPin,
  Phone,
  GraduationCap,
  BookOpen,
  Truck,
  Car,
  Ship,
  Footprints,
  Waves,
  Copy,
  ExternalLink,
  PlusCircle,
  Calendar,
  Building,
  Building2,
} from 'lucide-react'

const getStatusSteps = (isSelfPickup: boolean) => [
  {
    key: 'pending',
    step: 1,
    label: 'รับเรื่องแล้ว',
    desc: isSelfPickup
      ? 'ทีมงานได้รับข้อมูลแล้ว กำลังตรวจสอบและจัดเตรียมสิ่งของช่วยเหลือ'
      : 'ทีมงานได้รับข้อมูลแล้ว กำลังตรวจสอบและจัดคิวลงพื้นที่',
    icon: Clock,
    color: 'yellow',
  },
  {
    key: 'in_progress',
    step: 2,
    label: 'กำลังดำเนินการ',
    desc: isSelfPickup
      ? 'สิ่งของช่วยเหลือพร้อมให้มารับแล้ว ท่านสามารถเดินทางมารับได้ที่กองพัฒนานักศึกษา มรภ.พระนครศรีอยุธยา'
      : 'อาสาสมัครและทีมงานกำลังเดินทางลงพื้นที่ หรืออยู่ระหว่างทางเพื่อส่งมอบสิ่งของช่วยเหลือ',
    icon: Truck,
    color: 'blue',
  },
  {
    key: 'completed',
    step: 3,
    label: 'ให้ความช่วยเหลือแล้ว',
    desc: isSelfPickup
      ? 'ท่านได้รับสิ่งของช่วยเหลือเรียบร้อยแล้ว ขอให้ท่านและครอบครัวโชคดีมีความสุขสวัสดิ์'
      : 'การส่งมอบความช่วยเหลือถึงบ้านสำเร็จเรียบร้อยแล้ว',
    icon: CheckCircle,
    color: 'green',
  },
] as const

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  in_progress: 1,
  completed: 2,
}

const ACCESS_LABELS: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  car: { label: 'รถยนต์ธรรมดา', Icon: Car, color: 'text-slate-600' },
  pickup: { label: 'รถกระบะยกสูง', Icon: Truck, color: 'text-orange-600' },
  boat: { label: 'เรือเท่านั้น', Icon: Ship, color: 'text-blue-600' },
  walk: { label: 'เดินเท้าเท่านั้น', Icon: Footprints, color: 'text-emerald-600' },
}

function TrackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialId = searchParams.get('id') || ''

  const [inputVal, setInputVal] = useState(initialId)
  const [loading, setLoading] = useState(false)
  const [record, setRecord] = useState<ReliefRegistration | null>(null)
  const [searched, setSearched] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const performSearch = useCallback(async (searchId: string) => {
    const q = searchId.trim().toLowerCase()
    if (!q) {
      setRecord(null)
      setErrorMsg('กรุณากรอกรหัสติดตาม')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setSearched(true)

    try {
      // 1. If full UUID format (36 chars)
      const isFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q)
      if (isFullUuid) {
        const { data, error } = await supabase
          .from('relief_registrations')
          .select('*')
          .eq('id', q)
          .maybeSingle()

        if (error) throw error
        if (data) {
          setRecord(data as ReliefRegistration)
          return
        }
      }

      // 2. Search exact match by student_id
      const { data: studentMatch, error: studentError } = await supabase
        .from('relief_registrations')
        .select('*')
        .eq('student_id', q)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!studentError && studentMatch) {
        setRecord(studentMatch as ReliefRegistration)
        return
      }

      // 3. Fallback: match by prefix (e.g. first 8 characters of ID) or student ID substring
      const { data, error } = await supabase
        .from('relief_registrations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300)

      if (error) throw error

      const found = data?.find(
        (r) =>
          r.id.toLowerCase().startsWith(q) ||
          (r.student_id && r.student_id.toLowerCase().includes(q))
      )
      if (found) {
        setRecord(found as ReliefRegistration)
      } else {
        setRecord(null)
        setErrorMsg('ไม่พบข้อมูลรหัสติดตามหรือรหัสนักศึกษานี้ กรุณาตรวจสอบอีกครั้ง')
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการค้นหา')
      setRecord(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialId) {
      performSearch(initialId)
    }
  }, [initialId, performSearch])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    router.replace(`/track?id=${encodeURIComponent(inputVal.trim())}`)
    performSearch(inputVal)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isSelfPickup = record?.delivery_method === 'self_pickup'
  const currentStepIdx = record ? (STATUS_INDEX[record.status] ?? 0) : 0
  const statusSteps = getStatusSteps(isSelfPickup)
  const accessConfig = record ? ACCESS_LABELS[record.access_condition] : null
  const AccIcon = accessConfig?.Icon ?? Truck

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      {/* ── Magnificent ARU Hero Banner ── */}
      <HeroBanner
        title="ติดตามสถานะการขอรับความช่วยเหลือ"
        subtitle="ป้อนรหัสติดตามที่ได้รับหลังจากการลงทะเบียน เพื่อตรวจสอบความคืบหน้าการช่วยเหลือ"
      >
        {/* Search Box inside Hero Banner */}
        <form onSubmit={handleFormSubmit} className="max-w-xl mx-auto mt-2">
          <div className="flex flex-col sm:flex-row gap-2 bg-white p-2.5 rounded-2xl shadow-2xl border border-white/60">
            <div className="relative flex-1 flex items-center">
              <Search size={18} className="absolute left-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="กรอกรหัสติดตาม หรือ รหัสนักศึกษา (เช่น 8 หลักแรก หรือ 6514...)"
                className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-900 placeholder:text-gray-400 text-sm font-mono outline-none"
                autoFocus={!initialId}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-maroon-700 to-maroon-800 hover:from-maroon-600 hover:to-maroon-700 active:scale-95 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              ตรวจสอบสถานะ
            </button>
          </div>
        </form>
      </HeroBanner>

      {/* Main Content Area */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-sm">
            <AlertCircle size={20} className="flex-shrink-0 text-red-500" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Record Details View */}
        {record && (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden space-y-6 p-6 sm:p-8">
            {/* Case Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">รหัสติดตามเคส</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-black font-mono text-maroon-800 tracking-wider">
                    {record.id.slice(0, 8).toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleCopy(record.id.slice(0, 8).toUpperCase())}
                    className="p-1.5 rounded-lg bg-maroon-50 hover:bg-maroon-100 text-maroon-700 transition-colors"
                    title="คัดลอกรหัสย่อ"
                  >
                    {copied ? <CheckCircle size={15} className="text-green-600" /> : <Copy size={15} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {record.id}</p>
              </div>

              {/* Status Badge */}
              <div>
                {record.status === 'pending' && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                    รอดำเนินการ
                  </span>
                )}
                {record.status === 'in_progress' && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                    กำลังดำเนินการช่วยเหลือ
                  </span>
                )}
                {record.status === 'completed' && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-green-50 text-green-800 border border-green-200 shadow-sm">
                    <CheckCircle size={16} className="text-green-600" />
                    ให้ความช่วยเหลือแล้ว
                  </span>
                )}
              </div>
            </div>

            {/* Timeline Stepper */}
            <div className="py-4">
              <h2 className="text-sm font-bold text-gray-700 mb-6">ความคืบหน้าการช่วยเหลือ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                {statusSteps.map((st, idx) => {
                  const isDone = idx <= currentStepIdx
                  const isCurrent = idx === currentStepIdx
                  const StIcon = st.icon

                  return (
                    <div
                      key={st.key}
                      className={`relative rounded-2xl p-4 border transition-all ${
                        isCurrent
                          ? 'bg-maroon-50/70 border-maroon-300 ring-2 ring-maroon-500/20'
                          : isDone
                          ? 'bg-green-50/60 border-green-200'
                          : 'bg-gray-50 border-gray-100 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isCurrent
                              ? 'bg-maroon-700 text-white shadow-md'
                              : isDone
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isDone && !isCurrent ? <CheckCircle size={18} /> : <StIcon size={18} />}
                        </div>
                        <div>
                          <p
                            className={`font-bold text-sm ${
                              isCurrent ? 'text-maroon-900' : isDone ? 'text-green-900' : 'text-gray-500'
                            }`}
                          >
                            {st.label}
                          </p>
                          <p className="text-xs text-gray-400">ขั้นตอนที่ {st.step}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mt-2">{st.desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-4 pt-2">
              {/* Delivery Method Banner */}
              {record.delivery_method === 'self_pickup' || (record.address && record.address.includes('กองพัฒนานักศึกษา')) || record.district === 'กองพัฒนานักศึกษา' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Building2 size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-md">
                        รับสิ่งของเองที่กองพัฒนานักศึกษา
                      </span>
                      <span className="text-xs text-emerald-700 font-semibold">(ไม่ต้องลงพื้นที่)</span>
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium mt-1">
                      ท่านเลือกมารับสิ่งของด้วยตนเอง ณ กองพัฒนานักศึกษา มรภ.พระนครศรีอยุธยา
                    </p>
                  </div>
                </div>
              ) : null}

              <h2 className="text-sm font-bold text-gray-700">ข้อมูลผู้ลงทะเบียน</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">ชื่อ-นามสกุล</p>
                  <p className="font-semibold text-gray-900 text-sm">{record.full_name}</p>
                </div>
                {record.student_id && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                      <GraduationCap size={13} className="text-maroon-600" /> รหัสนักศึกษา
                    </p>
                    <p className="font-mono font-bold text-maroon-800 text-sm">{record.student_id}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">เบอร์โทรศัพท์</p>
                  <p className="font-mono font-semibold text-gray-800 text-sm">{record.phone}</p>
                </div>
                {record.faculty && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                      <GraduationCap size={13} className="text-maroon-600" /> คณะ
                    </p>
                    <p className="font-medium text-gray-800 text-sm">{record.faculty}</p>
                  </div>
                )}
                {record.major && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                      <BookOpen size={13} className="text-maroon-600" /> สาขาวิชา
                    </p>
                    <p className="font-medium text-gray-800 text-sm">{record.major}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                    <Calendar size={13} /> วันที่ลงทะเบียน
                  </p>
                  <p className="text-xs text-gray-700">
                    {new Date(record.created_at).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  {record.delivery_method === 'self_pickup' || (record.address && record.address.includes('กองพัฒนานักศึกษา')) || record.district === 'กองพัฒนานักศึกษา' ? (
                    <>
                      <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                        <Building2 size={13} className="text-emerald-600" /> รูปแบบการรับ
                      </p>
                      <p className="font-semibold text-xs text-emerald-700">
                        🏢 รับเองที่กองพัฒนานักศึกษา
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1">
                        <AccIcon size={13} className={accessConfig?.color} /> สภาพเส้นทาง
                      </p>
                      <p className={`font-semibold text-xs ${accessConfig?.color ?? 'text-gray-700'}`}>
                        {accessConfig?.label ?? record.access_condition}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Address card */}
              {record.delivery_method === 'self_pickup' || (record.address && record.address.includes('กองพัฒนานักศึกษา')) || record.district === 'กองพัฒนานักศึกษา' ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
                    <Building2 size={14} className="text-emerald-600" /> สถานที่รับสิ่งของช่วยเหลือ
                  </p>
                  <p className="text-sm text-gray-900 leading-relaxed font-bold">
                    กองพัฒนานักศึกษา มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    เลขที่ 96 หมู่ 2 ถนนปรีดีพนมยงค์ ตำบลประตูชัย อำเภอพระนครศรีอยุธยา จังหวัดพระนครศรีอยุธยา 13000
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                    <MapPin size={14} /> ที่อยู่สำหรับการเดินทางช่วยเหลือ
                  </p>
                  <p className="text-sm text-gray-800 leading-relaxed font-medium">{record.address}</p>
                  {record.landmark && (
                    <p className="text-xs text-gray-600 mt-2 bg-white/70 p-2.5 rounded-xl border border-blue-100">
                      <span className="font-semibold text-blue-800">จุดสังเกต:</span> {record.landmark}
                    </p>
                  )}
                </div>
              )}

              <HousePhotoGallery record={record} />

              {/* Action Links */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {record.google_maps_link && (
                  <a
                    href={record.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <MapPin size={16} /> ดูพิกัดบน Google Maps <ExternalLink size={14} />
                  </a>
                )}
                <Link
                  href="/register"
                  className="flex-1 py-3 px-4 bg-maroon-700 hover:bg-maroon-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <PlusCircle size={16} /> ลงทะเบียนรายการใหม่
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Empty State / Not searched yet */}
        {!record && !loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-maroon-50 text-maroon-700 flex items-center justify-center mx-auto shadow-inner">
              <Search size={28} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">กรอกรหัสติดตามเพื่อดูข้อมูล</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              ท่านสามารถดูสถานะการดำเนินงานของทีมงานจิตอาสาได้แบบเรียลไทม์ โดยใช้รหัสคดีที่ได้รับเมื่อลงทะเบียนเสร็จสิ้น
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-maroon-700 hover:bg-maroon-600 text-white font-semibold text-sm transition-colors"
              >
                <PlusCircle size={16} /> ยังไม่ได้ลงทะเบียน? คลิกที่นี่
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 size={32} className="animate-spin text-maroon-700" />
        </div>
      }
    >
      <TrackContent />
    </Suspense>
  )
}
