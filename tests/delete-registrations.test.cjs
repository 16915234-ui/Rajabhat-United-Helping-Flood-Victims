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
const { photoStoragePaths, deleteRegistrations } = load('src/lib/delete-registrations.ts')
const origin = 'https://example.supabase.co'
const image = (key) => origin + '/storage/v1/object/public/flood-photos/' + key
function mock(records, options = {}) {
  const calls = []
  let removing = false
  const query = {
    select() { return query },
    delete() { removing = true; return query },
    in(_, ids) {
      if (removing) {
        calls.push({ action: 'delete', ids })
        return { select: async () => ({ data: options.noDeletedRows ? [] : records.map(({ id }) => ({ id })), error: options.deleteError || null }) }
      }
      calls.push({ action: 'read', ids })
      return Promise.resolve({ data: records, error: options.readError || null })
    },
  }
  return { calls, client: {
    from(table) { assert.equal(table, 'relief_registrations'); return query },
    storage: { from(bucket) { assert.equal(bucket, 'flood-photos'); return { async remove(paths) {
      calls.push({ action: 'storage', paths })
      return { data: [], error: options.storageError || null }
    } } } },
  } }
}
test('combines legacy and all new photos, deduplicates, decodes names, skips external buckets', () => {
  const records = [{ id: 'one', image_url: image('one.jpg'), image_urls: [image('one.jpg'), image('folder/two%20photo.jpg'), image('three.webp'), 'https://other.supabase.co/storage/v1/object/public/flood-photos/no.jpg', origin + '/storage/v1/object/public/other/no.jpg', 'https://images.unsplash.com/example'] }]
  assert.deepEqual(photoStoragePaths(records, origin), ['one.jpg', 'folder/two photo.jpg', 'three.webp'])
  assert.deepEqual(photoStoragePaths([{ id: 'one', image_url: origin + '/storage/v1/object/sign/flood-photos/signed.jpg?token=test' }], origin), ['signed.jpg'])
})
test('single legacy record removes storage before deleting the database row', async () => {
  const { client, calls } = mock([{ id: 'one', image_url: image('one.jpg') }])
  assert.deepEqual(await deleteRegistrations(client, origin, ['one']), { deletedIds: ['one'] })
  assert.deepEqual(calls.map((call) => call.action), ['read', 'storage', 'delete'])
  assert.deepEqual(calls[1].paths, ['one.jpg'])
})
test('bulk cleanup removes all three photos including self-pickup', async () => {
  const { client, calls } = mock([{ id: 'one', image_url: image('one.jpg'), image_urls: [image('one.jpg'), image('two.jpg'), image('three.jpg')], delivery_method: 'self_pickup' }, { id: 'two', image_url: image('four.jpg') }])
  await deleteRegistrations(client, origin, ['one', 'two'])
  assert.deepEqual(calls[1].paths, ['one.jpg', 'two.jpg', 'three.jpg', 'four.jpg'])
  assert.deepEqual(calls[2].ids, ['one', 'two'])
})
test('storage errors preserve database records and return a failure', async () => {
  const { client, calls } = mock([{ id: 'one', image_url: image('one.jpg') }], { storageError: { message: 'Denied' } })
  await assert.rejects(deleteRegistrations(client, origin, ['one']), /ลบรูปภาพไม่สำเร็จ/)
  assert.ok(!calls.some((call) => call.action === 'delete'))
})
test('database errors after cleanup are explicit and retry is possible when images are already gone', async () => {
  const records = [{ id: 'one', image_url: image('one.jpg') }]
  await assert.rejects(deleteRegistrations(mock(records, { deleteError: { message: 'Unavailable' } }).client, origin, ['one']), /ลองลบซ้ำ/)
  assert.deepEqual(await deleteRegistrations(mock(records).client, origin, ['one']), { deletedIds: ['one'] })
})
test('read failure never deletes anything; an already deleted record is an idempotent success', async () => {
  const failed = mock([], { readError: { message: 'Unavailable' } })
  await assert.rejects(deleteRegistrations(failed.client, origin, ['one']), /อ่านข้อมูล/)
  assert.equal(failed.calls.length, 1)
  const empty = mock([])
  assert.deepEqual(await deleteRegistrations(empty.client, origin, ['missing']), { deletedIds: [] })
  assert.equal(empty.calls.length, 1)
})
test('large selections split storage removal into bounded batches', async () => {
  const records = Array.from({ length: 205 }, (_, index) => ({ id: String(index), image_url: image(index + '.jpg') }))
  const { client, calls } = mock(records)
  await deleteRegistrations(client, origin, records.map(({ id }) => id))
  assert.deepEqual(calls.filter((call) => call.action === 'storage').map((call) => call.paths.length), [100, 100, 5])
  assert.equal(calls.at(-1).action, 'delete')
})
test('does not claim success if the database deleted no selected rows', async () => {
  const { client } = mock([{ id: 'one', image_url: image('one.jpg') }], { noDeletedRows: true })
  await assert.rejects(deleteRegistrations(client, origin, ['one']), /ลบรายการได้ไม่ครบ/)
})
