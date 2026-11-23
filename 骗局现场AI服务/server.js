const http = require('http')
const { generateHost } = require('./host-service')
const { makeProvider } = require('./providers')
function createServer(options = {}) {
  const provider = Object.prototype.hasOwnProperty.call(options, 'provider') ? options.provider : makeProvider('bailian')
  const limit = options.maxConcurrent || 2
  let active = 0
  return http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    if (req.method !== 'POST' || req.url !== '/api/host') { res.writeHead(404); return res.end('{}') }
    if (active >= limit) { res.writeHead(503); return res.end('{"error":"busy"}') }
    active++
    let released = false, bodyEnded = false, bytes = 0
    const chunks = []
    const release = () => { if (!released) { released = true; active-- } }
    req.setTimeout(5000, () => req.destroy())
    req.on('aborted', () => { if (!bodyEnded) release() })
    req.on('error', () => { if (!bodyEnded) release() })
    req.on('data', chunk => {
      bytes += chunk.length
      if (bytes > 4096) { res.writeHead(413); res.end('{"error":"request too large"}'); req.destroy(); release() }
      else chunks.push(chunk)
    })
    req.on('end', async () => {
      if (released) return
      bodyEnded = true
      try {
        const result = await generateHost(JSON.parse(Buffer.concat(chunks).toString('utf8')), { provider })
        if (!res.destroyed) { res.writeHead(200); res.end(JSON.stringify(result)) }
      } catch (_) { if (!res.destroyed) { res.writeHead(400); res.end('{"error":"invalid request"}') } }
      finally { release() }
    })
  })
}
if (require.main === module) createServer().listen(8787, '127.0.0.1', () => console.log('本地演示服务已启动：127.0.0.1:8787；仅用于开发者工具'))
module.exports = { createServer }
