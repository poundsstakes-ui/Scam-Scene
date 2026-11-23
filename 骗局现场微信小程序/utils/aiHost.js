// 只在开发者工具连接本机演示服务；真机需另行部署带鉴权的 HTTPS 后端。
function requestHost(payload, fallback, callback) {
  let platform = ''
  try { if (typeof wx !== 'undefined' && wx.getSystemInfoSync) platform = wx.getSystemInfoSync().platform } catch (_) {}
  if (platform !== 'devtools' || typeof wx.request !== 'function') return callback({ text: fallback, source: 'preset' })
  wx.request({
    url: 'http://127.0.0.1:8787/api/host', method: 'POST', data: payload, timeout: 12000,
    success(res) {
      const data = res && res.data
      if (res.statusCode === 200 && data && typeof data.text === 'string' && data.text.length <= 400 && ['model', 'preset'].includes(data.source)) callback(data)
      else callback({ text: fallback, source: 'preset' })
    },
    fail() { callback({ text: fallback, source: 'preset' }) }
  })
}
module.exports = { requestHost }
