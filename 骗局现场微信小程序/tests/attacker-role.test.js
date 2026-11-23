const assert = require('assert')
let pageDefinition
global.Page = page => { pageDefinition = page }
global.wx = { navigateBack() {} }
require('../pages/solo/solo')
const event = (key, value) => ({ currentTarget: { dataset: { [key]: value } } })
const allTargets = new Set()
for (let id = 1; id <= 30; id++) {
  const page = Object.assign({}, pageDefinition, { data: JSON.parse(JSON.stringify(pageDefinition.data)) })
  page.setData = value => Object.assign(page.data, value)
  page.onLoad({ id }); page.selectCamp(event('camp', 'attacker')); page.startAttacker()
  assert.strictEqual(page.data.attackerStages.length, 3)
  page.data.attackerStages.forEach(stage => {
    assert.strictEqual(stage.choices.length, 3)
    const attempt = stage.choices.find(choice => choice.effect === 'advance')
    const stop = stage.choices.find(choice => choice.effect === 'stop')
    assert.ok(attempt && stop, `case ${id}: role choices missing`)
    assert.ok(!stage.choices.some(choice => /仅依据当前联系人提供的信息继续判断|暂不核实，继续等待对方的安排/.test(choice.label)))
    assert.ok(attempt.label.includes('推动') || attempt.label.includes('促使'))
    allTargets.add(attempt.label)
  })
  for (let i = 0; i < 3; i++) {
    const stage = page.data.attackerStages[i]
    const attempt = stage.choices.findIndex(choice => choice.effect === 'advance')
    page.chooseAttacker(event('index', attempt)); page.nextAttacker()
    assert.strictEqual(page.data.phase, 'attackerBranch')
    page.resolveAttackerBranch(event('action', 'defer'))
  }
  assert.strictEqual(page.data.phase, 'attackerResult')
  assert.strictEqual(page.data.attackerUnresolved, 3)
  assert.ok(page.data.attackerEndingTitle.includes('引导'))
}
assert.ok(allTargets.size >= 75, 'case-specific target choices must vary')
console.log('attacker-role.test.js: PASS (30 cases, 90 case-specific targets)')
