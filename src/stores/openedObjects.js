import { defineStore } from 'pinia'
import { ulid } from 'ulid'
import * as vue from 'vue'
import { useObjectsStore } from './objects'
import { localStore } from '../dataSource/localStoreDataSource.js'

const STORAGE_KEY = 'openedObjects'

export const useOpenedObjectsStore = defineStore('openedObjects', () => {
  
  const objectsStore = useObjectsStore()
  const openedObjects = vue.ref([])

  const fetchObjects = () => {

    const list = JSON.parse(localStore.get(STORAGE_KEY) ?? '[]')

    for (let i = 0; i < list.length; i++) {
      add(list[i].repoName, list[i].objectId)
    }

    startWatch()
  }

  const startWatch = () => {
    vue.watch(
      openedObjects,
      (newOpenedObjects) => save(newOpenedObjects, localStore),
      { deep: true }
    )
  }

  const getByOpenedId = (openedId) => {
    return openedObjects.value.find(o => o.id === openedId)
  }

  const getByObjectId = (objectId) => {
    return openedObjects.value.find(o => o.objectId === objectId)
  }

  const add = (repoName, objectId) => {
    const object = objectsStore.getById(objectId, repoName)
    if (!object) return

    openedObjects.value.push({
      repoName,
      id: ulid(),
      object,
      objectId: objectId,
    })
  }

  const save = (objects, localStore) => {
    const arr = objects.map(item => {
      const o = JSON.parse(JSON.stringify(item))
      delete o.object
      return o
    })
    localStore.set(STORAGE_KEY, JSON.stringify(arr))
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
    fetchObjects,
    add,
    remove,
    updateFrameParams,
  }
})