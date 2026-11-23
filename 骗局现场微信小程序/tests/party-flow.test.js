const assert = require('assert')
let definition
global.Page = value => { definition = value }
global.wx = { navigateBack() {} }
require('../pages/party/party')
const event = index => ({ currentTarget: { dataset: { index } } })
for (let id = 1; id <= 30; id++) {
  for (let option = 0; option < 3; option++) {
    const page = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
    page.setData = patch => Object.assign(page.data, patch)
    page.onLoad({ id }); page.begin(); page.share(); page.toVote()
    assert.strictEqual(page.data.phase, 'event')
    let choice = page.data.eventStage.choices[option]
    page.safe(event(option))
    while (page.data.phase === 'event') {
      choice = page.data.eventStage.choices[0]
      page.safe(event(0))
    }
    assert.strictEqual(page.data.phase, 'vote')
    page.vote(event(4)); page.finish(false)
    assert.strictEqual(page.data.phase, 'result')
    assert.strictEqual(page.data.result.safety, choice.tone === 'safe' ? 'blocked' : choice.tone === 'risk' ? 'risk' : 'unresolved')
    assert.strictEqual(page.data.caseActionNote, choice.note)
    page.reset()
    assert.strictEqual(page.data.caseActionNote, '')
  }
}
{
  const page = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
  page.setData = patch => Object.assign(page.data, patch)
  page.onLoad({ id: 11 }); page.begin(); page.toVote()
  const first = page.data.eventStage.clue
  page.safe(event(2))
  assert.strictEqual(page.data.phase, 'event', 'case-specific risky branch should continue')
  assert.notStrictEqual(page.data.eventStage.clue, first)
  page.safe(event(0))
  assert.strictEqual(page.data.phase, 'vote')
  assert.strictEqual(page.data.action, 'safe')
  page.stopClock()
}
console.log('party-flow.test.js: PASS (90 case/action flows)')
