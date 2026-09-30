const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { createRequire } = require('node:module')
const root = path.resolve(__dirname, '..')
function load(relative) {
  const filename = path.join(root, relative)
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const module = { exports: {} }
  const requireLocal = createRequire(filename)
  new Function('require', 'module', 'exports', code)((name) => name.startsWith('@/data/') ? require(path.join(root, 'src', name.slice(2))) : requireLocal(name), module, module.exports)
  return module.exports
}
const { registrationArea, registrationPhotos, matchesArea } = load('src/lib/registration-details.ts')
const legacy = { address: 'บ้านเลขที่/หมู่ 12 ต.ประตูชัย อ.พระนครศรีอยุธยา จ.พระนครศรีอยุธยา', district: 'พระนครศรีอยุธยา', image_url: 'https://example.com/old.jpg' }
test('legacy addresses remain filterable without guessing missing locations', () => {
  assert.deepEqual(registrationArea(legacy), { province: 'พระนครศรีอยุธยา', district: 'พระนครศรีอยุธยา', sub_district: 'ประตูชัย' })
  assert.deepEqual(registrationArea({ address: 'รับเองที่กองพัฒนานักศึกษา', district: 'กองพัฒนานักศึกษา' }), { province: '', district: '', sub_district: '' })
})
test('all three area filters intersect and clearing them includes every row', () => {
  const filters = { province: 'พระนครศรีอยุธยา', district: 'พระนครศรีอยุธยา', sub_district: 'ประตูชัย' }
  assert.equal(matchesArea(legacy, filters), true)
  for (const key of Object.keys(filters)) assert.equal(matchesArea(legacy, { ...filters, [key]: 'ไม่ตรงกัน' }), false)
  assert.equal(matchesArea(legacy, { province: '', district: '', sub_district: '' }), true)
})
test('photo gallery supports old single images and new three-image pickup evidence', () => {
  assert.deepEqual(registrationPhotos(legacy), ['https://example.com/old.jpg'])
  assert.deepEqual(registrationPhotos({ image_urls: ['a', 'b', 'c'], image_url: 'a', delivery_method: 'self_pickup' }), ['a', 'b', 'c'])
  assert.deepEqual(registrationPhotos({ image_urls: [], image_url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?x=1' }), [])
})
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
test('address dropdowns cover all provinces and Ayutthaya; dependent options use only their parent', () => {
  const data = require('../src/data/thai-addresses.json')
  assert.equal(Object.keys(data).length, 77)
  assert.equal(Object.keys(data['พระนครศรีอยุธยา']).length, 16)
  assert.ok(data['พระนครศรีอยุธยา']['พระนครศรีอยุธยา'].includes('ประตูชัย'))
  const Component = load('src/components/AddressSelects.tsx').default
  const html = renderToStaticMarkup(React.createElement(Component, { value: { province: 'พระนครศรีอยุธยา', district: '', sub_district: '' }, onChange() {} }))
  assert.equal((html.match(/<select/g) || []).length, 3)
  assert.match(html, /selected="">พระนครศรีอยุธยา/)
  assert.match(html, /id="sub_district"[^>]*disabled/)
})
test('photo uploader renders three separately labeled file inputs without multi-select', () => {
  const Component = load('src/components/HousePhotos.tsx').default
  const html = renderToStaticMarkup(React.createElement(Component, { files: [null, null, null], onChange() {} }))
  assert.equal((html.match(/type="file"/g) || []).length, 3)
  assert.ok(!html.includes('multiple'))
  for (let i = 0; i < 3; i++) assert.ok(html.includes('id="house-photo-' + i + '"'))
})
