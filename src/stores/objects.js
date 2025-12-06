import { defineStore } from 'pinia'
import { ref } from 'vue'
import { systemDataSource } from '../dataSource/systemDataSource.js'
import { redisDataSource } from '../dataSource/redisDataSource.js'

//todo integrate conception of tracks of objects

// x.set = async (k, v) => await x.sysRedis.hset('sys', { [k]: v } )
// x.get = async (k) => await x.sysRedis.hget('sys', k)
// x.del = async (k) => await x.sysRedis.hdel('sys', k)

// x.sysRepo = {
//   set: async (k, v) => await x.sysRedis.hset('sys', { [k]: v } ),
//   get: async (k) => await x.sysRedis.hget('sys', k),
//   del: async (k) => await x.sysRedis.hdel('sys', k),
// }
// x.userRepo = {
//   set: async (k, v) => await x.userRedis.hset('user', { [k]: v } ),
//   get: async (k) => await x.userRedis.hget('user', k),
//   del: async (k) => await x.userRedis.hdel('user', k),
// }

// {
//   const key = 'showSideBar'

//   vue.watch(
//     x.showSideBar,
//     (flag) => flag ? x.kvRepo.on(key) : x.kvRepo.off(key),
//   )
// }

// {
//   const key = 'showFileInput'
//   if (x.kvRepo.get(key)) x[key].value = true

//   vue.watch(
//     x[key],
//     (flag) => flag ? x.kvRepo.on(key) : x.kvRepo.off(key),
//   )
// }

// x.getByName = (name, repoName = 'sys') => {
//   const objectsRef = repoName === 'sys' ? x.sys : x.user
//   const objects = objectsRef.value

//   for (const k in objects) {
//     const o = objects[k]
//     if (o.name === name) return o
//   }
// }

// x.getObjectData = async (objectId, repoName = 'sys') => {
//   const object = await x.getById(objectId, repoName)
//   return object?.data
// }

// x.updateObject = (update) => {
//   const repoRef = update.repoName === 'sys' ? x.sys : x.user
//   const object = repoRef.value[update.objectId]
//   if (!object) return

//   const o = vue.toRaw(object)
//   if (update.data) {
//     o.data = update.data
//     x.set(o.id, o)
//   }

//   const openedObject = x.getOpenedObject(update.openedObjectId)
//   if (!openedObject) return
//   if (update.frameParams) {
//     openedObject.frameParams = update.frameParams
//   }
// }

// x.getOpenedObject = (objectId) => {
//   for (const openedObject of x.openedObjects.value) {
//     if (openedObject.id === objectId) {
//       return openedObject
//     }
//   }
// }


export const useObjectsStore = defineStore('objects', () => {

  const dataSourceName = ref('system')
  const trackName = ref('default')
  const objects = ref({})

  if (dataSourceName.value === 'system') {
    //dataSource
  }

  const setDataSourceName = (dataSourceName) => {
    dataSourceName.value = dataSourceName
  }

  const setTrackName = (trackName) => {
    trackName.value = trackName
  }

  const fetchObjects = async () => {
    //setObjects(await redis.hgetall('sys'))
  }

  const getById = (id) => objects.value[id]

  const setObjects = (list) => {
    objects.value = list || {}
  }

  const addObject = (obj) => {
    objects.value = {
      ...objects.value,
      [obj.id]: obj
    }
  }

  const updateObject = (id, patch) => {
    const idx = objects.value.findIndex(o => o.id === id)
    if (idx === -1) return
    objects.value[idx] = { ...objects.value[idx], ...patch }
  }

  return {
    objects,
    dataSourceName,
    trackName,

    getById,
    setObjects,
    addObject,
    updateObject,
    fetchObjects,

    setDataSourceName,
    setTrackName,
  }
})


    
      //const arr = Object.values(await x.sysRedis.hgetall('sys'))

      // const addObject = (id, vueComponent) => {
//   const object = { id, name: id, vueComponent, notSaveable: true }
//   arr.push(object)
// }

// const { default: frame } = await import('./frame.vue')
// addObject('frame', frame)
// const { default: grid } = await import('./grid.vue')
// addObject('grid', grid)
// const { default: purrData } = await import('./purrData.vue')
// addObject('purrData', purrData)
// const { default: sequencer } = await import('./sequencer.vue')
// addObject('sequencer', sequencer)

// arr.sort((a, b) => (a.name > b.name) - (a.name < b.name));
// x.sys.value = Object.fromEntries(arr.map(o => [o.id, o]))

// x.getById = (id, repoName = 'sys') => {
//   const objectsRef = repoName === 'sys' ? x.sys : x.user
//   return objectsRef.value[id]
// }


      //this.objects = await x.sysRedis.hgetall('objects')