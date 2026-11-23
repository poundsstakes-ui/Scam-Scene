const { cases } = require('../../data/cases')
const { getPartyScript } = require('../../data/partyScripts')
const { dealRoles, settle } = require('../../data/partyCore')
const { requestHost } = require('../../utils/aiHost')
const { returnToLobby } = require('../../utils/returnToLobby')
const { isLargeText } = require('../../utils/textSize')
function messagePages(name, text) {
  const characters = Array.from(String(text))
  const pages = []
  for (let i = 0; i < characters.length; i += 60) pages.push({ name, text: characters.slice(i, i + 60).join('') })
  return pages.length ? pages : [{ name, text: '' }]
}

Page({
  data: { phase: 'pick', story: null, messages: [], messagePage: 0, vote: null, action: '', timeText: '10:00' },
  onLoad(query) {
    const story = cases.find(item => item.id === Number(query.id)) || cases[0]
    this.setData({ story, script: getPartyScript(story) })
  },
  onUnload() { this.roundId = (this.roundId || 0) + 1; this.stopClock() },
  onShow() { this.setData({ largeText: isLargeText() }); if (this.deadline) this.tick() },
  begin() {
    this.roundId = (this.roundId || 0) + 1
    const order = dealRoles()
    const fraudSeat = order.indexOf(4)
    this.order = order
    this.fraudSeat = fraudSeat
    this.nextBotSeat = 1
    const role = this.data.script.roles[order[0]]
    const seats = order.map((_, index) => ({ number: index + 1, label: index === 0 ? '1号（你）' : (index + 1) + '号' }))
    this.setData({ phase: 'room', role, seats, vote: null, action: '', caseActionText: '', caseActionNote: '', caseActionHistory: [], publicClueIds: [], hostBusy: false, aiReview: '', reviewSource: '', shared: false, bookOpen: false, messages: messagePages('主持人', this.data.script.roomOpening || '请交换线索，独立核实。其他席位由预设机器人扮演。'), messagePage: 0, clue: this.data.script.clues[order[0] % this.data.script.clues.length] })
    this.deadline = Date.now() + 600000
    this.timer = setInterval(() => this.tick(), 1000)
  },
  tick() {
    const seconds = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000))
    this.setData({ timeText: String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0') })
    if (!seconds) this.finish(true)
  },
  stopClock() { if (this.timer) clearInterval(this.timer); this.timer = null; this.deadline = null },
  toggleBook() { this.setData({ bookOpen: !this.data.bookOpen }) },
  append(name, text) {
    const messagePage = this.data.messages.length
    const messages = this.data.messages.concat(messagePages(name, text))
    this.setData({ messages, messagePage })
  },
  onInput(e) { this.setData({ messageText: e.detail.value }) },
  sendMessage() {
    const text = (this.data.messageText || '').trim()
    if (!text) return
    this.append('你', text)
    this.setData({ messageText: '' })
    this.botSpeak()
  },
  share() {
    if (this.data.shared) return
    this.setData({ shared: true })
    this.recordPublicClue(this.order[0] % this.data.script.clues.length)
    this.append('你', this.data.clue)
    this.botSpeak()
  },
  botSpeak() {
    const seat = this.nextBotSeat
    this.nextBotSeat = seat === 4 ? 1 : seat + 1
    const roleIndex = this.order[seat]
    const clue = this.data.script.clues[roleIndex % this.data.script.clues.length]
    this.recordPublicClue(roleIndex % this.data.script.clues.length)
    this.append((seat + 1) + '号 · 预设机器人', clue)
  },
  recordPublicClue(id) {
    const ids = this.data.publicClueIds || []
    if (!ids.includes(id)) this.setData({ publicClueIds: ids.concat(id) })
  },
  askHost() {
    if (this.data.phase !== 'room' || this.data.hostBusy) return
    const roundId = this.roundId
    this.setData({ hostBusy: true })
    const payload = { caseId: this.data.story.id, phase: 'discussion', clueIds: (this.data.publicClueIds || []).slice() }
    requestHost(payload, '请交流已公开的线索，并通过独立渠道核实。', reply => {
      if (this.roundId !== roundId || this.data.phase !== 'room') return
      this.setData({ hostBusy: false })
      this.append(reply.source === 'model' ? 'AI主持人' : '主持人 · 预设', reply.text)
    })
  },
  previousMessage() { this.setData({ messagePage: Math.max(0, this.data.messagePage - 1) }) },
  nextMessage() { this.setData({ messagePage: Math.min(this.data.messages.length - 1, this.data.messagePage + 1) }) },
  toVote() {
    if (this.data.phase !== 'room') return
    const graph = this.data.script.caseGraph
    this.setData({ phase: 'event', bookOpen: false, eventStage: graph ? graph[0] : this.data.script.caseEvent, caseActionHistory: [] })
  },
  vote(e) {
    if (this.data.phase !== 'vote') return
    const seat = Number(e.currentTarget.dataset.index)
    if (!Number.isInteger(seat) || seat < 1 || seat > 4) return
    this.setData({ vote: seat })
  },
  safe(e) {
    if (this.data.phase !== 'event') return
    const choice = this.data.eventStage.choices[Number(e.currentTarget.dataset.index)]
    if (!choice || !['safe', 'caution', 'risk'].includes(choice.tone)) return
    const action = choice.tone === 'safe' ? 'safe' : choice.tone === 'risk' ? 'risk' : 'wait'
    const history = (this.data.caseActionHistory || []).concat({ label: choice.label, note: choice.note, tone: choice.tone })
    if (!choice.terminal && this.data.script.caseGraph && Number.isInteger(choice.nextStage)) {
      const eventStage = this.data.script.caseGraph[choice.nextStage]
      if (!eventStage) return
      this.setData({ action, caseActionText: choice.label, caseActionNote: choice.note, caseActionHistory: history, eventStage })
      return
    }
    this.setData({ action, caseActionText: choice.label, caseActionNote: choice.note, caseActionHistory: history, phase: 'vote' })
  },
  finish(timeout) {
    const timedOut = timeout === true
    if (this.data.phase === 'result' || (!timedOut && (this.data.vote === null || !this.data.action))) return
    const bots = [1, 2, 3, 4]
    const supporters = bots.filter(seat => seat !== this.fraudSeat).slice(0, 2)
    const ballots = [timedOut ? null : this.data.vote]
    bots.forEach((seat, index) => {
      const wrong = [0, 1, 2, 3, 4].find(candidate => candidate !== seat && candidate !== this.fraudSeat)
      ballots.push(timedOut ? null : supporters.includes(seat) ? this.fraudSeat : wrong)
    })
    const result = settle(ballots, this.fraudSeat, this.data.action, timedOut)
    result.fraudSeat = this.fraudSeat + 1
    result.ballotLabels = ballots.map((target, seat) => ({
      voter: seat + 1,
      target: target === null ? '未投票' : (target + 1) + '号'
    }))
    result.hadEarlierRisk = (this.data.caseActionHistory || []).slice(0, -1).some(item => item.tone === 'risk')
    this.stopClock()
    this.setData({ phase: 'result', result })
    const roundId = this.roundId
    const payload = { caseId: this.data.story.id, phase: 'review', clueIds: (this.data.publicClueIds || []).slice(), outcome: { caught: result.caught, safety: result.safety, timeout: result.timeout } }
    requestHost(payload, '身份判断与安全行动应分别复盘；请根据已公开线索独立核实。', reply => {
      if (this.roundId !== roundId || this.data.phase !== 'result') return
      this.setData({ aiReview: reply.text, reviewSource: reply.source === 'model' ? 'AI复盘' : '预设复盘' })
    })
  },
  reset() { this.roundId = (this.roundId || 0) + 1; this.stopClock(); this.setData({ phase: 'pick', shared: false, messages: [], vote: null, action: '', caseActionText: '', caseActionNote: '', caseActionHistory: [], publicClueIds: [], hostBusy: false, aiReview: '', timeText: '10:00' }) },
  back() { returnToLobby() }
})
