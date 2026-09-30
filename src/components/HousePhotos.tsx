'use client'

import { useEffect, useRef, useState } from 'react'

export default function HousePhotos({ files, onChange, error }: {
  files: (File | null)[]
  onChange: (index: number, file: File | null) => void
  error?: string
}) {
  return <fieldset>
    <legend className="mb-1 text-sm font-semibold text-gray-700">รูปถ่ายสภาพบ้านที่ได้รับความเสียหาย <span className="text-red-500">*</span></legend>
    <p className="mb-3 text-xs text-gray-500">แนบอย่างน้อย 1 ภาพ สูงสุด 3 ภาพ ทั้งกรณีลงพื้นที่และรับเอง • JPG, PNG, WebP ภาพละไม่เกิน 10MB</p>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {files.map((file, index) => <PhotoSlot key={index} file={file} index={index} onChange={onChange} />)}
    </div>
    {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
  </fieldset>
}

function PhotoSlot({ file, index, onChange }: { file: File | null; index: number; onChange: (index: number, file: File | null) => void }) {
  const input = useRef<HTMLInputElement>(null)
  return <div className="rounded-2xl border border-maroon-100 bg-maroon-50/30 p-3">
    <label htmlFor={'house-photo-' + index} className="mb-2 block text-sm font-semibold text-maroon-800">ภาพที่ {index + 1}</label>
    <input ref={input} id={'house-photo-' + index} type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-maroon-700 file:px-3 file:py-2 file:text-white"
      onChange={(event) => { const selected = event.target.files?.[0]; if (selected) onChange(index, selected); event.target.value = '' }} />
    {file && <>
      <PhotoPreview file={file} index={index} />
      <p className="mt-2 truncate text-xs text-gray-600" title={file.name}>{file.name}</p>
      <button type="button" className="mt-2 text-xs font-semibold text-red-700 underline" onClick={() => { onChange(index, null); if (input.current) input.current.value = '' }}>ลบภาพที่ {index + 1}</button>
    </>}
  </div>
}

function PhotoPreview({ file, index }: { file: File; index: number }) {
  const [url, setUrl] = useState('')
  useEffect(() => { const next = URL.createObjectURL(file); setUrl(next); return () => URL.revokeObjectURL(next) }, [file])
  // User-selected local files cannot be optimized by the server.
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt={'ตัวอย่างภาพบ้านที่ ' + (index + 1)} className="mt-3 h-36 w-full rounded-lg object-cover" /> : null
}
