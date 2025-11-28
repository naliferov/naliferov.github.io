<template>
  <div class="frame" ref="dom">
    <div class="top-bar" ref="topBar">{{ objectName }}</div>
    <div class="app-container" ref="appContainer"></div>

    <img v-if="iSrc" :src="iSrc" style="display:block">
    <audio v-if="aSrc" :src="aSrc" autoplay controls></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, createApp } from 'vue'
import DragAndDrop from './dragAndDrop.js'
import MonacoEditor from './monacoEditor.vue'

const x = globalThis.x
const dnd = new DragAndDrop()

//on move finished, update the object

// this.updateObject({ 
//       repoName: this.targetOpenedObject.repoName,
//       objectId: this.targetOpenedObject.object.id,
//       openedObjectId: this.targetOpenedObject.id,
//       frameParams: {
//         left: this.targetDom.style.left,
//         top: this.targetDom.style.top
//       }
//     })

// if (x.updateObject) {
//     dnd.setUpdateObject(x.updateObject)
//   }


const props = defineProps({
  openedObject: {
    type: Object,
    required: true
  }
})

const dom = ref(null)
const topBar = ref(null)
const appContainer = ref(null)

const iSrc = ref('')
const aSrc = ref('')
const objectName = computed(() => props.openedObject.object?.name ?? '')

onMounted(async () => {
  const openedObject = props.openedObject

  const domStyle = dom.value.style
  if (openedObject.frameParams) {
    Object.assign(domStyle, openedObject.frameParams)
  }

  topBar.value.addEventListener('pointerdown', (e) => {
    //dnd.activate(e, dom.value, openedObject)
  })
  Object.assign(topBar.value.style, {
    background: '#e0e0e0',
    color: 'black',
    cursor: 'pointer'
  })

  const tObject = openedObject.object
  if (!tObject) return
  if (tObject.vueComponent) {
    const app = createApp(tObject.vueComponent)
    app.mount(appContainer.value)
    return
  }

  // <MonacoEditor
  //         :repoName="o.repoName"
  //         :objectId="o.object.id"
  //         :openedObjectId="o.id"
  //         :code="o.object.code"
  //         :position="o.position"
  //       />

  if (tObject.bin) {
    if (tObject.type === 'i') {
      iSrc.value = `data:image;base64,` + tObject.bin
    } else if (tObject.type === 'a') {
      aSrc.value = `data:audio/ogg;base64,` + tObject.bin
    }
  }
})
</script>

<style scoped>
.top-bar {
  background: #e0e0e0;
  color: black;
  cursor: pointer;
}
</style>
