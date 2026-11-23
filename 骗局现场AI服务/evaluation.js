const { generateHost } = require('./host-service')
// 固定演示输入，含空线索、不同案件和身份判断与安全行动不同的结算。
const fixtures = [
  { id: '退费群-未公开', input: { caseId: 2, phase: 'discussion', clueIds: [] } },
  { id: '退费群-一条公开', input: { caseId: 2, phase: 'discussion', clueIds: [0] } },
  { id: '航班改签', input: { caseId: 4, phase: 'discussion', clueIds: [0, 1] } },
  { id: '演出票', input: { caseId: 11, phase: 'discussion', clueIds: [0] } },
  { id: '学生群', input: { caseId: 18, phase: 'discussion', clueIds: [0, 1] } },
  { id: '退费复盘-投错仍核实', input: { caseId: 2, phase: 'review', clueIds: [0], outcome: { caught: false, safety: 'blocked', timeout: false } } },
  { id: '退费复盘-超时', input: { caseId: 2, phase: 'review', clueIds: [], outcome: { caught: false, safety: 'unresolved', timeout: true } } }
]
async function runComparison(providers) {
  if (!providers || !['bailian', 'siliconflow'].every(name => typeof providers[name] === 'function')) throw new Error('two providers required')
  const rows = []
  for (const fixture of fixtures) {
    for (const name of ['bailian', 'siliconflow']) {
      const start = Date.now()
      const result = await generateHost(fixture.input, { provider: providers[name] })
      rows.push({ scenario: fixture.id, phase: fixture.input.phase, provider: name, elapsedMs: Date.now() - start, source: result.source, reason: result.reason || '', text: result.text })
    }
  }
  const summary = ['bailian', 'siliconflow'].map(provider => {
    const entries = rows.filter(row => row.provider === provider)
    const durations = entries.map(row => row.elapsedMs).sort((a, b) => a - b)
    const middle = Math.floor(durations.length / 2)
    const medianMs = durations.length % 2 ? durations[middle] : (durations[middle - 1] + durations[middle]) / 2
    return { provider, total: entries.length, generated: entries.filter(row => row.source === 'model').length, blocked: entries.filter(row => row.reason === 'unsafe_output').length, fallback: entries.filter(row => row.source === 'preset').length, medianMs }
  })
  return { rows, summary }
}
module.exports = { fixtures, runComparison }
