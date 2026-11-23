const assert = require('assert')
let definition
global.Page = value => { definition = value }
global.wx = { navigateBack() {} }
require('../pages/solo/solo')
function page() {
  const p = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
  p.setData = values => Object.assign(p.data, values)
  p.onLoad({ id: 1 }); p.start()
  return p
}
function step(p, index) {
  assert.strictEqual(p.data.phase, 'scene')
  assert.ok(p.data.stage.dialogue)
  p.showChoices(); p.choose({ currentTarget: { dataset: { index } } }); p.next()
}
const p = page()
step(p, 0); step(p, 0); step(p, 0); step(p, 0)
assert.strictEqual(p.data.phase, 'result')
assert.strictEqual(p.data.virtualLoss, 0)
assert.strictEqual(p.data.cutAt, 1)
const q = page()
step(q, 2); step(q, 2); step(q, 1); step(q, 0)
assert.strictEqual(q.data.phase, 'result')
assert.strictEqual(q.data.virtualLoss, 100)
const script = q.data.script
const seen = new Set()
let paths = 0
function inspect(index, sequence, history, cut) {
  assert.ok(!history.includes(index))
  seen.add(index)
  script.stages[index].choices.forEach((choice, i) => {
    if (cut) assert.strictEqual(choice.tone, 'safe')
    const next = sequence.concat(i)
    if (choice.terminal) {
      const p = page(); next.forEach(value => step(p, value))
      assert.strictEqual(p.data.phase, 'result')
      assert.ok(p.data.virtualLoss >= 0)
      paths++
    } else inspect(choice.nextStage, next, history.concat(index), cut || choice.tone === 'safe')
  })
}
inspect(0, [], [], false)
assert.strictEqual(seen.size, 9)
assert.ok(paths > 40)
console.log('job-long-story.test.js: PASS')
