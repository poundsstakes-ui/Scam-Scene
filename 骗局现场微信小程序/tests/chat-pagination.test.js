const assert = require('assert')
let definition
global.Page = value => { definition = value }
require('../pages/party/party')
const page = Object.assign({}, definition, { data: { messages: [], messagePage: 0 } })
page.setData = values => Object.assign(page.data, values)
const message = '这条公开线索需要大家逐字看清。'.repeat(12)
page.append('2号 · 预设机器人', message)
assert(page.data.messages.length > 1, 'long dialogue is split across readable pages')
assert.strictEqual(page.data.messages.map(item => item.text).join(''), message, 'pagination preserves the full dialogue')
assert.strictEqual(page.data.messagePage, 0, 'reading starts from the first page of the new message')
console.log('chat-pagination.test.js: PASS')
