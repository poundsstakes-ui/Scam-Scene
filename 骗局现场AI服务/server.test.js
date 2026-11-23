const assert = require('assert')
const { createServer } = require('./server')
async function main() {
  let release
  const gate = new Promise(resolve => { release = resolve })
  let started = 0
  const provider = async () => { started++; await gate; return '请独立核验已公开的线索。' }
  const server = createServer({ provider, maxConcurrent: 2 })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const url = `http://127.0.0.1:${port}/api/host`
  const post = body => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const payload = { caseId: 2, phase: 'discussion', clueIds: [0] }
  try {
    const first = post(payload), second = post(payload)
    const deadline = Date.now() + 3000
    while (started < 2 && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 10))
    assert.strictEqual(started, 2)
    const busy = await post(payload)
    assert.strictEqual(busy.status, 503)
    release()
    assert.strictEqual((await first).status, 200)
    assert.strictEqual((await second).status, 200)
    const bad = await post({ ...payload, privateClue: '应拒绝' })
    assert.strictEqual(bad.status, 400)
    const oversized = await post({ ...payload, extra: 'x'.repeat(6000) })
    assert.strictEqual(oversized.status, 413, '过长请求必须明确拒绝')
    const after = await post(payload)
    assert.strictEqual(after.status, 200, '拒绝后应释放并发名额')
    console.log('server.test.js: PASS')
  } finally { release(); await new Promise(resolve => server.close(resolve)) }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
