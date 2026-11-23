const KEY = 'fraud_large_text'
function isLargeText() { try { return typeof wx !== 'undefined' && wx.getStorageSync(KEY) === true } catch (_) { return false } }
function setLargeText(value) { try { wx.setStorageSync(KEY, !!value) } catch (_) {} }
module.exports = { isLargeText, setLargeText }
