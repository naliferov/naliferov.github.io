import { redisDataSource } from './redisDataSource.js'
import { localDataSource } from './localDataSource.js'

const configs = {
  local: {
    id: 'local',
    name: 'local',
    type: 'localDataSource',
  },
  system: {
    id: 'system',
    name: 'system',
    type: 'dataSource',
  },
  systemRedis: {
    id: 'systemRedis',
    name: 'systemRedis',
    type: 'dataSource',
    config: {
      url: 'https://holy-redfish-7937.upstash.io',
      token: localStorage.getItem('token') || 'Ah8BAAIgcDH8iJl1rQK-FZD7U3lrmcixchbsva9z2HQRDxtGlxLOrA',
    },
  },
}

//use localStore for get more DataSources

export const factoryDataSource = {

  getDataSourceById: (id) => {
    const config = configs[id]
    if (!config) return null

    if (id === 'local') return localDataSource    

    //if (config.type === 'redisDataSource') return redisDataSource
  },

  list: () => {
    return configs
  },
  get: (dataSourceId) => {
    return configs[dataSourceId]
  },
  set: (dataSourceId, value) => {
    configs[dataSourceId] = value
  },
  remove: (dataSourceId) => {
    delete configs[dataSourceId]
  },
}