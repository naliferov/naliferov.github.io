import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: 'https://holy-redfish-7937.upstash.io',
  token: localStorage.getItem('token') || 'Ah8BAAIgcDH8iJl1rQK-FZD7U3lrmcixchbsva9z2HQRDxtGlxLOrA',
})

export const redisDataSource = {
  keys: async () => {
    return await redis.keys('*')
  },
  list: async (key) => {
    return await redis.hgetall(key)
  },
  get: async (key, id) => {
    return await redis.hget(key, id)
  },
  set: async (key, id, value) => {
    await redis.hset(key, { [id]: value })
  },
  remove: async (key, id) => {
    await redis.hdel(key, id)
  }
}