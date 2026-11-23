function returnToLobby() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
  const previous = pages.length > 1 ? pages[pages.length - 2] : null
  const openLobby = () => wx.reLaunch({ url: '/pages/index/index' })
  if (previous && previous.route === 'pages/index/index') {
    wx.navigateBack({ fail: openLobby })
  } else {
    openLobby()
  }
}

module.exports = { returnToLobby }
