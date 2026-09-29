'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Crosshair, Loader2, ShieldAlert, RefreshCw, AlertCircle } from 'lucide-react'

type LatLng = { lat: number; lng: number }

interface LocationPickerProps {
  value: LatLng | null
  onChange: (latlng: LatLng) => void
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if permission is already denied in browser
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (status.state === 'denied') {
          setPermissionDenied(true)
        }
        status.onchange = () => {
          if (status.state === 'granted') {
            setPermissionDenied(false)
            setError(null)
          } else if (status.state === 'denied') {
            setPermissionDenied(true)
          }
        }
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!mounted || !mapRef.current || leafletMapRef.current) return

    // Dynamic import to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon path issue with Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Default center: Phranakhon Si Ayutthaya
      const defaultCenter: [number, number] = value
        ? [value.lat, value.lng]
        : [14.3567, 100.5705]

      const map = L.map(mapRef.current!, {
        center: defaultCenter,
        zoom: value ? 15 : 13,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Custom maroon pin icon
      const customIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:32px;height:42px;">
            <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:42px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 26 16 26S32 26.5 32 16C32 7.163 24.837 0 16 0z" fill="#900020"/>
              <circle cx="16" cy="16" r="7" fill="white"/>
              <circle cx="16" cy="16" r="4" fill="#900020"/>
            </svg>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      })

      // If initial value, place marker
      if (value) {
        const marker = L.marker([value.lat, value.lng], { icon: customIcon, draggable: true }).addTo(map)
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          onChange({ lat: pos.lat, lng: pos.lng })
        })
        markerRef.current = marker
      }

      // Click to place/move marker
      map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          const marker = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map)
          marker.on('dragend', () => {
            const pos = marker.getLatLng()
            onChange({ lat: pos.lat, lng: pos.lng })
          })
          markerRef.current = marker
        }
        onChange({ lat, lng })
      })

      leafletMapRef.current = map
    })

    return () => {
      leafletMapRef.current?.remove()
      leafletMapRef.current = null
      markerRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('เบราว์เซอร์ของท่านไม่รองรับการระบุตำแหน่ง')
      return
    }
    setLocating(true)
    setError(null)

    // Re-check permission status if supported
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (status.state === 'denied') {
          setPermissionDenied(true)
        }
      }).catch(() => {})
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocating(false)
        setPermissionDenied(false)
        setError(null)

        import('leaflet').then((L) => {
          const map = leafletMapRef.current
          if (!map) return

          const customIcon = L.divIcon({
            className: '',
            html: `
              <div style="position:relative;width:32px;height:42px;">
                <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:32px;height:42px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 26 16 26S32 26.5 32 16C32 7.163 24.837 0 16 0z" fill="#900020"/>
                  <circle cx="16" cy="16" r="7" fill="white"/>
                  <circle cx="16" cy="16" r="4" fill="#900020"/>
                </svg>
              </div>
            `,
            iconSize: [32, 42],
            iconAnchor: [16, 42],
            popupAnchor: [0, -42],
          })

          map.setView([lat, lng], 17)

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng])
          } else {
            const marker = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map)
            marker.on('dragend', () => {
              const p = marker.getLatLng()
              onChange({ lat: p.lat, lng: p.lng })
            })
            markerRef.current = marker
          }
          onChange({ lat, lng })
        })
      },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true)
          setError('เบราว์เซอร์ Chrome บล็อกการเข้าถึงตำแหน่ง')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('ไม่สามารถรับสัญญาณพิกัด GPS ได้ กรุณาแตะเลือกบนแผนที่โดยตรง')
        } else if (err.code === err.TIMEOUT) {
          setError('หมดเวลาค้นหาตำแหน่ง กรุณากดลองใหม่ หรือคลิกบนแผนที่')
        } else {
          setError('ไม่สามารถระบุตำแหน่งได้ กรุณาลองใหม่')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  if (!mounted) {
    return (
      <div className="w-full h-64 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200">
        <Loader2 size={24} className="animate-spin text-maroon-600" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm" style={{ height: 280 }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Geolocate button overlaid on map */}
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={locating}
          className="absolute bottom-3 right-3 z-[1000] flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-maroon-50 border border-maroon-200 text-maroon-700 font-semibold text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-60"
        >
          {locating ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Crosshair size={15} />
          )}
          {locating ? 'กำลังระบุ...' : 'ตำแหน่งของฉัน'}
        </button>
      </div>

      {/* Instruction */}
      <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
        <MapPin size={13} className="text-maroon-600 flex-shrink-0" />
        คลิก/แตะบนแผนที่เพื่อปักหมุด หรือกดปุ่ม &quot;ตำแหน่งของฉัน&quot; เพื่อระบุตำแหน่งอัตโนมัติ
      </p>

      {/* Error without permission denied */}
      {error && !permissionDenied && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle size={14} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chrome Permission Denied Guide Box */}
      {permissionDenied && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow">
              <ShieldAlert size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-amber-950 text-sm">
                เบราว์เซอร์ Chrome บล็อกการเข้าถึงตำแหน่ง (Location Blocked)
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                เนื่องจากมีการกดปฏิเสธสิทธิ์ตำแหน่งไว้ หากต้องการให้ Chrome ขออนุญาตใหม่ กรุณาทำตาม 3 ขั้นตอนนี้:
              </p>
            </div>
          </div>

          <div className="bg-white/90 rounded-xl p-3 border border-amber-200 text-xs text-gray-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs flex-shrink-0">1</span>
              <span>แตะไอคอน <strong>แม่กุญแจ 🔒</strong> หรือ <strong>ตั้งค่าเว็บไซต์ 🎛️</strong> ที่แถบ URL ด้านบนสุดข้างชื่อเว็บ</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs flex-shrink-0">2</span>
              <span>เลือก <strong>&quot;สิทธิ์&quot; / &quot;ตำแหน่ง&quot; (Location)</strong> แล้วเปลี่ยนเป็น <strong>&quot;อนุญาต&quot; (Allow)</strong> หรือกด <strong>&quot;รีเซ็ตสิทธิ์&quot; (Reset permission)</strong></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs flex-shrink-0">3</span>
              <span>กดปุ่ม <strong>&quot;ลองขออนุญาตใหม่อีกครั้ง&quot;</strong> ด้านล่างนี้ หรือแตะเลือกบนแผนที่โดยตรง</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleGeolocate}
              disabled={locating}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold rounded-xl text-xs shadow transition-all disabled:opacity-60"
            >
              <RefreshCw size={13} className={locating ? 'animate-spin' : ''} />
              {locating ? 'กำลังขออนุญาต...' : 'ลองขออนุญาตใหม่อีกครั้ง'}
            </button>
            <span className="text-xs text-amber-800 font-medium">💡 หรือคลิกบนแผนที่ด้านบนเพื่อปักหมุดได้ทันที</span>
          </div>
        </div>
      )}

      {/* Selected coordinates display */}
      {value && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-green-50 border border-green-200 rounded-xl">
          <MapPin size={15} className="text-green-600 flex-shrink-0" />
          <div>
            <span className="text-xs font-bold text-green-800">ปักหมุดแล้ว: </span>
            <span className="text-xs text-green-700 font-mono">
              {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
            </span>
          </div>
          <a
            href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-blue-600 hover:underline font-semibold whitespace-nowrap"
          >
            ตรวจสอบใน Google Maps ↗
          </a>
        </div>
      )}
    </div>
  )
}
