const { cases } = require('../../data/cases')
const { getScript } = require('../../data/soloScripts')
const { perspectives } = require('../../data/casePerspectives')
const { refundEpisode } = require('../../data/refundEpisode')
const { jobEpisode } = require('../../data/jobEpisode')
const { getEpisode, reviewTopics } = require('../../data/caseEpisodes')
const { makeAttackerStages } = require('../../data/attackerChoices')
const { returnToLobby } = require('../../utils/returnToLobby')
const { isLargeText } = require('../../utils/textSize')
Page({
  data: { story: null, script: null, phase: 'camp', camp: '', stageIndex: 0, stage: null, choice: null, decisions: [], virtualLoss: 0, risk: 0, ending: '', cutAt: 0, attackerStep: 0, attackerAnswers: [] },
  onLoad(query) {
    const story = cases.find(item => item.id === Number(query.id)) || cases[0]
    const script = getScript(story.id)
    const perspective = perspectives[story.id]
    const baseStages = story.id === 1 ? jobEpisode.attackerStages : story.id === 2 ? refundEpisode.attackerStages : getEpisode(story.id) || (perspective ? perspective.focus.map((focus, index) => {
      const choices = [
        { label: focus, correct: true },
        { label: '仅依据对方提供的信息继续判断', correct: false },
        { label: '暂不核实，等待对方安排下一步', correct: false }
      ]
      const shift = index % choices.length
      return {
        title: ['接触与信任', '出现矛盾', '截断风险'][index],
        clue: perspective.privateClues[index],
        prompt: '从引导者影响判断的角度观察，哪一步能切断当前风险？',
        choices: choices.slice(shift).concat(choices.slice(0, shift))
      }
    }) : [])
    const attackerStages = makeAttackerStages(story.id, baseStages)
    const sceneImages = { 1: '/assets/images/story-job-3d.jpg', 2: '/assets/images/story-refund-3d.jpg', 3: '/assets/images/story-ticket-3d.jpg' }
    this.setData({ story, script, sceneImage: sceneImages[story.id] || `/assets/images/story-case-${story.id}.jpg`, largeText: isLargeText(), attackerStages, reviewTopic: reviewTopics[story.id] || story.scene, perspective: perspective || null, stage: script ? script.stages[0] : null })
  },
  onShow() { this.setData({ largeText: isLargeText() }) },
  selectCamp(e) {
    const camp = e.currentTarget.dataset.camp
    if (camp !== 'defender' && camp !== 'attacker') return
    this.setData({ camp, phase: camp === 'defender' ? 'intro' : 'attackerIntro' })
  },
  startAttacker() { this.setData({ phase: 'attackerPlay', attackerStep: 0, attackerAnswers: [], attackerRecoveries: [], attackerVirtualLoss: 0 }) },
  chooseAttacker(e) {
    if (this.data.phase !== 'attackerPlay') return
    const answer = Number(e.currentTarget.dataset.index)
    if (![0, 1, 2].includes(answer)) return
    const answers = this.data.attackerAnswers.concat(answer)
    const step = this.data.attackerStep
    const selected = this.data.attackerStages[step].choices[answer]
    const focus = this.data.perspective.focus[step]
    const feedback = selected.note || (selected.correct
      ? `这一步可以中断当前信息链。核验重点：${focus}。`
      : `继续依赖对方的信息可能让风险延续。可以尝试：${focus}。`)
    this.setData({ attackerAnswers: answers, attackerFeedback: feedback, phase: 'attackerFeedback', attackerStep: step })
  },
  nextAttacker() {
    if (this.data.phase !== 'attackerFeedback') return
    const step = this.data.attackerStep
    const selected = this.data.attackerStages[step].choices[this.data.attackerAnswers[step]]
    if (!selected.correct) {
      this.setData({ phase: 'attackerBranch' })
      return
    }
    this.advanceAttacker()
  },
  resolveAttackerBranch(e) {
    if (this.data.phase !== 'attackerBranch') return
    const action = e.currentTarget.dataset.action
    if (action !== 'verify' && action !== 'defer') return
    const recoveries = this.data.attackerRecoveries.slice()
    recoveries[this.data.attackerStep] = action === 'verify'
    const selected = this.data.attackerStages[this.data.attackerStep].choices[this.data.attackerAnswers[this.data.attackerStep]]
    const simulatedLoss = action === 'defer' && selected.effect === 'advance' && selected.virtualPayment ? (this.data.attackerStep + 1) * 100 : 0
    this.setData({ attackerRecoveries: recoveries, attackerVirtualLoss: this.data.attackerVirtualLoss + simulatedLoss })
    this.advanceAttacker()
  },
  advanceAttacker() {
    const next = this.data.attackerStep + 1
    if (next < this.data.attackerStages.length) {
      this.setData({ attackerStep: next, phase: 'attackerPlay' })
      return
    }
    const outcomes = this.data.attackerAnswers.map((answer, index) => ({
      title: this.data.attackerStages[index].title,
      focus: this.data.perspective.focus[index],
      direct: this.data.attackerStages[index].choices[answer].correct,
      effect: this.data.attackerStages[index].choices[answer].effect,
      recovered: this.data.attackerRecoveries[index] === true,
      label: this.data.attackerStages[index].choices[answer].label,
      note: this.data.attackerStages[index].choices[answer].note || ''
    }))
    const unresolved = outcomes.filter(item => !item.direct && !item.recovered)
    const recovered = outcomes.filter(item => item.recovered).length
    const direct = outcomes.filter(item => item.direct).length
    const advanced = unresolved.filter(item => item.effect === 'advance').length
    const endingTitle = advanced ? '模拟引导仍在继续' : unresolved.length ? '引导暂缓，核验仍未完成' : '模拟引导被中断'
    const endingText = `《${this.data.story.name}》的三个假设环节：${advanced} 次引导后未核验，${direct} 次主动停止引导，${recovered} 次由当事人核验补救，${unresolved.length} 个环节仍未核实。`
    const ticketReview = this.data.story.id === 3 ? '退款应从原平台官方渠道核验，卖家展示的预留票页面不能证明订单真实。' : ''
    const endingDetail = (unresolved.length ? `仍需关注“${unresolved[0].title}”：${unresolved[0].focus}。` : `本案关键核验：${outcomes.map(item => item.focus).join('；')}。`) + ticketReview + ` 游戏虚拟损失 ¥${this.data.attackerVirtualLoss}，金额为演练设定。`
    this.setData({ attackerOutcomes: outcomes, attackerReviewPage: 0, attackerScore: direct, attackerUnresolved: unresolved.length, attackerEndingTitle: endingTitle, attackerEndingText: endingText, attackerEndingDetail: endingDetail, phase: 'attackerResult' })
  },
  changeCamp() { this.setData({ phase: 'camp', camp: '', stageIndex: 0, stage: this.data.script ? this.data.script.stages[0] : null, choice: null, decisions: [], virtualLoss: 0, risk: 0, ending: '', cutAt: 0, attackerStep: 0, attackerAnswers: [] }) },
  start() { if (this.data.script) this.setData({ phase: this.data.script.sceneFirst ? 'scene' : 'play' }) },
  showChoices() { if (this.data.phase === 'scene') this.setData({ phase: 'play' }) },
  choose(e) {
    if (this.data.phase !== 'play') return
    const option = this.data.stage.choices[Number(e.currentTarget.dataset.index)]
    if (!option) return
    const safeChoice = this.data.stage.choices.find(item => item.tone === 'safe')
    const decisions = [...this.data.decisions, { title: this.data.stage.title, clue: this.data.stage.clue, label: option.label, note: option.note, tone: option.tone, recommendedAction: safeChoice ? safeChoice.label : '暂停操作，通过独立可信渠道核实' }]
    this.setData({ choice: option, decisions, virtualLoss: this.data.virtualLoss + option.loss, risk: Math.max(0, this.data.risk + option.risk), ending: option.terminal || '' , cutAt: option.tone === 'safe' && !this.data.cutAt ? decisions.length : this.data.cutAt, phase: 'consequence' })
  },
  next() {
    if (this.data.phase !== 'consequence') return
    if (this.data.ending) return this.finish()
    if (this.data.script.authoredGraph && Number.isInteger(this.data.choice.nextStage)) {
      const stageIndex = this.data.choice.nextStage
      const stage = this.data.script.stages[stageIndex]
      if (!stage) return
      this.setData({ stageIndex, stage, choice: null, phase: this.data.script.sceneFirst ? 'scene' : 'play' })
      return
    }
    if (this.data.choice && this.data.choice.tone !== 'safe') {
      this.setData({ phase: 'branch', branchTone: this.data.choice.tone })
      return
    }
    this.advanceStage()
  },
  resolveBranch(e) {
    const action = e.currentTarget.dataset.action
    if (action !== 'verify' && action !== 'continue') return
    const label = action === 'verify' ? '暂停并通过可信渠道独立核实' : '暂不核实，继续观察后续线索'
    const decisions = this.data.decisions.concat({ title: '分支决策', clue: this.data.stage.clue, label, note: '', recommendedAction: '暂停并通过可信渠道独立核实', tone: action === 'verify' ? 'safe' : this.data.branchTone })
    if (action === 'verify') {
      this.setData({ decisions, ending: 'contain', cutAt: this.data.stageIndex + 1 })
      this.finish()
      return
    }
    this.setData({ decisions })
    this.advanceStage()
  },
  advanceStage() {
    const stageIndex = this.data.stageIndex + 1
    if (stageIndex >= this.data.script.stages.length) return this.finish()
    this.setData({ stageIndex, stage: this.data.script.stages[stageIndex], choice: null, phase: 'play' })
  },
  finish() {
    let ending = this.data.ending
    if (!ending) ending = this.data.virtualLoss >= 3000 ? 'loss' : this.data.virtualLoss > 0 ? 'contain' : 'safe'
    const lastChoice = this.data.decisions.filter(item => item.note).slice(-1)[0]
    const endingDetail = lastChoice ? `《${this.data.story.name}》· ${lastChoice.title}：${lastChoice.note}` : `《${this.data.story.name}》：请回看线索并选择独立渠道核实。`
    this.setData({ ending, endingDetail, interruptionCount: this.data.cutAt ? 1 : 0, decisionPage: 0, phase: 'result' })
  },
  showReview() { this.setData({ phase: 'resultReview', decisionPage: 0 }) },
  showScoreCard() {
    const isAttacker = this.data.phase === 'attackerResult'
    const count = isAttacker ? this.data.attackerOutcomes.filter(item => item.direct || item.recovered).length : this.data.interruptionCount
    this.setData({ scoreReturnPhase: isAttacker ? 'attackerResult' : 'result', cardInterruptionCount: count, cardVirtualLoss: isAttacker ? this.data.attackerVirtualLoss : this.data.virtualLoss, phase: 'scoreCard' })
  },
  backToResult() { this.setData({ phase: this.data.phase === 'scoreCard' && this.data.scoreReturnPhase === 'attackerResult' ? 'attackerResult' : 'result' }) },
  showAttackerReview() { this.setData({ phase: 'attackerReview', attackerReviewPage: 0 }) },
  returnAttackerResult() { this.setData({ phase: 'attackerResult' }) },
  previousAttackerReview() { this.setData({ attackerReviewPage: Math.max(0, this.data.attackerReviewPage - 1) }) },
  nextAttackerReview() { this.setData({ attackerReviewPage: Math.min(this.data.attackerOutcomes.length - 1, this.data.attackerReviewPage + 1) }) },
  onShareAppMessage() { return { title: '来《骗局现场》，一起看看能在哪一步截断风险', path: '/pages/solo/solo?id=' + this.data.story.id } },
  onShareTimeline() { return { title: '来《骗局现场》，一起看看能在哪一步截断风险', query: 'id=' + this.data.story.id } },
  saveScoreCard() {
    const ctx = wx.createCanvasContext('scoreCanvas', this)
    ctx.drawImage('/assets/images/result-card-3d.jpg', 0, 0, 300, 400)
    ctx.setTextAlign('center')
    ctx.setFillStyle('#173d31'); ctx.setFontSize(22); ctx.fillText('骗局现场 · 倒带成绩', 150, 130)
    ctx.setFontSize(16); ctx.fillText(this.data.story.name.slice(0, 14), 150, 164)
    const count = this.data.cardInterruptionCount === undefined ? this.data.interruptionCount : this.data.cardInterruptionCount
    const loss = this.data.cardVirtualLoss === undefined ? this.data.virtualLoss : this.data.cardVirtualLoss
    ctx.setFontSize(20); ctx.fillText('风险截断 ' + count + ' 次', 150, 210)
    ctx.fillText('虚拟损失 ¥' + loss, 150, 246)
    ctx.setFontSize(13); ctx.fillText('虚构演练 · 一起识破骗局', 150, 285)
    ctx.draw(false, () => wx.canvasToTempFilePath({ canvasId: 'scoreCanvas', destWidth: 900, destHeight: 1200, success: res => wx.saveImageToPhotosAlbum({ filePath: res.tempFilePath, success: () => wx.showToast({ title: '已保存到相册' }), fail: () => wx.showModal({ title: '无法保存', content: '请检查相册权限后重试，或使用分享按钮邀请好友。', showCancel: false }) }), fail: () => wx.showToast({ title: '生成图片失败', icon: 'none' }) }, this))
  },
  previousDecision() { this.setData({ decisionPage: Math.max(0, this.data.decisionPage - 1) }) },
  nextDecision() { this.setData({ decisionPage: Math.min(this.data.decisions.length - 1, this.data.decisionPage + 1) }) },
  replay() {
    this.changeCamp()
  },
  back() { returnToLobby() }
})
