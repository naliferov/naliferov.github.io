import { defineStore } from 'pinia'
import { ulid } from 'ulid'
import * as vue from 'vue'
import { useObjectsStore } from './objects'

const STORAGE_KEY = 'openedObjects'

// function loadFromStorage() {
//   const raw = x.kvRepo.get(STORAGE_KEY) ?? []
//   let openedObjects = typeof raw === 'string' ? JSON.parse(raw) : raw

//   openedObjects = openedObjects.filter(o => {
//     return o.objectId && x.sys.value[o.objectId]
//   })

//   return openedObjects.map(o => ({
//     ...o,
//     object: x.getById(o.objectId),
//   }))
// }

// function saveToStorage(openedObjects) {
//   const arr = openedObjects.map(item => {
//     const o = JSON.parse(JSON.stringify(item))
//     delete o.object
//     return o
//   })
//   x.kvRepo.set(STORAGE_KEY, JSON.stringify(arr))
// }

{
  // const data = await x.kvRepo.get('openedObjects') ?? []
  // let openedObjects = typeof data === 'string' ? JSON.parse(data) : data
  // openedObjects = openedObjects.filter((o) => {
  //   return o.objectId && x.sys.value[o.objectId]
  // })
  // openedObjects = openedObjects.map(o => ({
  //   ...o,
  //   object: x.getById(o.objectId)
  // }))

  // x.openedObjects.value = openedObjects

  // x.openObject = async (repoName, id) => {
  //   const object = await x.getById(id)
  //   if (!object) return

  //   const openedObject = { 
  //     repoName, id: x.ulid(),
  //     objectId: id,
  //     object
  //   }
  //   x.openedObjects.value.push(openedObject)
  // }

  // x.closeObject = (openedObjectId) => {
  //   x.openedObjects.value = x.openedObjects.value.filter((object) => {
  //     return object.id !== openedObjectId
  //   })
  // }

  // vue.watch(
  //   x.openedObjects,
  //   (newOpenedObjects) => {
  //     const arr = newOpenedObjects.map(item => {
  //       const o = JSON.parse(JSON.stringify(item))
  //       delete o.object
  //       return o
  //     })
  //     x.kvRepo.set('openedObjects', JSON.stringify(arr))
  //   },
  //   { deep: true }
  // )
}

export const useOpenedObjectsStore = defineStore('openedObjects', () => {

  const objectsStore = useObjectsStore()
  const openedObjects = vue.ref([])

  const getByOpenedId = (openedId) => {
    return openedObjects.value.find(o => o.id === openedId)
  }

  const getByObjectId = (objectId) => {
    return openedObjects.value.find(o => o.objectId === objectId)
  }

  const syncXRef = () => {
    if (!x.openedObjects) {
      x.openedObjects = vue.ref([])
    }
    x.openedObjects.value = openedObjects.value
  }

  const init = () => {
    const list = loadFromStorage()
    openedObjects.value = list
    syncXRef()
  }

  const persist = () => {
    saveToStorage(openedObjects.value)
    syncXRef()
  }

  const add = async (repoName, objectId) => {

    const object = await objectsStore.getById(objectId, repoName)
    console.log(repoName, objectId, object)

    if (!object) return

    openedObjects.value.push({
      repoName,
      id: ulid(),
      object,
    })
  }

  const remove = (id) => {
    openedObjects.value = openedObjects.value.filter(o => o.id !== id)
    //persist()
  }

  const updateFrameParams = (openedObjectId, frameParams) => {
    const o = openedObjects.value.find(o => o.id === openedObjectId)
    if (!o) return
    o.frameParams = { ...(o.frameParams || {}), ...frameParams }
    persist()
  }

  return {
    openedObjects,
    init,
    add,
    remove,
    updateFrameParams,
  }
})