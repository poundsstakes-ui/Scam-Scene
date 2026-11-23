const assert = require('assert')
let definition
global.Page = value => { definition = value }
global.getApp = () => ({ selectCase() {} })
require('../pages/index/index')
const page = Object.assign({}, definition, { data: { ...definition.data }, setData(values) { Object.assign(this.data, values) } })
for (const largeText of [false, true]) {
  page.setData({ largeText })
  page.refreshPage(0)
  const expectedSize = largeText ? 3 : 4
  assert(page.data.pageCases.length <= expectedSize, '一屏案件数须为操作区留出空间')
  const all = []
  for (let n = 0; n < page.data.totalPages; n++) {
    page.refreshPage(n)
    all.push(...page.data.pageCases.map(item => item.id))
  }
  assert.deepStrictEqual(all, Array.from({ length: 30 }, (_, i) => i + 1), '分页应恰好覆盖全部 30 案')
}
console.log('index-pagination.test.js: PASS')
