// 在本机手动运行；仅发送固定的演示案例和明确公开的线索。
const { makeProvider } = require('./providers')
const { runComparison } = require('./evaluation')
async function main() {
  const names = ['bailian', 'siliconflow']
  const providers = names.map(name => makeProvider(name))
  if (providers.some(provider => !provider)) {
    console.log('尚未配置两个平台的服务端密钥或硅基流动免费模型 ID；未发起模型请求。')
    process.exitCode = 1
    return
  }
  const result = await runComparison({ bailian: providers[0], siliconflow: providers[1] })
  result.rows.forEach(row => console.log(JSON.stringify(row)))
  result.summary.forEach(summary => console.log(JSON.stringify({ summary })))
  console.log('自然度需人工评分；输出过滤和有限样本无法证明没有泄露或幻觉。')
}
main().catch(() => { console.error('对照运行失败，请检查服务端配置及额度。'); process.exitCode = 1 })
