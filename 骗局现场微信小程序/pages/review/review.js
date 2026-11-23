const { isLargeText } = require('../../utils/textSize')
Page({ data: { title: '关卡复盘' }, onShow() { this.setData({ largeText: isLargeText() }) } })
