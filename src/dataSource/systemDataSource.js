const data = {
  redis: {
    id: 'redis',
    name: 'Redis',
    json: '{}'
  },
  system: {
    id: 'system',
    name: 'System',
    json: '{}'
  },
}

//use localStore for get more DataSources

const systemDataSource = {
  id: 'system',
  name: 'System',
  list: async (track) => {
    return await redis.hgetall('sys')
  },
  get: async (track, id) => {
    return await redis.hget('sys', id)
  },
  set: async (track,id, value) => {
    await data['redis'].set(track, id, value)
  },
  remove: async (track, id) => {
  }
}