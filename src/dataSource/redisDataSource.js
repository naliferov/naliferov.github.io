import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: 'https://holy-redfish-7937.upstash.io',
  token: localStorage.getItem('token') || 'Ah8BAAIgcDH8iJl1rQK-FZD7U3lrmcixchbsva9z2HQRDxtGlxLOrA',
})

const data = {
  id: 'redis',
  name: 'Redis',
  list: async (track) => {
    return await redis.hgetall(track)
  },
  get: async (track, id) => {
    return await redis.hget(track, id)
  },
  set: async (track, id, value) => {
    await redis.hset(track, { [id]: value })
  },
  remove: async (track, id) => {
    await redis.hdel(track, id)
  }
}

export default data