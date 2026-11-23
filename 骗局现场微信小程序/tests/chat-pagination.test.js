const assert = require('assert')
let definition
global.Page = value => { definition = value }
require('../pages/party/party')
const page = Object.assign({}, definition, { data: { messages: [] } })
page.setData = values => Object.assign(page.data, values)
const longText = '这条公开线索需要大家逐字看清。'.repeat(12)
page.append('2号 · 预设机器人', longText)
page.append('你', '我的判断')
assert.strictEqual(page.data.messages.length, 2, 'each utterance stays in one bubble')
assert.strictEqual(page.data.messages[0].text, longText, 'long messages remain complete')
assert.strictEqual(page.data.messages[1].name, '你')
assert.strictEqual(page.data.chatScrollTo, 'chat-message-1', 'new messages move to latest bubble')
console.log('chat-pagination.test.js: PASS')
