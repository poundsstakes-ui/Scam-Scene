const assert = require('assert')
const path = require('path')

function loadPage(relativePath) {
  let definition
  global.Page = page => { definition = page }
  const absolutePath = path.resolve(__dirname, relativePath)
  delete require.cache[absolutePath]
  require(absolutePath)
  return definition
}

function createPageContext(definition) {
  const context = {
    data: {},
    setData(patch) { Object.assign(this.data, patch) }
  }
  Object.assign(context, definition)
  return context
}

function fakeEvent(index) {
  return { currentTarget: { dataset: { index: String(index) } } }
}

function testCaseCatalog() {
  const { cases } = require('../data/cases')
  assert.strictEqual(cases.length, 30, '案件大厅必须保留 30 个故事')
  cases.forEach((item, index) => {
    assert.strictEqual(item.id, index + 1, '案件 ID 必须连续')
    assert.ok(item.sourceTitle && item.sourceDate && item.sourceUrl, '每个案件都必须保留来源指针')
  })
  assert.strictEqual(cases[10].status, '样例关卡待事实审校', '未审校样例不得伪装为正式事实链')
}

function testSoloRewind() {
  const solo = loadPage('../pages/solo/solo.js')
  const context = createPageContext(solo)
  context.onLoad({ id: '1' })
  context.start()
  if (context.data.phase === 'scene') context.showChoices()
  const safeIndex = context.data.stage.choices.findIndex(item => item.tone === 'safe')
  assert.ok(safeIndex >= 0, '每个首关必须提供可执行的安全截断动作')
  context.choose(fakeEvent(safeIndex))
  assert.strictEqual(context.data.phase, 'consequence', '选择后必须先展示后果')
  assert.strictEqual(context.data.cutAt, 1, '安全选择应记录截断点')
  assert.ok(context.data.virtualLoss >= 0, '虚拟损失不能为负数')
}

function createParty() {
  const party = loadPage('../pages/party/party.js')
  const context = createPageContext(party)
  context.onLoad({ id: '2' })
  context.begin()
  return context
}

function testPartyEvidenceAndVote() {
  const context = createParty()
  context.fraudSeat = 4
  context.share()
  assert.ok(context.data.script, '每个多人局必须加载案件专属的游戏化资料')
  assert.strictEqual(context.data.script.caseId, 2, '多人局资料必须与当前案件一致')
  assert.ok(context.data.messages.length >= 3, '公开线索和机器人回应都必须保留在讨论记录中')
  context.toVote()
  const safeIndex = context.data.script.caseEvent.choices.findIndex(choice => choice.tone === 'safe')
  context.safe(fakeEvent(safeIndex))
  context.vote(fakeEvent(4))
  context.finish(false)
  assert.strictEqual(context.data.result.caught, true, '两票基础上投对时，守护阵营应获胜')
}

function testPartyCasesHaveDistinctScripts() {
  const { cases } = require('../data/cases')
  const { getPartyScript } = require('../data/partyScripts')
  const scripts = cases.map(getPartyScript)
  assert.strictEqual(new Set(scripts.map(item => item.caseId)).size, 30, '30 个案件必须都能生成对应的多人资料')
  assert.strictEqual(new Set(scripts.map(item => item.roomTitle)).size, 30, '不同案件不能复用同一个房间标题')
  scripts.forEach((item) => {
    assert.strictEqual(item.roles.length, 5, '每局必须保留五个身份席位')
    assert.ok(item.roles.every(role => role.portrait), '每个身份席位必须配置角色人像')
    assert.ok(item.clues.length >= 4, '每局必须提供至少四条线索')
    assert.ok(item.adaptationNote, '游戏化改编必须与来源事实区分')
  })
}

function testPartyTranscriptIsRecoverable() {
  const fs = require('fs')
  const template = fs.readFileSync(path.resolve(__dirname, '../pages/party/party.wxml'), 'utf8')
  assert.ok(template.includes('messages[messagePage]'), '讨论区必须支持逐条阅读消息')
  assert.ok(template.includes('previousMessage') && template.includes('nextMessage'), '讨论记录应支持前后翻页')
  assert.ok(!template.includes('<scroll-view class="messages"'), '讨论区按用户要求不能依赖滚动')
}

function testGeneratedVisualAssetsAreBound() {
  const fs = require('fs')
  const root = path.resolve(__dirname, '..')
  ;['app-background-3d.png', 'button-primary-3d.png', 'role-verifier-3d.png', 'role-player-3d.png', 'role-trickster-3d.png'].forEach((name) => {
    assert.ok(fs.existsSync(path.join(root, 'assets', 'images', name)), `缺少生成视觉资源：${name}`)
  })
  const globalStyle = fs.readFileSync(path.join(root, 'app.wxss'), 'utf8')
  const partyTemplate = fs.readFileSync(path.join(root, 'pages', 'party', 'party.wxml'), 'utf8')
  assert.ok(globalStyle.includes('.app-background'), '全局样式必须为底层背景图片提供布局规则')
  assert.ok(globalStyle.includes('.primary-plate'), '全局样式必须为主按钮底板提供布局规则')
  assert.ok(partyTemplate.includes('app-background'), '多人页面必须有背景')
}

function testLocalImagesDoNotUseWxssUrls() {
  const fs = require('fs')
  const root = path.resolve(__dirname, '..')
  const globalStyle = fs.readFileSync(path.join(root, 'app.wxss'), 'utf8')
  assert.ok(!globalStyle.includes("url('/assets/images/"), 'WXSS 不得用本地图片 URL；必须以 image 标签加载')
  ;['index', 'solo', 'party', 'review'].forEach((name) => {
    const template = fs.readFileSync(path.join(root, 'pages', name, `${name}.wxml`), 'utf8')
    assert.ok(template.includes('app-background'), `${name} 页面必须有可加载的底层背景图片`)
  })
}

function testPartyTimeout() {
  const context = createParty()
  context.finish(true)
  assert.strictEqual(context.data.result.caught, false, '投票超时必须判定骗子阵营获胜')
  assert.strictEqual(context.data.result.timeout, true, '结算应保留超时原因')
}

testCaseCatalog()
testSoloRewind()
testPartyEvidenceAndVote()
testPartyTimeout()
testPartyCasesHaveDistinctScripts()
testPartyTranscriptIsRecoverable()
testGeneratedVisualAssetsAreBound()
testLocalImagesDoNotUseWxssUrls()
console.log('game-rules.test.js: PASS')
