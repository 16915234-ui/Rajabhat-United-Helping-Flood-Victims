import type { ReliefRegistration } from './supabase'

export function registrationArea(record: Pick<ReliefRegistration, 'address' | 'district' | 'province' | 'sub_district'>) {
  return {
    province: record.province || record.address?.match(/จ\.(.+)$/)?.[1]?.trim() || '',
    district: record.district === 'กองพัฒนานักศึกษา' ? '' : (record.district || record.address?.match(/อ\.(.+?)\s+จ\./)?.[1]?.trim() || ''),
    sub_district: record.sub_district || record.address?.match(/ต\.(.+?)\s+อ\./)?.[1]?.trim() || '',
  }
}

export function registrationPhotos(record: Pick<ReliefRegistration, 'image_url' | 'image_urls'>) {
  const urls = record.image_urls?.length ? record.image_urls : [record.image_url]
  return [...new Set(urls.filter((url): url is string => Boolean(url) && !url.includes('images.unsplash.com/photo-1541829070764-84a7d30dd3f3')))].slice(0, 3)
}

export function matchesArea(record: Parameters<typeof registrationArea>[0], filters: { province: string; district: string; sub_district: string }) {
  const area = registrationArea(record)
  return (!filters.province || area.province === filters.province) &&
    (!filters.district || area.district === filters.district) &&
    (!filters.sub_district || area.sub_district === filters.sub_district)
}
