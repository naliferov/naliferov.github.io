import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { factoryDataSource } from '../dataSource/factoryDataSource.js'

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

// x.getOpenedObject = (objectId) => {
//   for (const openedObject of x.openedObjects.value) {
//     if (openedObject.id === objectId) {
//       return openedObject
//     }
//   }
// }

export const useObjectsStore = defineStore('objects', () => {

  const localeDataSource = factoryDataSource.getDataSourceById('local')

  const dataSource = ref({})
  const dataSourceName = ref(localeDataSource.get('dataSourceName') || 'default')

  const track = ref(localStorage.getItem('track') || 'sys')
  const objects = ref({})

  const init = async() => {
    await processDataSource()
    await fetchObjects()
  }

  watch(dataSourceName, (newDataSourceName) => {
    processDataSource()
    fetchObjects()
  })

  watch(track, (newTrack) => {
    fetchObjects()
  })

  const processDataSource = () => {
    const newDataSource = factoryDataSource.getDataSourceById(dataSourceName.value)
    if (newDataSource) {
      dataSource.value = newDataSource
    }

    if (!newDataSource || dataSourceName.value === 'default') {
      dataSource.value = factoryDataSource
      return
    }
  }

  const fetchObjects = async () => {
    const list = await dataSource.value.list(track.value)
    objects.value = list || {}
  }

  const setDataSourceName = (newDataSourceName) => {
    dataSourceName.value = newDataSourceName
    localStorage.setItem('dataSourceName', newDataSourceName)
  }

  const setTrack = (newTrack) => {
    track.value = newTrack
    localStorage.setItem('track', track.value)
  }

  const getById = (id) => objects.value[id]

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
    track,

    init,
    getById,
    addObject,
    updateObject,
    //fetchObjects,

    setDataSourceName,
    setTrack,
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