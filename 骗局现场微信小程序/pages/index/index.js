const { cases } = require('../../data/cases')
const app = getApp()
const { isLargeText, setLargeText } = require('../../utils/textSize')

Page({
  data: { cases, pageCases: [], active: 1, selected: null, catalogPage: 0, totalPages: Math.ceil(cases.length / 4) },
  onLoad() { this.setData({ largeText: isLargeText() }); this.refreshPage(0); this.choose(1) },
  onShow() { const largeText = isLargeText(); if (largeText !== this.data.largeText) { this.setData({ largeText }); this.refreshPage(0) } },
  toggleTextSize() { const largeText = !this.data.largeText; setLargeText(largeText); this.setData({ largeText }); this.refreshPage(0) },
  refreshPage(catalogPage) { const pageSize = this.data.largeText ? 3 : 4; this.setData({ catalogPage, totalPages: Math.ceil(cases.length / pageSize), pageCases: cases.slice(catalogPage * pageSize, catalogPage * pageSize + pageSize) }) },
  choose(e) {
    const id = Number(e.currentTarget ? e.currentTarget.dataset.id : e)
    const selected = cases.find(item => item.id === id) || cases[0]
    app.selectCase(selected.id)
    this.setData({ active: selected.id, selected })
  },
  previousPage() { if (this.data.catalogPage > 0) this.refreshPage(this.data.catalogPage - 1) },
  nextPage() { if (this.data.catalogPage < this.data.totalPages - 1) this.refreshPage(this.data.catalogPage + 1) },
  startSolo() { wx.navigateTo({ url: `/pages/solo/solo?id=${this.data.active}` }) },
  startParty() { wx.navigateTo({ url: `/pages/party/party?id=${this.data.active}` }) }
})
