<template>
  <div class="app-container">
    
    <div class="left-sidebar">
      <div
        class="cmd-input"
        ref="inputTextDom"
        contenteditable="plaintext-only"
        @keydown="onKeyDown"
        @keyup="onKeyUp"
      ></div>

      <div class="container">
        <input
        class="file-input"
        v-if="showFileInput"
        ref="inputFileDom"
        type="file"
      />

      <div><b>Data source:</b> {{ objectsStore.dataSourceName }}</div>
      <div><b>Track:</b> {{ objectsStore.track }}</div>

      <!-- <div class="opened-objects-list">
        <div class="heading">Opened Objects</div>
        <div
          class="object"
          v-for="o in openedObjectsStore.openedObjects"
          :key="o.id"
          @dblclick="openedObjectsStore.remove(o.id)"
        >
          {{ o.object.name }}
        </div>
      </div> -->

      <ObjectList
        repoName="sys"
        :objects="objectsStore.objects"
      />
    </div>

    </div>

    <div class="opened-objects">
        <div v-for="o in openedObjectsStore.openedObjects" :key="o.id">
          <Frame :openedObject="o" />
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ObjectList from './ObjectList.vue'
import Frame from './Frame.vue'
import { useObjectsStore } from './stores/objects'
import { useOpenedObjectsStore } from './stores/openedObjects'
import { runCmd } from './useCommands.js'
import { factoryDataSource } from './dataSource/factoryDataSource.js'

const localeDataSource = factoryDataSource.getDataSourceById('local')

const objectsStore = useObjectsStore()
const openedObjectsStore = useOpenedObjectsStore()

objectsStore.init().then(() => {
  openedObjectsStore.init()
})

const showFileInput = ref(false)
const inputTextDom = ref(null)
//const inputFileDom = ref(null)

const onKeyDown = (e) => {
  if (e.code === 'Enter') e.preventDefault()
}

const onKeyUp = async (e) => {
  if (e.code !== 'Enter') return

  const cmdTxt = inputTextDom.value?.textContent ?? ''
  const [cmd, ...args] = cmdTxt.split(' ')

  localeDataSource.set('cmdInput', cmdTxt)

  //const file = inputFileDom.value ? inputFileDom.value.files[0] : null
  //args.bin = file ? await x.readFileAsBase64(file) : null
  //args.binMeta = file || null

  const result = await runCmd(cmd, args)
  // if (!result) {
  //   inputTextDom.value.textContent = 'Input cmd'
  //   return
  // }
}

onMounted(() => {
  const txt = localeDataSource.get('cmdInput') || 'Input cmd'
  inputTextDom.value.textContent = txt
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

.container {
  margin-top: var(--std-margin);
  padding: 0 var(--std-margin);
}

.left-sidebar {
  font-size: 16px;
  color: #333333;
}

.cmd-input {
  padding: 0 var(--std-margin);
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

.opened-objects-list {
  color: #333333;
  font-family: var(--font);
  font-size: 16px;
}

.opened-objects-list .heading {
  font-weight: bold;
  margin: 10px 0;
  white-space: nowrap;
}

.object {
  cursor: pointer;
  white-space: nowrap;
}

input {
  font-family: var(--font);
  font-size: 16px;
}

.opened-objects {
  display: flex;
  gap: 10px;
  flex: 1;
  overflow: auto;
}

.flex-1 {
  flex: 1;
}

.object-name {
  background: #e0e0e0;
  font-weight: 500;
  white-space: nowrap;
}
</style>
