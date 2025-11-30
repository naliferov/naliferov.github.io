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
          v-for="o in openedObjectsStore.openedObjects"
          :key="o.id"
          @dblclick="openedObjectsStore.remove(o.id)"
        >
          {{ o.object.name }}
          <span v-if="o.opener"> ({{ o.opener }})</span>
        </div>
      </div>

      <ObjectList
        repoName="sys"
        :objects="objectsStore.objects"
      />
    </div>

    <OpenedObjectsComponent />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import ObjectList from './ObjectList.vue'
import OpenedObjectsComponent from './OpenedObjects.vue'
import { useObjectsStore } from './stores/objects'
import { useOpenedObjectsStore } from './stores/openedObjects'

const objectsStore = useObjectsStore()
objectsStore.fetchObjects()

const openedObjectsStore = useOpenedObjectsStore()


const inputTextDom = ref(null)
const inputFileDom = ref(null)
const inputKey = 'sysInput'

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

  if (!cmdList[cmd]) {
    inputTextDom.value.textContent = 'Input cmd'
    return
  }

  const o = cmdList[cmd]
  if (o.f) o.f(args)
}

onMounted(() => {
  //if (!flag) return
  //     const inputCmd = x.kvRepo.get(inputKey) || 'Input cmd'
  //     if (inputCmd && inputTextDom.value) {
  //       inputTextDom.value.textContent = inputCmd
  //     }

  // setInterval(() => {
  //   console.log(objects)
  // }, 1000)
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

.object {
  cursor: pointer;
  white-space: nowrap;
}

input {
  font-family: var(--font);
  font-size: 16px;
}
</style>
