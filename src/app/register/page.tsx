'use client'

import { useState, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AddressSelects from '@/components/AddressSelects'
import HousePhotos from '@/components/HousePhotos'
import addresses from '@/data/thai-addresses.json'
import Navbar from '@/components/Navbar'
import HeroBanner from '@/components/HeroBanner'
import { supabase } from '@/lib/supabase'
import {
  User,
  Phone,
  MapPin,
  Camera,
  Navigation,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  Loader2,
  AlertCircle,
  Waves,
  Copy,
  Home,
  Hash,
  BookOpen,
  GraduationCap,
  Car,
  Truck,
  Ship,
  Footprints,
  Building2,
  Flag,
} from 'lucide-react'

const LocationPicker = lazy(() => import('@/components/LocationPicker'))

type LatLng = { lat: number; lng: number }

type FormData = {
  full_name: string
  student_id: string    // รหัสนักศึกษา
  phone: string
  line_id: string
  faculty: string
  major: string
  delivery_method: 'delivery' | 'self_pickup' // ประสงค์ให้ลงพื้นที่ หรือ รับเองที่กองพัฒนานักศึกษา
  house_no: string      // บ้านเลขที่ / หมู่
  sub_district: string  // ตำบล / แขวง
  district: string      // อำเภอ / เขต
  province: string      // จังหวัด
  landmark: string
  access_condition: string
}

// ── Faculty & Major Data ────────────────────────────────────────────────
const FACULTIES: { name: string; majors: string[] }[] = [
  {
    name: 'คณะครุศาสตร์',
    majors: [
      'สาขาวิชา การศึกษา (วิชาเอก คณิตศาสตร์)',
      'สาขาวิชา การศึกษา (วิชาเอก วิทยาศาสตร์)',
      'สาขาวิชา การศึกษา (วิชาเอก สังคมศึกษา)',
      'สาขาวิชา การศึกษา (วิชาเอก คอมพิวเตอร์ศึกษา)',
      'สาขาวิชา การศึกษา (วิชาเอก พลศึกษา)',
      'สาขาวิชา การศึกษา (วิชาเอก การสอนภาษาไทย)',
      'สาขาวิชา การศึกษา (วิชาเอก การสอนภาษาอังกฤษ)',
      'สาขาวิชา การศึกษา (วิชาเอก การประถมศึกษา)',
      'สาขาวิชา การศึกษาพิเศษและการสอนภาษาไทย',
      'สาขาวิชา การศึกษา (วิชาเอกการศึกษาปฐมวัย)',
    ],
  },
  {
    name: 'คณะมนุษยศาสตร์และสังคมศาสตร์',
    majors: [
      'สาขาวิชา นาฏศิลป์ศึกษา',
      'สาขาวิชา ศิลปศึกษา',
      'สาขาวิชา ดนตรีศึกษา',
      'สาขาวิชา นิติศาสตร์',
      'สาขาวิชา นิเทศศาสตร์ดิจิทัล',
      'สาขาวิชา การปกครองท้องถิ่น',
      'สาขาวิชา รัฐประศาสนศาสตร์',
      'สาขาวิชา ดนตรีสร้างสรรค์',
      'สาขาวิชา ภาษาอังกฤษ',
      'สาขาวิชา ภาษาไทย',
      'สาขาวิชา ภาษาจีน',
      'สาขาวิชา ภาษาญี่ปุ่น',
      'สาขาวิชา ประวัติศาสตร์',
      'สาขาวิชา การพัฒนาชุมชนและสังคม',
      'สาขาวิชา สหวิทยาการเพื่อการจัดการฮาลาล',
    ],
  },
  {
    name: 'คณะวิทยาศาสตร์และเทคโนโลยี',
    majors: [
      'สาขาวิชา วิทยาศาสตร์ศึกษา (แขนงวิชาฟิสิกส์)',
      'สาขาวิชา วิทยาศาสตร์ศึกษา (แขนงวิชาเคมี)',
      'สาขาวิชา วิทยาศาสตร์ศึกษา (แขนงวิชาชีววิทยา)',
      'สาขาวิชา เทคโนโลยีอุตสาหกรรม (วิชาเอก การจัดการเทคโนโลยีอุตสาหกรรม)',
      'สาขาวิชา เทคโนโลยีอุตสาหกรรม (วิชาเอก เทคโนโลยีระบบควบคุมการผลิตอัตโนมัติ)',
      'สาขาวิชา เกษตรศาสตร์',
      'สาขาวิชา เคมี',
      'สาขาวิชา วิทยาการคอมพิวเตอร์',
      'สาขาวิชา เทคโนโลยีสารสนเทศ',
      'สาขาวิชา อาชีวอนามัยและความปลอดภัย',
      'สาขาวิชา จุลชีววิทยา',
      'สาขาวิชา คหกรรมศาสตร์',
      'สาขาวิชา คณิตศาสตร์ประยุกต์',
      'สาขาวิชา วิทยาศาสตร์และการจัดการเทคโนโลยีอาหาร',
      'สาขาวิชา เทคโนโลยีการเกษตรสมัยใหม่',
      'สาขาวิชา เทคโนโลยีสิ่งแวดล้อม',
      'สาขาวิชา สาธารณสุขศาสตร์',
      'สาขาวิชา วิศวกรรมไฟฟ้า',
      'สาขาวิชา วิศวกรรมการจัดการ',
      'สาขาวิชา วิศวกรรมปัญญาประดิษฐ์ 2 ปี (ต่อเนื่อง)',
    ],
  },
  {
    name: 'คณะวิทยาการจัดการ',
    majors: [
      'สาขาวิชา การจัดการธุรกิจการค้าสมัยใหม่',
      'สาขาวิชา การบัญชี',
      'สาขาวิชา บริหารธุรกิจ (วิชาเอกการจัดการ)',
      'สาขาวิชา บริหารธุรกิจ (วิชาเอกการจัดการโลจิสติกส์และซัพพลายเชน)',
      'สาขาวิชา บริหารธุรกิจ (วิชาเอกการบริหารทรัพยากรมนุษย์)',
      'สาขาวิชา บริหารธุรกิจ (วิชาเอกคอมพิวเตอร์ธุรกิจดิจิทัล)',
      'สาขาวิชา บริหารธุรกิจ (วิชาเอกการตลาดดิจิทัลและอิเวนต์)',
      'สาขาวิชา การท่องเที่ยวและบริการ (แขนงวิชาการท่องเที่ยว)',
      'สาขาวิชา การท่องเที่ยวและบริการ (แขนงวิชาการบริการ)',
    ],
  },
]

const STEPS = [
  { id: 1, title: 'ข้อมูลนักศึกษา', icon: GraduationCap },
  { id: 2, title: 'ที่อยู่ & รูปบ้าน', icon: Home },
  { id: 3, title: 'ข้อมูลการเดินทาง', icon: Navigation },
]

const ACCESS_CONDITIONS = [
  { value: 'car', label: 'รถยนต์ธรรมดา', desc: 'สามารถเข้าถึงได้ด้วยรถยนต์ทั่วไป', Icon: Car, color: 'text-slate-600' },
  { value: 'pickup', label: 'รถกระบะยกสูง', desc: 'ต้องใช้รถกระบะยกสูงหรือรถ 4WD', Icon: Truck, color: 'text-orange-600' },
  { value: 'boat', label: 'เรือเท่านั้น', desc: 'น้ำท่วมสูง เข้าถึงได้ทางเรือเท่านั้น', Icon: Ship, color: 'text-blue-600' },
  { value: 'walk', label: 'เดินเท้าเท่านั้น', desc: 'ยานพาหนะเข้าไม่ถึง ต้องเดินลุยน้ำ/เดินเท้าเข้าไป', Icon: Footprints, color: 'text-emerald-600' },
]

// ── Reusable icon-input wrapper ────────────────────────────────────────
function IconInput({
  id,
  icon,
  error,
  children,
}: {
  id?: string
  icon: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div
        className={`flex items-center gap-0 bg-white border rounded-xl transition-all duration-200
          focus-within:ring-2 focus-within:ring-maroon-500 focus-within:border-transparent
          ${error ? 'border-red-400' : 'border-gray-200'}`}
      >
        <span className="pl-4 pr-2 text-gray-400 flex-shrink-0">{icon}</span>
        {children}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
          <AlertCircle size={12} className="flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    student_id: '',
    phone: '',
    line_id: '',
    faculty: '',
    major: '',
    delivery_method: 'delivery',
    house_no: '',
    sub_district: '',
    district: '',
    province: 'พระนครศรีอยุธยา',
    landmark: '',
    access_condition: '',
  })
  const [location, setLocation] = useState<LatLng | null>(null)
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null])
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'image' | 'location', string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const selectedFaculty = FACULTIES.find((f) => f.name === formData.faculty)
  const majorList = selectedFaculty?.majors ?? []

  const update = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value }
      // reset major when faculty changes
      if (field === 'faculty') next.major = ''
      return next
    })
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleImageChange = (index: number, file: File | null) => {
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'กรุณาเลือกไฟล์ JPG, PNG หรือ WebP' }))
      return
    }
    if (file && file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'ขนาดไฟล์แต่ละภาพต้องไม่เกิน 10MB' }))
      return
    }
    setImageFiles((prev) => prev.map((current, slot) => slot === index ? file : current))
    setErrors((prev) => ({ ...prev, image: undefined }))
  }

  const isSelfPickup = formData.delivery_method === 'self_pickup'
  const maxStep = isSelfPickup ? 2 : 3

  const validateStep = (s: number): boolean => {
    const e: typeof errors = {}
    if (s === 1) {
      if (!formData.full_name.trim()) e.full_name = 'กรุณากรอกชื่อ-นามสกุล'
      if (!formData.student_id.trim()) e.student_id = 'กรุณากรอกรหัสนักศึกษา'
      if (!formData.faculty) e.faculty = 'กรุณาเลือกคณะ'
      if (!formData.major) e.major = 'กรุณาเลือกสาขาวิชา'
      if (!formData.phone.trim()) e.phone = 'กรุณากรอกเบอร์โทรศัพท์'
      else if (!/^[0-9]{9,10}$/.test(formData.phone.replace(/[-\s]/g, ''))) e.phone = 'เบอร์โทรไม่ถูกต้อง (9-10 หลัก)'
    }
    if (s === 2) {
      if (!formData.house_no.trim()) e.house_no = 'กรุณากรอกบ้านเลขที่ / หมู่'
      if (!formData.sub_district.trim()) e.sub_district = 'กรุณากรอกตำบล / แขวง'
      if (!formData.district.trim()) e.district = 'กรุณากรอกอำเภอ / เขต'
      if (!formData.province.trim()) e.province = 'กรุณากรอกจังหวัด'
      const districts = (addresses as Record<string, Record<string, string[]>>)[formData.province]
      if (!districts) e.province = 'กรุณาเลือกจังหวัดจากรายการ'
      if (!districts?.[formData.district]) e.district = 'กรุณาเลือกอำเภอ / เขตจากรายการ'
      if (!districts?.[formData.district]?.includes(formData.sub_district)) e.sub_district = 'กรุณาเลือกตำบล / แขวงจากรายการ'
      if (!imageFiles.some(Boolean)) e.image = 'กรุณาอัปโหลดรูปถ่ายสภาพบ้าน'
    }
    if (s === 3) {
      if (!location) e.location = 'กรุณาระบุพิกัดตำแหน่งบ้านบนแผนที่ (กด "ตำแหน่งของฉัน" หรือแตะบนแผนที่)'
      if (!formData.access_condition) e.access_condition = 'กรุณาเลือกสภาพเส้นทาง'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, maxStep)) }
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    for (const requiredStep of (isSelfPickup ? [1, 2] : [1, 2, 3])) {
      if (!validateStep(requiredStep)) { setStep(requiredStep); return }
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      // ที่อยู่จากฟอร์ม (ใช้ทั้ง delivery และ self_pickup)
      const fullAddress = `บ้านเลขที่/หมู่ ${formData.house_no.trim()} ต.${formData.sub_district.trim()} อ.${formData.district.trim()} จ.${formData.province.trim()}`
      const districtVal = formData.district.trim() || null
      const landmarkVal = formData.landmark.trim() || null

      const { error: schemaError } = await supabase.from('relief_registrations')
        .select('province,sub_district,image_urls,delivery_method').limit(0)
      if (schemaError) throw new Error('ระบบยังไม่พร้อมรับข้อมูล กรุณาติดต่อเจ้าหน้าที่หรือลองใหม่อีกครั้ง')
      const imageUrls: string[] = []
      for (const file of imageFiles) {
        if (!file) continue
        const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[file.type] || 'jpg'
        const fileName = crypto.randomUUID() + '.' + extension
        const { error: uploadError } = await supabase.storage.from('flood-photos').upload(fileName, file, { cacheControl: '3600', upsert: false })
        if (uploadError) throw new Error('อัปโหลดรูปภาพล้มเหลว กรุณาลองอีกครั้ง: ' + uploadError.message)
        const { data: urlData } = supabase.storage.from('flood-photos').getPublicUrl(fileName)
        imageUrls.push(urlData.publicUrl)
      }
      const googleMapsLink = !isSelfPickup && location ? 'https://www.google.com/maps?q=' + location.lat + ',' + location.lng : null
      const accessCond = isSelfPickup ? 'walk' : formData.access_condition

      const insertPayload: Record<string, unknown> = {
        full_name: formData.full_name.trim(),
        student_id: formData.student_id.trim() || null,
        user_type: 'student',
        faculty: formData.faculty,
        major: formData.major,
        phone: formData.phone.trim(),
        line_id: formData.line_id.trim() || null,
        address: fullAddress,
        district: districtVal,
        province: formData.province,
        sub_district: formData.sub_district,
        image_url: imageUrls[0],
        image_urls: imageUrls,
        landmark: landmarkVal,
        google_maps_link: googleMapsLink,
        access_condition: accessCond,
        delivery_method: formData.delivery_method,
        status: 'pending',
      }

      const { data, error: insertError } = await supabase
        .from('relief_registrations')
        .insert(insertPayload)
        .select('id')
        .single()

      if (insertError?.code === 'PGRST204') throw new Error('ระบบยังไม่พร้อมรับข้อมูลรูปภาพและที่อยู่ กรุณาติดต่อเจ้าหน้าที่ให้อัปเดตฐานข้อมูล')
      if (insertError) throw new Error(`บันทึกข้อมูลล้มเหลว: ${insertError.message}`)
      if (!data) throw new Error('ไม่พบข้อมูลผลลัพธ์การลงทะเบียน')

      // Redirect directly to tracking page
      router.push(`/track?id=${data.id}`)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setFormData({
      full_name: '',
      student_id: '',
      phone: '',
      line_id: '',
      faculty: '',
      major: '',
      delivery_method: 'delivery',
      house_no: '',
      sub_district: '',
      district: '',
      province: 'พระนครศรีอยุธยา',
      landmark: '',
      access_condition: '',
    })
    setLocation(null)
    setImageFiles([null, null, null])
    setErrors({})
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  // ── Shared select style ──
  const selectCls = `flex-1 py-3 pr-4 bg-transparent outline-none text-gray-800 text-sm appearance-none cursor-pointer`
  const inputCls = `flex-1 py-3 pr-4 bg-transparent outline-none text-gray-800 text-sm placeholder:text-gray-400`

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Magnificent ARU Hero Banner ── */}
      <HeroBanner />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="h-1.5 bg-gray-200 rounded-full mb-6">
            <div
              className="h-1.5 bg-gradient-to-r from-maroon-700 to-gold-500 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (maxStep - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between">
            {STEPS.map((s) => {
              const Icon = s.icon
              // self_pickup ข้ามเฉพาะ step 3 (ข้อมูลการเดินทาง)
              const isSkipped = isSelfPickup && s.id === 3
              const isActive = step === s.id && !isSkipped
              const isDone = isSkipped ? false : (step > s.id)

              return (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isSkipped
                      ? 'bg-gray-100 text-gray-300 border-2 border-dashed border-gray-200'
                      : isDone
                        ? 'bg-green-500 text-white shadow-md'
                        : isActive
                          ? 'bg-maroon-700 text-white shadow-lg scale-110'
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      }`}
                  >
                    {isSkipped ? (
                      <span className="text-xs font-semibold text-gray-300">-</span>
                    ) : isDone ? (
                      <CheckCircle size={18} />
                    ) : (
                      <Icon size={16} />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${isSkipped
                      ? 'text-gray-300 line-through'
                      : isActive
                        ? 'text-maroon-700 font-bold'
                        : isDone
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                  >
                    {s.title} {isSkipped && '(ข้าม)'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-maroon-50 border-b border-maroon-100 px-6 py-4 flex items-center justify-between">
            <h2 className="font-bold text-maroon-800 text-lg">
              {`ขั้นตอนที่ ${step}: ${STEPS[step - 1].title}`}
            </h2>
            {isSelfPickup && (
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <Building2 size={13} /> รับเองที่กองพัฒน์ฯ
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8">

            {/* ── STEP 1: Student Info ── */}
            {step === 1 && (
              <div className="space-y-5">
                {/* Student badge */}
                <div className="flex items-center gap-3 p-4 bg-maroon-50 border border-maroon-100 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-maroon-700 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-maroon-800 text-sm">นักศึกษา มรภ.พระนครศรีอยุธยา</p>
                    <p className="text-xs text-maroon-500">Phranakhon Si Ayutthaya Rajabhat University</p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <IconInput icon={<User size={16} />} error={errors.full_name}>
                    <input id="full_name" type="text" value={formData.full_name} onChange={(e) => update('full_name', e.target.value)} placeholder="เช่น นายสมชาย ใจดี" className={inputCls} />
                  </IconInput>
                </div>

                {/* Student ID */}
                <div>
                  <label htmlFor="student_id" className="block text-sm font-semibold text-gray-700 mb-2">
                    รหัสนักศึกษา <span className="text-red-500">*</span>
                  </label>
                  <IconInput icon={<Hash size={16} />} error={errors.student_id}>
                    <input
                      id="student_id"
                      type="text"
                      value={formData.student_id}
                      onChange={(e) => update('student_id', e.target.value)}
                      placeholder="เช่น 6514210001"
                      className={inputCls}
                    />
                  </IconInput>
                </div>

                {/* Faculty */}
                <div>
                  <label htmlFor="faculty" className="block text-sm font-semibold text-gray-700 mb-2">
                    คณะ <span className="text-red-500">*</span>
                  </label>
                  <IconInput icon={<BookOpen size={16} />} error={errors.faculty}>
                    <select id="faculty" value={formData.faculty} onChange={(e) => update('faculty', e.target.value)} className={selectCls}>
                      <option value="">— เลือกคณะ —</option>
                      {FACULTIES.map((f) => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </IconInput>
                </div>

                {/* Major */}
                <div>
                  <label htmlFor="major" className="block text-sm font-semibold text-gray-700 mb-2">
                    สาขาวิชา <span className="text-red-500">*</span>
                  </label>
                  <IconInput icon={<GraduationCap size={16} />} error={errors.major}>
                    <select
                      id="major"
                      value={formData.major}
                      onChange={(e) => update('major', e.target.value)}
                      disabled={!formData.faculty}
                      className={`${selectCls} disabled:text-gray-300`}
                    >
                      <option value="">{formData.faculty ? '— เลือกสาขาวิชา —' : '— กรุณาเลือกคณะก่อน —'}</option>
                      {majorList.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </IconInput>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>
                  <IconInput icon={<Phone size={16} />} error={errors.phone}>
                    <input id="phone" type="tel" value={formData.phone} onChange={(e) => update('phone', e.target.value)} placeholder="0812345678" className={inputCls} />
                  </IconInput>
                </div>

                {/* Line ID */}
                <div>
                  <label htmlFor="line_id" className="block text-sm font-semibold text-gray-700 mb-2">
                    Line ID <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                  </label>
                  <IconInput icon={<Hash size={16} />}>
                    <input id="line_id" type="text" value={formData.line_id} onChange={(e) => update('line_id', e.target.value)} placeholder="เช่น somchai_123" className={inputCls} />
                  </IconInput>
                </div>

                {/* ── Delivery Method Choice ── */}
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    ความประสงค์ในการรับมอบสิ่งของช่วยเหลือ <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Delivery */}
                    <div
                      id="choice-delivery"
                      onClick={() => update('delivery_method', 'delivery')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.delivery_method === 'delivery'
                        ? 'border-maroon-600 bg-maroon-50/70 shadow-sm ring-1 ring-maroon-500'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${formData.delivery_method === 'delivery' ? 'bg-maroon-700 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                          <Truck size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-900 text-sm">ประสงค์ให้ลงพื้นที่</p>
                            {formData.delivery_method === 'delivery' && (
                              <CheckCircle size={16} className="text-maroon-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            ทีมงานลงพื้นที่นำของไปส่งให้ถึงที่พัก (ต้องระบุที่อยู่และรูปถ่าย)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Self Pickup */}
                    <div
                      id="choice-self-pickup"
                      onClick={() => update('delivery_method', 'self_pickup')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.delivery_method === 'self_pickup'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${formData.delivery_method === 'self_pickup' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                          <Building2 size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-gray-900 text-sm">ไม่ประสงค์ให้ลงพื้นที่</p>
                            {formData.delivery_method === 'self_pickup' && (
                              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
                            มารับของที่กองพัฒนานักศึกษา
                          </span>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            ต้องกรอกที่อยู่เพื่อเก็บข้อมูล แนบภาพบ้านอย่างน้อย 1 ภาพ โดยไม่ต้องปักหมุดแผนที่
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Helpful banner when self_pickup is chosen */}
                  {formData.delivery_method === 'self_pickup' && (
                    <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in duration-300">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                          <Building2 size={18} />
                        </div>
                        <div className="text-xs space-y-1 flex-1">
                          <p className="font-bold text-sm text-emerald-950">
                            📍 จุดรับสิ่งของช่วยเหลือ: กองพัฒนานักศึกษา มรภ.พระนครศรีอยุธยา
                          </p>
                          <p className="text-emerald-800 leading-relaxed">
                            ท่านสามารถเดินทางมารับสิ่งของช่วยเหลือด้วยตนเองได้ในวันและเวลาทำการ
                          </p>
                          <p className="text-emerald-900 font-semibold pt-1">
                            📋 กรุณากรอกที่อยู่บ้านในขั้นตอนถัดไปเพื่อเก็บข้อมูล (แนบภาพบ้านอย่างน้อย 1 ภาพ โดยไม่ต้องปักหมุดแผนที่)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── STEP 2: Address & Photo ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="bg-maroon-50/60 p-4 rounded-2xl border border-maroon-100">
                  <p className="text-xs font-bold text-maroon-900 mb-1 flex items-center gap-1.5">
                    <Home size={14} className="text-maroon-700" /> ระบุข้อมูลที่อยู่บ้านที่ต้องการความช่วยเหลือ
                  </p>
                  <p className="text-xs text-gray-500">
                    {isSelfPickup
                      ? 'กรุณาระบุที่อยู่และแนบภาพบ้านที่ได้รับความเสียหายอย่างน้อย 1 ภาพ เพื่อประกอบการขอรับความช่วยเหลือ'
                      : 'กรุณากรอกข้อมูลให้ครบถ้วน เพื่อให้ทีมงานจิตอาสาเข้าถึงพื้นที่ได้อย่างแม่นยำ'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* บ้านเลขที่ / หมู่ */}
                  <div>
                    <label htmlFor="house_no" className="block text-sm font-semibold text-gray-700 mb-2">
                      บ้านเลขที่ / หมู่ <span className="text-red-500">*</span>
                    </label>
                    <IconInput icon={<Home size={16} />} error={errors.house_no}>
                      <input
                        id="house_no"
                        type="text"
                        value={formData.house_no}
                        onChange={(e) => update('house_no', e.target.value)}
                        placeholder="เช่น 12/3 หมู่ 4"
                        className={inputCls}
                      />
                    </IconInput>
                  </div>

                  <AddressSelects value={formData} errors={errors} onChange={(address) => {
                    setFormData((prev) => ({ ...prev, ...address }))
                    setErrors((prev) => ({ ...prev, province: undefined, district: undefined, sub_district: undefined }))
                  }} />
                </div>

                <HousePhotos files={imageFiles} onChange={handleImageChange} error={errors.image} />
              </div>
            )}

            {/* ── STEP 3: Field Info + Map ── */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Landmark */}
                <div>
                  <label htmlFor="landmark" className="block text-sm font-semibold text-gray-700 mb-2">
                    จุดสังเกตใกล้เคียง <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                  </label>
                  <IconInput icon={<MapPin size={16} />}>
                    <input id="landmark" type="text" value={formData.landmark} onChange={(e) => update('landmark', e.target.value)} placeholder="เช่น ใกล้วัดสุวรรณดาราราม, ตรงข้ามโรงเรียน..." className={inputCls} />
                  </IconInput>
                </div>

                {/* Interactive Map */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      ปักหมุดตำแหน่งบ้าน / พิกัด GPS <span className="text-red-500">* (จำเป็นต้องระบุ)</span>
                    </label>
                    {location && (
                      <span className="text-xs text-green-700 font-bold flex items-center gap-1 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                        <CheckCircle size={13} className="text-green-600" /> ปักหมุดแล้ว
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    กดปุ่ม <strong>&quot;ตำแหน่งของฉัน&quot;</strong> เพื่อดึงพิกัดจาก GPS อัตโนมัติ หรือคลิกบนแผนที่เพื่อระบุตำแหน่ง
                  </p>
                  <div className={`transition-all ${errors.location ? 'ring-2 ring-red-400 rounded-2xl p-1 bg-red-50/40' : ''}`}>
                    <Suspense fallback={
                      <div className="w-full h-64 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="text-sm">กำลังโหลดแผนที่...</span>
                        </div>
                      </div>
                    }>
                      <LocationPicker
                        value={location}
                        onChange={(loc) => {
                          setLocation(loc)
                          setErrors((p) => ({ ...p, location: undefined }))
                        }}
                      />
                    </Suspense>
                  </div>
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5 font-medium">
                      <AlertCircle size={13} className="flex-shrink-0" /> {errors.location}
                    </p>
                  )}
                </div>

                {/* Access Condition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    สภาพการเข้าถึง <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {ACCESS_CONDITIONS.map((opt) => {
                      const AccIcon = opt.Icon
                      const isSelected = formData.access_condition === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          id={`access_${opt.value}`}
                          onClick={() => update('access_condition', opt.value)}
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all duration-200 ${isSelected ? 'border-maroon-600 bg-maroon-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-maroon-700 text-white' : `bg-white border border-gray-200 ${opt.color}`
                            }`}>
                            <AccIcon size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{opt.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                          </div>
                          {isSelected && <CheckCircle size={18} className="text-maroon-600 flex-shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                  {errors.access_condition && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1.5">
                      <AlertCircle size={12} className="flex-shrink-0" /> {errors.access_condition}
                    </p>
                  )}
                </div>

                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-gray-100 px-6 sm:px-8 py-5 flex justify-between gap-4 bg-gray-50/50">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 active:scale-95'
                }`}
            >
              <ChevronLeft size={18} /> ก่อนหน้า
            </button>

            {isSelfPickup && step === 2 ? (
              <button
                type="button"
                id="submit-register"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> กำลังส่งข้อมูล...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> ยืนยันการลงทะเบียน (รับของที่กองพัฒน์ฯ)
                  </>
                )}
              </button>
            ) : step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-maroon-700 hover:bg-maroon-600 text-white font-semibold text-sm rounded-xl transition-all active:scale-95 shadow-sm"
              >
                ถัดไป <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                id="submit-register"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-maroon-700 to-maroon-800 hover:from-maroon-600 hover:to-maroon-700 text-white font-bold text-sm rounded-xl transition-all active:scale-95 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> กำลังส่ง...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} /> ยืนยันการลงทะเบียน (ส่งของถึงที่พัก)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
