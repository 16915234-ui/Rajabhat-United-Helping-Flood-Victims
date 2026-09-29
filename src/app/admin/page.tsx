'use client'

import { useState, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { supabase, ReliefRegistration } from '@/lib/supabase'
import {
  Search, Filter, RefreshCw, X, Eye, MapPin, Phone, User, Clock,
  CheckCircle, Loader2, Lock, ExternalLink, Truck, Waves, AlertCircle,
  ChevronDown, Users, TrendingUp, Hash, Trash2, Download, CheckSquare,
  Square, MinusSquare, GraduationCap, BookOpen, ArrowLeftRight, Ship, Car,
} from 'lucide-react'

// ── Constants ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { label: 'รอดำเนินการ',    color: 'badge-pending',     dot: 'bg-yellow-400', bg: 'bg-yellow-50',  text: 'text-yellow-700' },
  in_progress: { label: 'กำลังดำเนินการ', color: 'badge-in_progress', dot: 'bg-blue-400',   bg: 'bg-blue-50',    text: 'text-blue-700'   },
  completed:   { label: 'เสร็จสิ้น',      color: 'badge-completed',   dot: 'bg-green-400',  bg: 'bg-green-50',   text: 'text-green-700'  },
}
const ALL_STATUSES = ['pending', 'in_progress', 'completed'] as const
type Status = ReliefRegistration['status']

const ACCESS_LABELS: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
  car:    { label: 'รถยนต์',      Icon: Car,   color: 'text-slate-500'  },
  pickup: { label: 'รถกระบะยกสูง', Icon: Truck, color: 'text-orange-500' },
  boat:   { label: 'เรือเท่านั้น', Icon: Ship,  color: 'text-blue-500'   },
}

