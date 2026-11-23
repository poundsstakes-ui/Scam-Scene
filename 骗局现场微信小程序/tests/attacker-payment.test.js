const assert = require('assert')
let definition
global.Page = page => { definition = page }
global.wx = { navigateBack() {} }
require('../pages/solo/solo')
const e = (key, value) => ({ currentTarget: { dataset: { [key]: value } } })
function run(id, action) {
  const p = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
  p.setData = patch => Object.assign(p.data, patch)
  p.onLoad({ id }); p.startAttacker()
  for (let step = 0; step < 3; step++) {
    const choices = p.data.attackerStages[step].choices
    const target = choices.findIndex(x => x.effect === (step === 2 ? 'advance' : 'stop'))
    p.chooseAttacker(e('index', target)); p.nextAttacker()
    if (step === 2) p.resolveAttackerBranch(e('action', action))
  }
  return p.data
}
const paid = run(2, 'defer')
const blocked = run(2, 'verify')
assert.ok(paid.attackerVirtualLoss > 0, 'simulated refund purchase must cause simulated loss')
assert.strictEqual(blocked.attackerVirtualLoss, 0, 'independent verification must prevent that payment')
assert.ok(paid.attackerEndingDetail.includes('虚拟'))
console.log('attacker-payment.test.js: PASS')
