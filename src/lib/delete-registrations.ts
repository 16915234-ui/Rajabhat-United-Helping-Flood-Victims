import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'flood-photos'
type PhotoRecord = { id: string; image_url?: string | null; image_urls?: string[] | null }

// Delete only objects in this project's upload bucket, never external image URLs.
export function photoStoragePaths(records: PhotoRecord[], supabaseUrl: string): string[] {
  const origin = new URL(supabaseUrl).origin
  const paths = new Set<string>()
  for (const record of records) {
    const urls = [record.image_url, ...(Array.isArray(record.image_urls) ? record.image_urls : [])]
    for (const value of urls) {
      if (!value || typeof value !== 'string') continue
      let url: URL
      try { url = new URL(value) } catch { continue }
      if (url.origin !== origin) continue
      const prefix = ['/storage/v1/object/public/', '/storage/v1/object/sign/', '/storage/v1/object/authenticated/']
        .map((base) => base + BUCKET + '/')
        .find((base) => url.pathname.startsWith(base))
      if (!prefix) continue
      const key = decodeURIComponent(url.pathname.slice(prefix.length))
      if (!key || key.split('/').some((segment) => !segment || segment === '.' || segment === '..')) {
        throw new Error('ที่อยู่ไฟล์ภาพไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ')
      }
      paths.add(key)
    }
  }
  return [...paths]
}

export async function deleteRegistrations(client: SupabaseClient, supabaseUrl: string, ids: string[]) {
  // Read before deleting so storage paths are available even when cleanup fails.
  // select('*') also supports legacy tables without image_urls.
  const { data, error: readError } = await client.from('relief_registrations').select('*').in('id', ids)
  if (readError) throw new Error('อ่านข้อมูลก่อนลบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
  const records = (data || []) as PhotoRecord[]
  if (!records.length) return { deletedIds: [] as string[] }
  const paths = photoStoragePaths(records, supabaseUrl)
  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await client.storage.from(BUCKET).remove(paths.slice(index, index + 100))
    if (error) throw new Error('ลบรูปภาพไม่สำเร็จ รายการข้อมูลยังอยู่ กรุณาลองลบซ้ำหรือติดต่อผู้ดูแลระบบ (บางภาพอาจถูกลบแล้ว)')
  }
  // Missing storage objects are safe to remove again on retry.
  const { data: deleted, error: deleteError } = await client.from('relief_registrations')
    .delete().in('id', records.map((record) => record.id)).select('id')
  if (deleteError) throw new Error('ลบรูปภาพแล้ว แต่ลบรายการข้อมูลไม่สำเร็จ กรุณาลองลบซ้ำ')
  if (deleted?.length !== records.length) throw new Error('ลบรายการได้ไม่ครบ กรุณารีเฟรชและลองลบรายการที่เหลืออีกครั้ง')
  return { deletedIds: (deleted || []).map((record: { id: string }) => record.id) }
}
