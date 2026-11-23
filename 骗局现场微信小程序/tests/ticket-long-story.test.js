const assert = require('assert')
const { getScript } = require('../data/soloScripts')
const { cases } = require('../data/cases')
const { getPartyScript } = require('../data/partyScripts')
const script = getScript(3)
assert.ok(script.authoredGraph && script.sceneFirst, 'case 3 needs a playable authored branching story')
assert.ok(script.stages.length >= 9, 'case 3 needs an expanded story')
const seen = new Set(), endings = new Set()
function walk(index, path, cut) {
  assert.ok(!path.includes(index), 'story must not loop')
  const stage = script.stages[index]
  assert.ok(stage && stage.dialogue && stage.choices.length >= 3)
  seen.add(index)
  stage.choices.forEach(choice => {
    assert.ok(choice.note && Number.isFinite(choice.loss) && Number.isFinite(choice.risk))
    if (cut) assert.strictEqual(choice.tone, 'safe', 'a stopped risk must not restart')
    if (choice.terminal) endings.add(choice.terminal)
    else { assert.ok(Number.isInteger(choice.nextStage)); walk(choice.nextStage, path.concat(index), cut || choice.tone === 'safe') }
  })
}
walk(0, [], false)
assert.strictEqual(seen.size, script.stages.length)
for (const ending of ['safe', 'contain', 'wait', 'loss']) assert.ok(endings.has(ending), ending)
const party = getPartyScript(cases[2])
assert.ok(party.roomOpening.includes('票'))
assert.ok(party.roles.every(role => role.desc.includes('票') || role.desc.includes('退款')))
assert.ok(party.caseGraph.length >= 9)
let soloPage
global.Page = definition => { soloPage = definition }
global.wx = { navigateBack() {} }
require('../pages/solo/solo')
const page = Object.assign({}, soloPage, { data: JSON.parse(JSON.stringify(soloPage.data)) })
page.setData = values => Object.assign(page.data, values)
const event = (key, value) => ({ currentTarget: { dataset: { [key]: value } } })
page.onLoad({ id: 3 }); page.selectCamp(event('camp', 'attacker')); page.startAttacker()
for (let i = 0; i < 3; i++) {
  const choice = page.data.attackerStages[i].choices.findIndex(item => item.effect === 'advance')
  page.chooseAttacker(event('index', choice)); page.nextAttacker(); page.resolveAttackerBranch(event('action', 'defer'))
}
assert.strictEqual(page.data.phase, 'attackerResult')
assert.ok(page.data.attackerVirtualLoss > 0, 'unverified refund payment should have a virtual loss')
assert.ok(page.data.attackerEndingText.includes('票') && page.data.attackerEndingDetail.includes('退款'), 'review should reflect this ticket case')
console.log('ticket-long-story.test.js: PASS')
