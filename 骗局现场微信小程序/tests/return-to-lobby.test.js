const assert = require('assert')
let page
global.Page = definition => { page = definition }
require('../pages/solo/solo')
const solo = page
require('../pages/party/party')
const party = page

for (const definition of [solo, party]) {
  const calls = []
  global.getCurrentPages = () => [{ route: 'pages/solo/solo' }]
  global.wx = { navigateBack: () => calls.push('back'), reLaunch: options => calls.push(options.url) }
  definition.back()
  assert.deepStrictEqual(calls, ['/pages/index/index'], 'single-page entry must open the lobby')

  calls.length = 0
  global.getCurrentPages = () => [{ route: 'pages/review/review' }, { route: 'pages/solo/solo' }]
  definition.back()
  assert.deepStrictEqual(calls, ['/pages/index/index'], 'return to the lobby even when another page is behind the game')

  calls.length = 0
  global.getCurrentPages = () => [{ route: 'pages/index/index' }, { route: 'pages/solo/solo' }]
  global.wx.navigateBack = () => calls.push('back')
  definition.back()
  assert.deepStrictEqual(calls, ['back'], 'return to an existing lobby without resetting it')

  calls.length = 0
  global.wx.navigateBack = options => { calls.push('back'); options.fail() }
  definition.back()
  assert.deepStrictEqual(calls, ['back', '/pages/index/index'], 'failed back navigation must fall back to the lobby')
}
console.log('return-to-lobby.test.js: PASS')
