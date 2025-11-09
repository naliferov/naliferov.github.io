import { defineComponent, onMounted, ref, createApp } from 'vue'

class DragAndDrop {
  constructor() {
    this.targetDom = null
    this.targetOpenedObject = null
    this.xShift = 0
    this.yShift = 0

    this.updateObject = null
  }

  setUpdateObject(fn) {
    this.updateObject = fn
  }

  activate(event, targetDom, targetOpenedObject) {
    this.targetDom = targetDom
    this.targetOpenedObject = targetOpenedObject

    const rect = this.targetDom.getBoundingClientRect()
    this.xShift = event.clientX - rect.left
    this.yShift = event.clientY - rect.top

    document.addEventListener('pointermove', this.onPointerMove)
    document.addEventListener('pointerup', this.onPointerUp)
  }

  onPointerMove = (e) => {
    if (!this.targetDom) return
    this.targetDom.style.left = (e.clientX - this.xShift) + 'px'
    this.targetDom.style.top  = (e.clientY - this.yShift) + 'px'
  }

  onPointerUp = () => {
    document.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('pointerup', this.onPointerUp)

    if (!this.targetDom) return

    this.updateObject({ 
      repoName: this.targetOpenedObject.repoName,
      objectId: this.targetOpenedObject.object.id,
      openedObjectId: this.targetOpenedObject.id,
      frameParams: {
        left: this.targetDom.style.left,
        top: this.targetDom.style.top
      }
    })

    this.targetDom = null
    this.targetOpenedObject = null
  }
}

const dnd = new DragAndDrop

export default defineComponent({
  name: 'Frame',
  props: ['id', 'openedObject'],
  setup: (props) => {

    const openedObject = props.openedObject
    if ($.updateObject) {
      dnd.setUpdateObject($.updateObject)
    }

    const dom = ref(null)
    const appContainer = ref(null)
    const topBar = ref(null)
    
    const iSrc = ref('')
    const aSrc = ref('')
    const vSrc = ref('')

    const onMountedFn = async () => {
      
      let domStyle = dom.value.style
      domStyle.position = 'absolute'
      domStyle.zIndex = 10
      domStyle.top = 0
      if (openedObject.frameParams) {
        for (let key in openedObject.frameParams) {
          domStyle[key] = openedObject.frameParams[key]
        }
      }

      topBar.value.addEventListener('pointerdown', (e) => {
        dnd.activate(e, dom.value, openedObject)
      })
      topBar.value.style.background = '#e0e0e0'
      topBar.value.style.color = 'black'
      topBar.value.style.cursor = 'pointer'
      

      const shadowRoot = appContainer.value.attachShadow({ mode: 'open' })
      const styleDom = document.createElement('style')
      shadowRoot.append(styleDom)
      const containerDom = document.createElement('div')
      shadowRoot.append(containerDom)


      const tObject = openedObject.object
      if (!tObject) return

      if (tObject.code) {
        const vueComp = await $.runById(openedObject.objectId, {
          openedObject,
          updateObject: $.updateObject 
        })
        const app = createApp(vueComp)
        app.mount(containerDom)
        return
      } else if (tObject.bin) {
        if (tObject.type === 'i') {
          iSrc.value = `data:image;base64,` + tObject.bin
        } else if (tObject.type === 'a') {
          aSrc.value = `data:audio/ogg;base64,` + tObject.bin
        }
      }
    }
    onMounted(onMountedFn)

    return { 
      dom, appContainer, topBar,
      objectName: props.openedObject.object.name,
      iSrc, aSrc
    }
  },
  template: `
    <div class="frame" ref="dom">
      <div class="top-bar" ref="topBar">{{ objectName }}</div>
      <div class="app-container" ref="appContainer"></div>

      <img v-if="iSrc" :src="iSrc" style="display:block">
      <audio autoplay v-if="aSrc" :src="aSrc" controls></audio>
    </div>
  `
})