const assert = require('assert')
const { getScript } = require('../data/soloScripts')
let definition
global.Page = page => { definition = page }
global.wx = { navigateBack() {} }
require('../pages/solo/solo')
const event = index => ({ currentTarget: { dataset: { index } } })
for (let id = 11; id <= 30; id++) {
  const script = getScript(id)
  assert.strictEqual(script.authoredGraph, true, `case ${id} needs an authored graph`)
  const seen = new Set()
  function visit(index, history) {
    assert.ok(!history.includes(index), `case ${id} has a loop`)
    seen.add(index)
    const stage = script.stages[index]
    assert.ok(stage && stage.choices.length >= 3, `case ${id}: missing choices at ${index}`)
    for (const choice of stage.choices) {
      assert.ok(choice.note && choice.label)
      if (choice.terminal) continue
      assert.ok(Number.isInteger(choice.nextStage), `case ${id}: missing destination`)
      visit(choice.nextStage, history.concat(index))
    }
  }
  visit(0, [])
  assert.ok(seen.size >= 4, `case ${id}: insufficient reachable scenes`)
  assert.notStrictEqual(script.stages[0].choices[1].nextStage, script.stages[0].choices[2].nextStage)
  const page = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
  page.setData = values => Object.assign(page.data, values)
  page.onLoad({ id }); page.selectCamp({ currentTarget: { dataset: { camp: 'defender' } } }); page.start()
  const expected = page.data.stage.choices[2].nextStage
  page.choose(event(2)); page.next()
  assert.strictEqual(page.data.stageIndex, expected, `case ${id}: branch not followed`)
  function playPath(path) {
    const p = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
    p.setData = values => Object.assign(p.data, values)
    p.onLoad({ id }); p.selectCamp({ currentTarget: { dataset: { camp: 'defender' } } }); p.start()
    for (const index of path) {
      assert.strictEqual(p.data.phase, 'play')
      p.choose(event(index)); p.next()
    }
    assert.strictEqual(p.data.phase, 'result', `case ${id}: path must settle`)
    assert.ok(p.data.endingDetail.includes(p.data.story.name))
    assert.ok(p.data.virtualLoss >= 0)
  }
  function paths(index, path) {
    script.stages[index].choices.forEach((choice, option) => {
      const next = path.concat(option)
      if (choice.terminal) playPath(next)
      else paths(choice.nextStage, next)
    })
  }
  paths(0, [])
}
console.log('case-branches.test.js: PASS (20 authored graphs)')
