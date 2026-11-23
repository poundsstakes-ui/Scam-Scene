const assert = require('assert')
const { makeProvider } = require('./providers')
async function main() {
  assert.strictEqual(makeProvider('bailian', {}), null)
  assert.strictEqual(makeProvider('siliconflow', { SILICONFLOW_API_KEY: 'test' }), null)
  let sent
  const mock = async (url, init) => { sent = { url, init }; return { ok: true, json: async () => ({ choices: [{ message: { content: '请核实来源。' } }] }) } }
  const provider = makeProvider('bailian', { DASHSCOPE_API_KEY: 'test-key' }, mock)
  assert.strictEqual(await provider([{ role: 'user', content: '公开线索' }]), '请核实来源。')
  assert.strictEqual(JSON.parse(sent.init.body).model, 'qwen3.7-flash')
  assert.strictEqual(sent.init.headers.Authorization, 'Bearer test-key')
  const bad = makeProvider('bailian', { DASHSCOPE_API_KEY: 'test-key' }, async () => ({ ok: false, status: 429 }))
  await assert.rejects(() => bad([]), /429/)
  console.log('providers.test.js: PASS')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