// ── Excel Export ─────────────────────────────────────────────────────────
function exportToExcel(records: ReliefRegistration[]) {
  const rows = records.map((r, i) => ({
    'ลำดับ': i + 1,
    'รหัสเคส': r.id.slice(0, 8).toUpperCase(),
    'รหัสนักศึกษา': (r as any).student_id ?? '-',
    'ชื่อ-นามสกุล': r.full_name,
    'คณะ': (r as any).faculty ?? '-',
    'สาขา': (r as any).major ?? '-',
    'เบอร์โทร': r.phone,
    'Line ID': r.line_id ?? '-',
    'ที่อยู่': r.address,
    'อำเภอ': r.district ?? '-',
    'จุดสังเกต': r.landmark ?? '-',
    'Google Maps': r.google_maps_link ?? '-',
    'สภาพเส้นทาง': ACCESS_LABELS[r.access_condition]?.label ?? r.access_condition,
    'สถานะ': STATUS_CONFIG[r.status]?.label ?? r.status,
    'วันที่ลงทะเบียน': new Date(r.created_at).toLocaleString('th-TH'),
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  // Column widths
  ws['!cols'] = [
    { wch: 6 }, { wch: 10 }, { wch: 16 }, { wch: 22 }, { wch: 28 }, { wch: 40 },
    { wch: 14 }, { wch: 16 }, { wch: 40 }, { wch: 18 }, { wch: 24 },
    { wch: 40 }, { wch: 16 }, { wch: 16 }, { wch: 22 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'ข้อมูลผู้ลงทะเบียน')
  XLSX.writeFile(wb, `flood-relief-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// ── Status Selector ───────────────────────────────────────────────────────
function StatusSelector({
  current,
  onChange,
  loading,
}: {
  current: Status
  onChange: (s: Status) => void
  loading: boolean
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">เปลี่ยนสถานะ</p>
      <div className="flex gap-2 flex-wrap">
        {ALL_STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s]
          const isActive = current === s
          return (
            <button
              key={s}
              disabled={loading || isActive}
              onClick={() => onChange(s)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                ${isActive
                  ? `${cfg.bg} ${cfg.text} border-current opacity-100 cursor-default ring-2 ring-offset-1 ring-current`
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white hover:bg-gray-50 opacity-80'
                }`}
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
              {cfg.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Detail Modal ──────────────────────────────────────────────────────────
function DetailModal({
  record,
  onClose,
  onStatusChange,
  onDelete,
}: {
  record: ReliefRegistration
  onClose: () => void
  onStatusChange: (id: string, status: Status) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [current, setCurrent] = useState<Status>(record.status)
  const access = ACCESS_LABELS[record.access_condition]
  const AccessIcon = access?.Icon ?? Truck

  const handleStatusChange = async (s: Status) => {
    setUpdating(true)
    await onStatusChange(record.id, s)
    setCurrent(s)
    setUpdating(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(record.id)
    setDeleting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{record.full_name}</h2>
            <p className="text-xs text-gray-400 font-mono">{record.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status + Date */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_CONFIG[current].color}`}>
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[current].dot}`} />
              {STATUS_CONFIG[current].label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(record.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* House Photo */}
          {record.image_url && (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <img src={record.image_url} alt="สภาพบ้าน" className="w-full h-52 object-cover" />
              <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 flex items-center gap-1">
                <Waves size={12} /> รูปถ่ายสภาพบ้าน
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4">
            <InfoRow icon={<GraduationCap size={14} className="text-maroon-600" />} label="ประเภท"
              value={(record as any).faculty ? '🎓 นักศึกษา' : record.user_type === 'student' ? '🎓 นักศึกษา' : '🏘️ ประชาชน'} />
            {record.student_id && (
              <InfoRow icon={<Hash size={14} className="text-maroon-600" />} label="รหัสนักศึกษา"
                value={<span className="font-mono text-maroon-800 font-bold">{record.student_id}</span>} />
            )}
            <InfoRow icon={<Phone size={14} className="text-green-600" />} label="โทรศัพท์"
              value={<a href={`tel:${record.phone}`} className="text-maroon-700 hover:underline font-mono">{record.phone}</a>} />
            {(record as any).faculty && (
              <InfoRow icon={<BookOpen size={14} className="text-blue-600" />} label="คณะ" value={(record as any).faculty} />
            )}
            {(record as any).major && (
              <InfoRow icon={<GraduationCap size={14} className="text-purple-600" />} label="สาขา" value={(record as any).major} />
            )}
            {record.line_id && (
              <InfoRow icon={<Hash size={14} className="text-green-500" />} label="Line ID" value={record.line_id} />
            )}
            <InfoRow
              icon={<AccessIcon size={14} className={access?.color ?? 'text-gray-500'} />}
              label="การเข้าถึง"
              value={access?.label ?? record.access_condition}
            />
          </div>

          {/* Address */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1"><MapPin size={12} /> ที่อยู่</p>
            <p className="text-sm text-gray-800 leading-relaxed">{record.address}</p>
            {record.district && <p className="text-xs text-gray-500 mt-1">อำเภอ: {record.district}</p>}
          </div>

          {record.landmark && (
            <div className="bg-gold-50 rounded-xl p-4 border border-gold-100">
              <p className="text-xs font-semibold text-gold-700 mb-1">📍 จุดสังเกต</p>
              <p className="text-sm text-gray-800">{record.landmark}</p>
            </div>
          )}

          {/* Maps Button */}
          {record.google_maps_link ? (
            <a href={record.google_maps_link} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm">
              <MapPin size={16} /> เปิด Google Maps <ExternalLink size={14} />
            </a>
          ) : (
            <div className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-400 font-semibold rounded-xl text-sm">
              <MapPin size={16} /> ไม่มีข้อมูลพิกัด
            </div>
          )}

          {/* Status Selector (all directions) */}
          <StatusSelector current={current} onChange={handleStatusChange} loading={updating} />

          {/* Delete */}
          <div className="border-t border-red-100 pt-4">
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl text-sm font-semibold transition-colors w-full justify-center">
                <Trash2 size={15} /> ลบข้อมูลรายการนี้
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-3 text-center">⚠️ ยืนยันการลบ? ไม่สามารถกู้คืนได้</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                    ยกเลิก
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    ลบถาวร
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">{icon} {label}</p>
      <div className="text-sm font-semibold text-gray-800 break-words">{value}</div>
    </div>
  )
}

// ── Bulk Action Bar ───────────────────────────────────────────────────────
function BulkBar({
  count,
  onDelete,
  onStatusChange,
  onExport,
  onClear,
  loading,
}: {
  count: number
  onDelete: () => void
  onStatusChange: (s: Status) => void
  onExport: () => void
  onClear: () => void
  loading: boolean
}) {
  const [showStatus, setShowStatus] = useState(false)
  return (
    <div className="bg-maroon-900 text-white px-4 py-3 rounded-2xl flex flex-wrap items-center gap-3 shadow-lg">
      <span className="font-bold text-sm bg-white/20 px-3 py-1 rounded-full">{count} รายการ</span>
      <span className="text-white/60 text-sm hidden sm:block">ที่เลือกไว้</span>
      <div className="flex-1" />
      <div className="flex flex-wrap gap-2">
        {/* Status change */}
        <div className="relative">
          <button onClick={() => setShowStatus(!showStatus)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-semibold transition-colors">
            <ArrowLeftRight size={14} /> เปลี่ยนสถานะ <ChevronDown size={13} />
          </button>
          {showStatus && (
            <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[180px] z-20">
              {ALL_STATUSES.map((s) => (
                <button key={s} onClick={() => { onStatusChange(s); setShowStatus(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors text-left">
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-semibold transition-colors">
          <Download size={14} /> Export
        </button>
        <button onClick={onDelete} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-400 rounded-xl text-sm font-bold transition-colors disabled:opacity-70">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} ลบ
        </button>
        <button onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors">
          <X size={14} /> ยกเลิก
        </button>
      </div>
    </div>
  )
}

// ── Login Screen ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async () => {
    if (!pw.trim()) {
      setError('กรุณากรอกรหัสผ่าน')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        onLogin()
      } else {
        setError(data.message || 'รหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon-950 via-maroon-900 to-maroon-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-maroon-700 to-maroon-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">ราชภัฏร่วมใจ ช่วยภัยน้ำท่วม</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">รหัสผ่าน</label>
            <input
              id="admin-password"
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && !submitting && handleLogin()}
              placeholder="กรอกรหัสผ่าน"
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-maroon-500 ${error ? 'border-red-400' : 'border-gray-200'}`}
            />
            {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} /> {error}</p>}
          </div>
          <button
            id="admin-login-btn"
            onClick={handleLogin}
            disabled={submitting}
            className="w-full py-3 bg-maroon-700 hover:bg-maroon-600 disabled:opacity-70 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Admin Page ───────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [records, setRecords] = useState<ReliefRegistration[]>([])
  const [loading, setLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<ReliefRegistration | null>(null)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  // Verify session with server on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/verify')
        const data = await res.json()
        if (data.authed) {
          setAuthed(true)
        } else {
          setAuthed(false)
        }
      } catch {
        setAuthed(false)
      } finally {
        setSessionChecked(true)
      }
    }
    checkAuth()
  }, [])

  const handleLoginSuccess = () => {
    setAuthed(true)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch (_) {}
    setAuthed(false)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('relief_registrations').select('*').order('created_at', { ascending: false })
    if (!error && data) setRecords(data as ReliefRegistration[])
    setLoading(false)
  }, [])

  useEffect(() => { if (authed) fetchData() }, [authed, fetchData])

  // ── Filtering ──
  const filtered = records.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || r.full_name.toLowerCase().includes(q) ||
      (r.student_id?.toLowerCase().includes(q) ?? false) ||
      (r.district?.toLowerCase().includes(q) ?? false) || r.phone.includes(q) ||
      ((r as any).faculty?.toLowerCase().includes(q) ?? false)
    return matchStatus && matchSearch
  })

  // ── Stats ──
  const stats = {
    total: records.length,
    pending: records.filter((r) => r.status === 'pending').length,
    in_progress: records.filter((r) => r.status === 'in_progress').length,
    completed: records.filter((r) => r.status === 'completed').length,
  }

  // ── Single status change ──
  const handleStatusChange = async (id: string, status: Status) => {
    await supabase.from('relief_registrations').update({ status }).eq('id', id)
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null)
  }

  // ── Single delete ──
  const handleDelete = async (id: string) => {
    await supabase.from('relief_registrations').delete().eq('id', id)
    setRecords((prev) => prev.filter((r) => r.id !== id))
    setCheckedIds((prev) => { const n = new Set(prev); n.delete(id); return n })
  }

  // ── Bulk operations ──
  const bulkDelete = async () => {
    if (!checkedIds.size) return
    setBulkLoading(true)
    const ids = [...checkedIds]
    await supabase.from('relief_registrations').delete().in('id', ids)
    setRecords((prev) => prev.filter((r) => !checkedIds.has(r.id)))
    setCheckedIds(new Set())
    setBulkLoading(false)
  }

  const bulkStatusChange = async (status: Status) => {
    if (!checkedIds.size) return
    setBulkLoading(true)
    const ids = [...checkedIds]
    await supabase.from('relief_registrations').update({ status }).in('id', ids)
    setRecords((prev) => prev.map((r) => checkedIds.has(r.id) ? { ...r, status } : r))
    setCheckedIds(new Set())
    setBulkLoading(false)
  }

  const bulkExport = () => {
    const toExport = records.filter((r) => checkedIds.has(r.id))
    exportToExcel(toExport)
  }

  // ── Checkbox helpers ──
  const allFilteredChecked = filtered.length > 0 && filtered.every((r) => checkedIds.has(r.id))
  const someChecked = filtered.some((r) => checkedIds.has(r.id))

  const toggleAll = () => {
    if (allFilteredChecked) {
      setCheckedIds((prev) => { const n = new Set(prev); filtered.forEach((r) => n.delete(r.id)); return n })
    } else {
      setCheckedIds((prev) => { const n = new Set(prev); filtered.forEach((r) => n.add(r.id)); return n })
    }
  }

  const toggleOne = (id: string) => {
    setCheckedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-maroon-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-white" />
      </div>
    )
  }

  if (!authed) return <LoginScreen onLogin={handleLoginSuccess} />

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-maroon-900 to-maroon-800 text-white px-4 sm:px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">Admin Dashboard</h1>
            <p className="text-white/60 text-xs">ราชภัฏร่วมใจ ช่วยภัยน้ำท่วม — จัดการเคสผู้ประสบภัย</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportToExcel(filtered)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-semibold transition-colors">
              <Download size={14} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-sm font-medium transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors">
              <Lock size={14} />
              <span className="hidden sm:inline">ออก</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'ทั้งหมด',         value: stats.total,       icon: Users,        color: 'text-gray-700',   bg: 'bg-white'      },
            { label: 'รอดำเนินการ',     value: stats.pending,     icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50'  },
            { label: 'กำลังดำเนินการ',  value: stats.in_progress, icon: TrendingUp,   color: 'text-blue-600',   bg: 'bg-blue-50'    },
            { label: 'เสร็จสิ้น',       value: stats.completed,   icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50'   },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5 shadow-sm border border-white/80`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <s.icon size={24} className={`${s.color} opacity-30`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Bar */}
        {checkedIds.size > 0 && (
          <BulkBar
            count={checkedIds.size}
            onDelete={bulkDelete}
            onStatusChange={bulkStatusChange}
            onExport={bulkExport}
            onClear={() => setCheckedIds(new Set())}
            loading={bulkLoading}
          />
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input id="admin-search" type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, รหัสนักศึกษา, คณะ, อำเภอ, เบอร์โทร..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent" />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select id="admin-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-maroon-500 appearance-none min-w-[160px] cursor-pointer bg-white">
              <option value="all">ทุกสถานะ</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="in_progress">กำลังดำเนินการ</option>
              <option value="completed">เสร็จสิ้น</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
              <span>กำลังโหลดข้อมูล...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <Waves size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">ไม่พบข้อมูล</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {/* Select All */}
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleAll} className="text-gray-400 hover:text-maroon-700 transition-colors">
                        {allFilteredChecked
                          ? <CheckSquare size={18} className="text-maroon-700" />
                          : someChecked
                          ? <MinusSquare size={18} className="text-maroon-500" />
                          : <Square size={18} />}
                      </button>
                    </th>
                    {['#', 'ชื่อ-นามสกุล', 'รหัสนักศึกษา', 'คณะ / สาขา', 'โทรศัพท์', 'อำเภอ', 'เส้นทาง', 'สถานะ', 'แผนที่', 'วันที่', ''].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((r, idx) => {
                    const isChecked = checkedIds.has(r.id)
                    const access = ACCESS_LABELS[r.access_condition]
                    const AccIcon = access?.Icon ?? Truck
                    return (
                      <tr key={r.id} className={`transition-colors cursor-pointer ${isChecked ? 'bg-maroon-50' : 'hover:bg-gray-50/60'}`}
                        onClick={() => setSelected(r)}>
                        {/* Checkbox */}
                        <td className="px-4 py-3 w-10" onClick={(e) => { e.stopPropagation(); toggleOne(r.id) }}>
                          {isChecked
                            ? <CheckSquare size={17} className="text-maroon-700" />
                            : <Square size={17} className="text-gray-300 hover:text-gray-400" />}
                        </td>
                        <td className="px-3 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-gray-900 whitespace-nowrap">{r.full_name}</p>
                          <p className="text-xs text-gray-400 font-mono">{r.id.slice(0, 8).toUpperCase()}</p>
                        </td>
                        <td className="px-3 py-3">
                          {r.student_id ? (
                            <span className="font-mono text-xs font-semibold text-maroon-700 bg-maroon-50 px-2 py-0.5 rounded-md border border-maroon-100 whitespace-nowrap">
                              {r.student_id}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {(r as any).faculty ? (
                            <>
                              <p className="text-xs text-gray-700 font-medium whitespace-nowrap max-w-[160px] truncate">{(r as any).faculty}</p>
                              <p className="text-xs text-gray-400 max-w-[160px] truncate">{(r as any).major ?? ''}</p>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <a href={`tel:${r.phone}`} className="text-maroon-700 hover:underline font-mono text-xs whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}>{r.phone}</a>
                        </td>
                        <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{r.district || '-'}</td>
                        <td className="px-3 py-3">
                          <span className={`flex items-center gap-1 text-xs font-medium ${access?.color ?? 'text-gray-500'}`}>
                            <AccIcon size={13} /> {access?.label ?? r.access_condition}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_CONFIG[r.status].color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[r.status].dot}`} />
                            {STATUS_CONFIG[r.status].label}
                          </span>
                        </td>
                        {/* Maps quick-open */}
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          {r.google_maps_link ? (
                            <a href={r.google_maps_link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors">
                              <MapPin size={12} /> เปิด
                            </a>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-3 py-3">
                          <button className="p-1.5 rounded-lg hover:bg-maroon-100 text-maroon-600 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setSelected(r) }} title="ดูรายละเอียด">
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between text-xs text-gray-400">
              <span>แสดง {filtered.length} จาก {records.length} รายการ</span>
              {checkedIds.size > 0 && (
                <span className="text-maroon-600 font-semibold">เลือกแล้ว {checkedIds.size} รายการ</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          record={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
