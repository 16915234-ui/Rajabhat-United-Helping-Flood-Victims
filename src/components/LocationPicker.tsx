'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Crosshair, Loader2 } from 'lucide-react'

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setLocating(false)

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
          setError('ไม่ได้รับอนุญาตให้เข้าถึงตำแหน่ง กรุณาอนุญาตในเบราว์เซอร์')
        } else {
          setError('ไม่สามารถระบุตำแหน่งได้ กรุณาลองใหม่')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
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
      <p className="text-xs text-gray-400 flex items-center gap-1.5">
        <MapPin size={12} className="text-maroon-500 flex-shrink-0" />
        คลิกบนแผนที่เพื่อปักหมุด หรือลากหมุดเพื่อปรับตำแหน่ง
      </p>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1.5">
          <span>⚠️</span> {error}
        </p>
      )}

      {/* Selected coordinates display */}
      {value && (
        <div className="flex items-center gap-2 px-3 py-2 bg-maroon-50 border border-maroon-100 rounded-xl">
          <MapPin size={14} className="text-maroon-600 flex-shrink-0" />
          <span className="text-xs text-maroon-700 font-mono">
            {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </span>
          <a
            href={`https://www.google.com/maps?q=${value.lat},${value.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-blue-600 hover:underline font-medium whitespace-nowrap"
          >
            เปิด Maps ↗
          </a>
        </div>
      )}
    </div>
  )
}
