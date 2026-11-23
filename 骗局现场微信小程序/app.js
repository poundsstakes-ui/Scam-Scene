App({
  globalData: {
    selectedCaseId: 1,
    sourceMode: 'local-demo'
  },
  selectCase(id) {
    this.globalData.selectedCaseId = Number(id)
  }
})
