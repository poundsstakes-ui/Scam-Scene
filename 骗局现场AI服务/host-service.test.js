const assert = require('assert')
const { generateHost } = require('./host-service')

async function main() {
  const captured = []
  const provider = async messages => { captured.push(messages); return '请大家核对这条信息的来源。' }
  const result = await generateHost({ caseId: 2, phase: 'discussion', clueIds: [0] }, { provider })
  assert.strictEqual(result.source, 'model')
  assert.ok(result.text.includes('核对'))
  const prompt = JSON.stringify(captured[0])
  assert.ok(prompt.includes('退费通知来自陌生联系人'))
  assert.ok(!prompt.includes('当事人向家人借钱时只提到做任务'))
  assert.ok(!prompt.includes('群内引导者'))
  const retry = await generateHost({ caseId: 2, phase: 'discussion', clueIds: [0] }, { provider: async () => { throw new Error('429') } })
  assert.strictEqual(retry.source, 'preset')
  const leaked = await generateHost({ caseId: 2, phase: 'discussion', clueIds: [0] }, { provider: async () => '4号就是骗子。' })
  assert.strictEqual(leaked.source, 'preset')
  const partialLeak = await generateHost({ caseId: 2, phase: 'discussion', clueIds: [0] }, { provider: async () => '当事人向家人借钱时只提到做任务，请继续讨论。' })
  assert.strictEqual(partialLeak.source, 'preset', '未公开线索的较长原文片段不应进入回复')
  const similarPublic = await generateHost({ caseId: 2, phase: 'discussion', clueIds: [0] }, { provider: async () => '退费通知来自陌生联系人，请通过独立渠道确认。' })
  assert.strictEqual(similarPublic.source, 'model', '已公开内容不得误判为未公开')
  await assert.rejects(() => generateHost({ caseId: 2, phase: 'discussion', clueIds: [0], privateClue: '机密' }, { provider }), /invalid/i)
  const review = await generateHost({ caseId: 2, phase: 'review', clueIds: [0], outcome: { caught: false, safety: 'blocked', timeout: false } }, { provider })
  assert.strictEqual(review.source, 'model')
  const reviewPrompt = JSON.stringify(captured[captured.length - 1])
  assert.ok(reviewPrompt.includes('blocked') && reviewPrompt.includes('caught'))
  console.log('host-service.test.js: PASS')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
