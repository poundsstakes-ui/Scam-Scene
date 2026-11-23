const assert = require('assert')
let definition
global.Page = page => { definition = page }
global.wx = { navigateBack() {} }
require('../pages/solo/solo')

function pageFor(id) {
  const page = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
  page.setData = values => Object.assign(page.data, values)
  page.onLoad({ id })
  page.selectCamp({ currentTarget: { dataset: { camp: 'attacker' } } })
  page.startAttacker()
  return page
}
const event = (key, value) => ({ currentTarget: { dataset: { [key]: value } } })
for (let id = 1; id <= 30; id++) {
  for (let plan = 0; plan < 125; plan++) {
    const page = pageFor(id)
    let n = plan
    let expectedUnresolved = 0
    for (let step = 0; step < 3; step++) {
      const mode = n % 5; n = Math.floor(n / 5)
      const choices = page.data.attackerStages[step].choices
      const correct = choices.findIndex(choice => choice.correct)
      const wrong = choices.map((choice, index) => !choice.correct ? index : -1).filter(index => index >= 0)
      const answer = mode === 0 ? correct : wrong[(mode - 1) % 2]
      page.chooseAttacker(event('index', answer))
      page.nextAttacker()
      if (mode !== 0) {
        assert.strictEqual(page.data.phase, 'attackerBranch', `case ${id}, step ${step}: missing branch`)
        const recover = mode <= 2
        if (!recover) expectedUnresolved++
        page.resolveAttackerBranch(event('action', recover ? 'verify' : 'defer'))
      }
    }
    assert.strictEqual(page.data.phase, 'attackerResult')
    assert.strictEqual(page.data.attackerUnresolved, expectedUnresolved)
    assert.ok(page.data.attackerEndingText.includes(page.data.story.name))
    assert.ok(page.data.attackerEndingDetail)
  }
}
console.log('attacker-branch.test.js: PASS (30 cases, 3750 paths)')
