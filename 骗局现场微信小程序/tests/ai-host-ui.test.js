const assert = require('assert')
let definition
let requests = []
global.Page = page => { definition = page }
global.wx = {
  getSystemInfoSync: () => ({ platform: 'devtools' }),
  request: request => { requests.push(request) },
  navigateBack() {}
}
require('../pages/party/party')
const page = Object.assign({}, definition, { data: JSON.parse(JSON.stringify(definition.data)) })
page.setData = patch => Object.assign(page.data, patch)
page.onLoad({ id: 2 }); page.begin()
page.data.messageText = '秘密身份和私人信息不要传输'
page.sendMessage()
page.askHost()
assert.strictEqual(requests.length, 1)
const payload = requests[0].data
assert.deepStrictEqual(Object.keys(payload).sort(), ['caseId', 'clueIds', 'phase'])
assert.ok(!JSON.stringify(payload).includes('秘密身份'))
assert.strictEqual(payload.clueIds.length, 1)
requests[0].success({ statusCode: 200, data: { source: 'model', text: '请核对信息来源。' } })
assert.ok(page.data.messages.some(item => item.name === 'AI主持人' && item.text.includes('核对')))
page.toVote(); page.safe({ currentTarget: { dataset: { index: 0 } } }); page.vote({ currentTarget: { dataset: { index: 1 } } }); page.finish(false)
assert.strictEqual(requests.length, 2)
assert.strictEqual(requests[1].data.phase, 'review')
assert.deepStrictEqual(Object.keys(requests[1].data.outcome).sort(), ['caught', 'safety', 'timeout'])
requests[1].fail()
assert.ok(page.data.aiReview.includes('核实'))
page.reset()
page.begin()
page.askHost(); page.askHost()
assert.strictEqual(requests.length, 3, '主持人请求进行中不应重复发送')
const messagesBeforeUnload = page.data.messages.length
page.onUnload()
requests[2].success({ statusCode: 200, data: { source: 'model', text: '迟到的回复' } })
assert.strictEqual(page.data.messages.length, messagesBeforeUnload, '离开页面后不应再更新已销毁的局面')
console.log('ai-host-ui.test.js: PASS')
