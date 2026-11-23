const assert = require('assert')
let definition
global.Page = page => { definition = page }
global.wx = { navigateBack() {} }
require('../pages/solo/solo')
const event = (key, value) => ({ currentTarget: { dataset: { [key]: value } } })
for (let id = 1; id <= 30; id++) {
  const page = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
  page.setData = values => Object.assign(page.data, values)
  page.onLoad({ id })
  page.selectCamp(event('camp', 'defender'))
  page.start()
  if (page.data.phase === 'scene') page.showChoices()
  const option = page.data.stage.choices.findIndex(choice => choice.tone === 'safe')
  assert.ok(option >= 0, `case ${id} needs a safe choice`)
  const note = page.data.stage.choices[option].note
  page.choose(event('index', option))
  page.next()
  if (page.data.phase !== 'result') page.finish()
  assert.ok(page.data.endingDetail.includes(note), `case ${id} should use its own choice consequence`)
  assert.ok(page.data.endingDetail.includes(page.data.story.name))
}
console.log('defender-ending.test.js: PASS (30 case-specific choice summaries)')
