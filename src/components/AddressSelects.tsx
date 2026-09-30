import addresses from '@/data/thai-addresses.json'

const data: Record<string, Record<string, string[]>> = addresses
export type AddressSelection = { province: string; district: string; sub_district: string }

export default function AddressSelects({ value, onChange, errors = {} }: {
  value: AddressSelection
  onChange: (value: AddressSelection) => void
  errors?: Partial<Record<keyof AddressSelection, string>>
}) {
  const fields = [
    { key: 'province' as const, label: 'จังหวัด', options: Object.keys(data), disabled: false },
    { key: 'district' as const, label: 'อำเภอ / เขต', options: Object.keys(data[value.province] || {}), disabled: !value.province },
    { key: 'sub_district' as const, label: 'ตำบล / แขวง', options: data[value.province]?.[value.district] || [], disabled: !value.district },
  ]
  return <>{fields.map(({ key, label, options, disabled }) => (
    <div key={key}>
      <label htmlFor={key} className="mb-2 block text-sm font-semibold text-gray-700">{label} <span className="text-red-500">*</span></label>
      <select id={key} value={value[key]} disabled={disabled} aria-required="true" aria-invalid={!!errors[key]} aria-describedby={errors[key] ? key + '-error' : undefined}
        className="input-field disabled:bg-gray-100 disabled:text-gray-400"
        onChange={(event) => onChange({ ...value, [key]: event.target.value, ...(key === 'province' ? { district: '', sub_district: '' } : key === 'district' ? { sub_district: '' } : {}) })}>
        <option value="">{disabled ? 'กรุณาเลือก' + (key === 'district' ? 'จังหวัด' : 'อำเภอ / เขต') + 'ก่อน' : 'เลือก' + label}</option>
        {options.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>
      {errors[key] && <p id={key + '-error'} className="mt-1.5 text-xs text-red-600">{errors[key]}</p>}
    </div>
  ))}</>
}
