const assert = require('assert')
let definition
global.Page = page => { definition = page }
require('../pages/solo/solo')
function game() {
  const p = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
  p.setData = values => Object.assign(p.data, values)
  p.onLoad({ id: '1' })
  p.selectCamp({ currentTarget: { dataset: { camp: 'defender' } } })
  p.start()
  if (p.data.phase === 'scene') p.showChoices()
  return p
}
const p = game()
const stage = p.data.stage
const safe = stage.choices.find(choice => choice.tone === 'safe')
const unsafeIndex = stage.choices.findIndex(choice => choice.tone !== 'safe')
p.choose({ currentTarget: { dataset: { index: unsafeIndex } } })
assert.strictEqual(p.data.decisions[0].clue, stage.clue, 'review retains the clue visible at decision time')
assert.strictEqual(p.data.decisions[0].recommendedAction, safe.label, 'review contains the case-specific safe action')
p.finish()
assert.strictEqual(p.data.interruptionCount, 0, 'an unsafe choice is not counted as a risk interruption')
const share = p.onShareAppMessage()
assert(share.path.includes('id=1'), 'share opens the same case')
assert(!share.title.includes('骗子是'), 'share does not disclose hidden identities')
const q = game()
q.choose({ currentTarget: { dataset: { index: q.data.stage.choices.findIndex(choice => choice.tone === 'safe') } } })
q.finish()
assert.strictEqual(q.data.interruptionCount, 1, 'safe interruption is recorded once')
const drawn = []
const ctx = { drawImage: (...args) => drawn.push(args), setTextAlign() {}, setFillStyle() {}, setFontSize() {}, fillText: (...args) => drawn.push(args), draw: (_, done) => done() }
let saved = false
global.wx = { createCanvasContext: () => ctx, canvasToTempFilePath: opts => opts.success({ tempFilePath: 'poster.png' }), saveImageToPhotosAlbum: opts => { saved = opts.filePath === 'poster.png'; opts.success() }, showToast() {} }
q.saveScoreCard()
assert(saved, 'saving creates the poster and sends it to the album API')
assert(drawn.some(item => item[0] === '风险截断 1 次'), 'poster uses the current run’s interruption count')
assert(drawn.some(item => item[0] === '虚拟损失 ¥' + q.data.virtualLoss), 'poster uses the current run’s virtual loss')
console.log('experience-polish.test.js: PASS')
