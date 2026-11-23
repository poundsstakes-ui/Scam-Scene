const { getScript, caseScripts } = require('./soloScripts')
const { perspectives } = require('./casePerspectives')
const { refundEpisode } = require('./refundEpisode')
// 多人局使用已有单人关卡中的案例线索；未审校样例保留样例标记。
// 下列角色和对白均为“游戏化改编”，不扩写为真实案件事实。
function getPartyScript(story) {
  const caseLabel = `案件 ${story.id} · ${story.name}`
  const sceneLabel = story.scene || '未知场景'
  const sourceLabel = `${story.sourceTitle}（${story.sourceDate}）`
  const soloScript = story.id === 1 || story.id === 2 ? caseScripts[story.id] : getScript(story.id)
  const perspective = perspectives[story.id]
  const refundClues = [
    '退费通知称可退回配音课程学费，并要求加入陌生群办理。请核实通知是否来自原学习平台。',
    '群里出现退款到账截图。截图由群内提供，无法独立证明真实到账。',
    '群内要求通过购物返利任务办理退款。退款与先投入资金之间存在明显矛盾。',
    '当事人因资金不足向家人借钱。家属报警后，民警上门劝阻，避免转出一万多元。'
  ]
  const result = {
    caseId: story.id,
    roomTitle: caseLabel,
    hostPrompt: `围绕“${sceneLabel}”出现的信息链，找出谁在推动大家跳过独立核实。`,
    adaptationNote: soloScript && soloScript.sample ? '样例待原文审校。身份、措辞与结算均为游戏化演练。' : '身份、措辞与结算均为游戏化演练，具体事实请核对来源。',
    caseEvent: soloScript && soloScript.stages[Number.isInteger(soloScript.partyEventIndex) ? soloScript.partyEventIndex : soloScript.stages.length - 1],
    caseGraph: soloScript ? soloScript.stages.map((stage, index, stages) => ({
      ...stage,
      choices: stage.choices.map(choice => {
        if (choice.terminal || Number.isInteger(choice.nextStage)) return { ...choice }
        return index + 1 < stages.length
          ? { ...choice, nextStage: index + 1 }
          : { ...choice, terminal: choice.tone === 'safe' ? 'safe' : choice.tone === 'risk' ? 'loss' : 'wait' }
      })
    })) : null,
    roles: [
      { name: '核实员', icon: '👮', portrait: '/assets/images/role-verifier-3d.png', camp: '守护', desc: `你只能确认本局对应“${sceneLabel}”风险标签。请把来源指针、截图和可独立验证的事实分开讨论。` },
      { name: '当事人', icon: '🧑', portrait: '/assets/images/role-subject-3d.png', camp: '守护', desc: `你接触到与“${story.name}”有关的信息。你需要判断：当前说法能否离开原消息渠道独立核实？` },
      { name: '亲友', icon: '👩', portrait: '/assets/images/role-family-3d.png', camp: '守护', desc: '你收到了求助。请追问风险行动是否会泄露信息、产生虚拟损失，或被催促绕过正常核验。' },
      { name: '观察员', icon: '🔎', portrait: '/assets/images/role-observer-3d.png', camp: '守护', desc: `你保留来源指针“${sourceLabel}”。它能支持学习主题，但不能替代对当前信息的独立核验。` },
      { name: '群内引导者', icon: '🕵️', portrait: '/assets/images/role-guide-3d.png', camp: '骗子', desc: '这是游戏化对抗身份。你的目标是让大家把群内说法、催促或片段证据误当作充分证明；不得索取真实账户、验证码或个人信息。' }
    ],
    clues: perspectives[story.id] ? perspectives[story.id].privateClues : story.id === 2 ? refundClues : soloScript ? soloScript.stages.map(stage => stage.clue) : [
      `案件标识：${caseLabel}；风险标签：${sceneLabel}。`,
      `来源指针：${sourceLabel}。来源用于学习，不等于当前消息真实。`,
      '风险链检查：对方是否催促你在未独立核实前进行虚拟操作或继续提供信息？',
      '安全行动：暂停虚拟操作，保留线索，并通过可信的独立渠道核实。'
    ],
    clueNames: ['案件标识', '来源边界', '风险链检查', '安全行动'],
    opening: [
      { name: '主持人', bot: true, system: true, text: `${caseLabel}开始。${sceneLabel}仅为风险标签；请用公开线索区分事实、推测与游戏改编。十分钟内至少三票指向引导者，否则引导者阵营获胜。` },
      { name: '观察员', bot: true, text: `我先声明边界：我们有来源“${sourceLabel}”，但它不能直接证明眼前这条信息是真的。` }
    ],
    botLines: {
      player: { guardian: perspective ? `我建议先${perspective.focus[0]}，再讨论下一步。` : '先核对信息来源，并通过独立渠道验证。', thief: '现在的材料需要再次核实，大家先仔细看线索。' },
      0: '案件名称和风险标签只能帮助我们定位主题，不能证明某个群内说法真实。',
      1: '来源是学习材料的指针，不是当前信息的背书；仍要独立核实。',
      2: '催促、片段截图和无法离开原渠道验证，应当让我们暂停虚拟操作。',
      3: '先暂停、保存线索、走可信独立渠道核实，才是与身份判断分开的安全行动。'
    }
  }
  if (story.id === 2) {
    result.roles = result.roles.map((role, index) => ({ ...role, desc: refundEpisode.roleDescriptions[index] }))
    result.clues = refundEpisode.clues
    result.roomOpening = refundEpisode.opening
    result.review = refundEpisode.review
  }
  if (story.id === 3) {
    const descriptions = [
      '你负责核实票务规则：公开售票公告可以查规则，但不能替卖家证明票源。请提醒大家独立查订单。',
      '你是购票当事人：你急着和朋友看演出，卖家展示了预留票画面；你的官方订单里尚未确认门票。',
      '你是同行亲友：你希望按计划看演出，同时担心当事人因为着急忽视票源和退款风险。',
      '你是观察员：你注意到卖家截图来自对方，退款说法也由对方提供；请追问能否从平台独立核对。',
      '你是群内引导者：围绕虚构票务信息参与对抗，观察其他人会不会独立核验；不索取真实支付信息。'
    ]
    result.roles = result.roles.map((role, index) => ({ ...role, desc: descriptions[index] }))
    result.roomOpening = '热门演出票售罄后，群里出现所谓预留票；一名购票者希望与朋友同行。票源和退款说法都需核验，人物和对白为游戏改编。请交换各自的线索。'
  }
  return result
}

module.exports = { getPartyScript }
