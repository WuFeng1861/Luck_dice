import api from './axios'

export const getCurrentGame = async () => {
  const response = await api.get('/api/battle-royale/current')
  return response
}

export const placeBets = async (bets) => {
  const response = await api.post('/api/battle-royale/bet', { bets })
  return response
}