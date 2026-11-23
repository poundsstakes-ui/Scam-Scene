const assert = require('assert')
let definition
global.Page = page => { definition = page }
global.wx = { navigateBack() {} }
require('../pages/solo/solo')
const event = index => ({ currentTarget: { dataset: { index } } })
function makePage() {
  const page = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
  page.setData = patch => Object.assign(page.data, patch)
  page.onLoad({ id: 2 }); page.start()
  return page
}
function step(page, index) {
  assert.strictEqual(page.data.phase, 'scene')
  assert.ok(page.data.stage.dialogue, '每一幕都应有可阅读的游戏改编对话')
  page.showChoices()
  page.choose(event(index)); page.next()
}
const safe = makePage()
step(safe, 0); assert.strictEqual(safe.data.cutAt, 1)
step(safe, 0); step(safe, 0); step(safe, 0)
assert.strictEqual(safe.data.phase, 'result')
assert.strictEqual(safe.data.virtualLoss, 0)
assert.strictEqual(safe.data.cutAt, 1, '后续调查不能覆盖最早截断点')
const delayed = makePage()
step(delayed, 2); step(delayed, 2); step(delayed, 1); step(delayed, 0)
assert.strictEqual(delayed.data.phase, 'result')
assert.strictEqual(delayed.data.virtualLoss, 1000, '模拟支出后暂停不能抹除已发生的虚拟损失')
assert.ok(delayed.data.script.fact.includes('民警'))
const script = delayed.data.script
const seen = new Set()
let paths = 0
function inspect(index, sequence, history, cut) {
  assert.ok(!history.includes(index), '剧情图不能形成死循环')
  seen.add(index)
  const stage = script.stages[index]
  stage.choices.forEach((choice, optionIndex) => {
    if (cut) assert.strictEqual(choice.tone, 'safe', '已截断的路线不能悄悄重新进入危险付款')
    const next = sequence.concat(optionIndex)
    if (choice.terminal) {
      const page = makePage()
      next.forEach(i => step(page, i))
      assert.strictEqual(page.data.phase, 'result')
      assert.ok(page.data.virtualLoss >= 0)
      paths++
    } else inspect(choice.nextStage, next, history.concat(index), cut || choice.tone === 'safe')
  })
}
inspect(0, [], [], false)
assert.strictEqual(seen.size, 9)
assert.ok(paths > 40)
console.log('refund-long-story.test.js: PASS')
