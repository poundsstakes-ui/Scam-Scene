const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { cases } = require('../data/cases')
let definition
global.Page = page => { definition = page }
require('../pages/solo/solo')
const seen = new Set()
for (const story of cases) {
  const page = Object.assign({}, definition, { data: {}, setData(values) { Object.assign(this.data, values) } })
  page.onLoad({ id: story.id })
  assert(!seen.has(page.data.sceneImage), `案件 ${story.id} 应有自己的图片`)
  seen.add(page.data.sceneImage)
  assert(fs.existsSync(path.join(__dirname, '..', page.data.sceneImage)), `案件 ${story.id} 的图片必须存在`)
}
console.log('case-scene-images.test.js: PASS (30 unique files)')
