function dealRoles(random = Math.random) {
  const roles = [0, 1, 2, 3, 4]
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[roles[i], roles[j]] = [roles[j], roles[i]]
  }
  return roles
}
function settle(votes, fraudSeat, action, timeout) {
  const count = votes.filter(vote => vote === fraudSeat).length
  return {
    caught: !timeout && count >= 3,
    timeout,
    votes: count,
    ballots: votes.slice(),
    safety: action === 'safe' ? 'blocked' : action === 'pay' ? 'paid' : action === 'risk' ? 'risk' : 'unresolved'
  }
}
module.exports = { dealRoles, settle }
