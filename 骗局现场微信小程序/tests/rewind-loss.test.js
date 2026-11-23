const assert = require('assert')
let definition
global.Page = value => { definition = value }
require('../pages/solo/solo')
const p = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
p.setData = values => Object.assign(p.data, values)
const option = (label, loss, nextStage, terminal) => ({ label, loss, risk: loss ? 1 : 0, tone: loss ? 'risk' : 'safe', note: label, nextStage, terminal })
p.data.story = { name: '测试案件' }
p.data.script = { authoredGraph: true, stages: [
  { title:'第一幕', clue:'线索一', choices:[option('先损失', 100, 1)] },
  { title:'第二幕', clue:'线索二', choices:[option('再次损失', 200, 2), option('核实', 0, 2)] },
  { title:'第三幕', clue:'线索三', choices:[option('结束', 0, null, 'contain')] }
] }
p.data.stage = p.data.script.stages[0]; p.data.phase = 'play'
function select(i) { p.choose({ currentTarget: { dataset: { index: i } } }); p.next() }
select(0); select(0); select(0)
assert.strictEqual(p.data.virtualLoss, 300)
assert.strictEqual(p.data.phase, 'result')
assert.strictEqual(typeof p.rewindLoss, 'function', 'settlement should allow rewind to a loss-causing choice')
p.rewindLoss()
assert.strictEqual(p.data.phase, 'play')
assert.strictEqual(p.data.stageIndex, 1)
assert.strictEqual(p.data.virtualLoss, 100, 'keep loss incurred before the selected decision')
assert.strictEqual(p.data.decisions.length, 1)
assert.strictEqual(p.data.rewindPreviousChoice, '再次损失')
select(1); select(0)
assert.strictEqual(p.data.virtualLoss, 100)
assert.strictEqual(p.data.rewindOriginal.loss, 300)
assert.strictEqual(p.data.phase, 'result')
p.rewindLoss()
assert.strictEqual(p.data.stageIndex, 0, 'rewind should target the latest remaining loss')
assert.strictEqual(p.data.virtualLoss, 0)
assert.strictEqual(p.data.rewindOriginal.loss, 300, 'keep original result across repeated rewinds')
p.changeCamp()
assert.strictEqual(p.data.rewindOriginal, null)
console.log('rewind-loss.test.js: PASS')
