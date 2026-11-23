const assert = require('assert')
const { runComparison } = require('./evaluation')
async function main() {
  const seenA = [], seenB = []
  const a = async messages => { seenA.push(messages); return '请独立核实已公开信息。' }
  const b = async messages => { seenB.push(messages); return '当事人向家人借钱时只提到做任务，请继续讨论。' }
  const result = await runComparison({ bailian: a, siliconflow: b })
  assert.ok(result.rows.length >= 10, '至少五个相同场景分别测试两个供应商')
  assert.strictEqual(seenA.length, seenB.length)
  assert.deepStrictEqual(seenA, seenB, '同一场景应使用完全相同的输入')
  assert.ok(result.rows.some(row => row.phase === 'review'))
  assert.ok(result.rows.some(row => row.source === 'preset' && row.reason === 'unsafe_output'))
  assert.ok(result.rows.every(row => Number.isFinite(row.elapsedMs)))
  assert.ok(result.summary.every(item => Number.isFinite(item.medianMs)))
  console.log('evaluation.test.js: PASS')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
