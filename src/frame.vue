<template>
  <div class="frame" ref="dom">
    <div class="top-bar" ref="topBar">{{ objectName }}</div>
    <div class="app-container" ref="appContainer"></div>

    <img v-if="iSrc" :src="iSrc" style="display:block">
    <audio v-if="aSrc" :src="aSrc" autoplay controls></audio>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DragAndDrop from './dragAndDrop.js'

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
  id: [String, Number],
  openedObject: {
    type: Object,
    required: true
  }
})

const dom = ref(null)
const appContainer = ref(null)
const topBar = ref(null)

const iSrc = ref('')
const aSrc = ref('')
const objectName = computed(() => props.openedObject.object?.name ?? '')


onMounted(async () => {
  const openedObject = props.openedObject

  const domStyle = dom.value.style
  domStyle.position = 'absolute'
  domStyle.zIndex = 10
  domStyle.top = 0

  if (openedObject.frameParams) {
    for (const key in openedObject.frameParams) {
      domStyle[key] = openedObject.frameParams[key]
    }
  }

  topBar.value.addEventListener('pointerdown', (e) => {
    //dnd.activate(e, dom.value, openedObject)
  })  //

  Object.assign(topBar.value.style, {
    background: '#e0e0e0',
    color: 'black',
    cursor: 'pointer'
  })

  const shadowRoot = appContainer.value.attachShadow({ mode: 'open' })
  const styleDom = document.createElement('style')
  shadowRoot.append(styleDom)
  const containerDom = document.createElement('div')
  shadowRoot.append(containerDom)

  const tObject = openedObject.object
  if (!tObject) return

  if (tObject.vueComponent) {
    console.log(tObject.vueComponent)
    //const app = createApp(vueComp)
    //app.mount(containerDom)
    return
  }

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
.frame {
  position: absolute;
  z-index: 10;
}

.top-bar {
  background: #e0e0e0;
  color: black;
  cursor: pointer;
}
</style>
