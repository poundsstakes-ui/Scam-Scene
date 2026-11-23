// 云服务密钥仅通过环境变量传入；模型与网址由服务端控制。
const endpoints = {
  bailian: { key: 'DASHSCOPE_API_KEY', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen3.7-flash' },
  siliconflow: { key: 'SILICONFLOW_API_KEY', url: 'https://api.siliconflow.cn/v1/chat/completions', model: '' }
}
function makeProvider(name, env = process.env, transport = fetch) {
  const config = endpoints[name]
  if (!config) return null
  const token = env[config.key]
  const model = name === 'siliconflow' ? env.SILICONFLOW_MODEL : (env.BAILIAN_MODEL || config.model)
  if (!token || !model) return null
  return async messages => {
    const body = { model, messages, max_tokens: 180, temperature: 0.35, stream: false }
    if (name === 'bailian') body.enable_thinking = false
    const response = await transport(config.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error(`provider status ${response.status}`)
    const data = await response.json()
    const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
    if (typeof content !== 'string') throw new Error('invalid response')
    return content
  }
}
module.exports = { makeProvider }
