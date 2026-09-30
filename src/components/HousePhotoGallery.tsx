import { registrationPhotos } from '@/lib/registration-details'
import type { ReliefRegistration } from '@/lib/supabase'

export default function HousePhotoGallery({ record }: { record: ReliefRegistration }) {
  const photos = registrationPhotos(record)
  if (!photos.length) return null
  return <section className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
    <h3 className="mb-3 text-sm font-semibold text-gray-700">รูปถ่ายสภาพบ้านและความเสียหาย ({photos.length} ภาพ)</h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {photos.map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block" aria-label={'เปิดภาพบ้านที่ ' + (index + 1)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={'สภาพบ้านที่ได้รับความเสียหาย ภาพที่ ' + (index + 1)} className="h-36 w-full rounded-xl object-cover" />
      </a>)}
    </div>
  </section>
}
