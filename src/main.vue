<template>
  <div class="app-container">
    <div class="left-sidebar" v-if="showSideBar">
      <div
        class="cmd-input"
        ref="inputTextDom"
        contenteditable="plaintext-only"
        @keydown="onKeyDown"
        @keyup="onKeyUp"
      ></div>

      <input
        class="file-input"
        v-if="showFileInput"
        ref="inputFileDom"
        type="file"
      />

      <div class="opened-objects-list">
        <div class="heading">Opened Objects</div>

        <div
          class="object"
          v-for="o in prepareObjects(openedObjects)"
          :key="o.id"
          @click="scrollToObject(o.id)"
          @dblclick="closeObject(o.id)"
        >
          {{ o.object.name }}
          <span v-if="o.opener"> ({{ o.opener }})</span>
        </div>
      </div>

      <ObjectManager
        repoName="sys"
        :objects="sys"
        :openObject="openObject"
      />
    </div>

    <OpenedObjectsComponent />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import ObjectManager from './objectList.vue'
import OpenedObjectsComponent from './openedObjects.vue'

const x = globalThis.x

const inputTextDom = ref(null)
const inputFileDom = ref(null)

const inputKey = 'sysInput'
const sys = x.sys
const user = x.user

const openedObjects = x.openedObjects
const showSideBar = x.showSideBar

const showFileInput = x.showFileInput

const openObject = async (repoName, id) => {
  const object = await x.getById(id)

  const data = { repoName, id: x.ulid(), objectId: id }
  if (object.bin) data.opener = 'frame'

  openedObjects.value.push(data)
}

const closeObject = (openedObjectId) => {
  openedObjects.value = openedObjects.value.filter((object) => {
    return object.id !== openedObjectId
  })
}

const scrollToObject = (openedObjectId) => {
  const dom = document.getElementById(openedObjectId)
  if (!dom) return
  dom.scrollIntoView()
}

const onKeyDown = (e) => {
  if (e.code === 'Enter') e.preventDefault()
}

const onKeyUp = async (e) => {
  if (e.code !== 'Enter') return

  const txt = inputTextDom.value?.textContent ?? ''

  x.kvRepo.set(inputKey, txt)

  const [cmd, ...args] = txt.split(' ')
  const cmdList = x.sysCMDs

  const file = inputFileDom.value ? inputFileDom.value.files[0] : null
  args.bin = file ? await x.readFileAsBase64(file) : null
  args.binMeta = file || null

  if (!cmdList[cmd]) return
  const o = cmdList[cmd]
  if (o.f) o.f(args)
}

const prepareObjects = (objects) => {
  const result = []
  for (const object of objects) {
    result.push({ ...object, object: x.getById(object.objectId) })
  }
  return result
}

const toggleSideBar = () => {
  showSideBar.value = !showSideBar.value
}

onMounted(() => {
  watch(
    showSideBar,
    (flag) => {
      if (!flag) return

      const inputCmd = x.kvRepo.get(inputKey) || 'Input cmd'
      if (inputCmd && inputTextDom.value) {
        inputTextDom.value.textContent = inputCmd
      }
    },
    { immediate: true, flush: 'post' },
  )
})

</script>

<style>
:root {
  --std-margin: 12px;
  --font: "JetBrains Mono", monospace;
}

body {
  font-family: var(--font);
  margin: 0;
}

.app-container {
  display: flex;
}

.sidebar-switch {
  cursor: pointer;
  color: white;
  background: white;
}

.left-sidebar {
  font-size: 16px;
  color: #333333;
}

.cmd-input {
  padding: 0 var(--std-margin);
  width: 180px;
  background: #a7d0dd;
  white-space: nowrap;
  outline: none;
}

.file-input {
  margin: var(--std-margin) 0 0 0;
}

.object-name {
  background: #e0e0e0;
}

.object-manager {
  padding: 0 var(--std-margin);
}

.object-manager .heading {
  font-weight: bold;
  margin: 10px 0;
}

.opened-objects-list {
  color: #333333;
  font-family: var(--font);
  font-size: 16px;
  padding: 0 var(--std-margin);
}

.opened-objects-list .heading {
  font-weight: bold;
  margin: 10px 0;
  white-space: nowrap;
}

.opened-objects {
  flex: 1;
}

.frames-container {
  position: absolute;
}

.frame {
  position: absolute;
  font-family: var(--font);
  font-size: 16px;
}

.object {
  cursor: pointer;
  white-space: nowrap;
}

input {
  font-family: var(--font);
  font-size: 16px;
}
</style>
