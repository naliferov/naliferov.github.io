const { onMounted, watch, reactive, computed, ref, toRaw } = $.vue

const purrData = reactive($.openedObject.object.data ? $.openedObject.object.data : {}) 
console.log(purrData)

watch(
  purrData, 
  () => {
    $.updateObject({ 
      repoName: $.openedObject.repoName,
      objectId: $.openedObject.objectId,
      data: toRaw(purrData)
    })
  },
  { deep: true }
)

const DataNode = {
  props: ['name', 'id', 'output', 'valueName'],
  setup: (props) => {
    
    const dom = ref(null)
    const currentData = computed(() => purrData[props.id])

    const inputData = computed(() => {
      const id = currentData.value.input
      return id ? purrData[id] : null
    })
    
    watch(
      inputData,
      (val) => {
        if (!val) return
        //apply processor to val.ref and write result to currentData.value.ref

        currentData.value.ref = val.ref + ' -- ' + 'cust V'
      },
      { deep: true, immediate: true }
    )

    onMounted(() => {
      const params = currentData.value.params
      if (!params) return
      dom.value.style.position = 'absolute'
      dom.value.style.top = params.top
      dom.value.style.left = params.left
    })
    
    const onPointerDown = (e) => {
      dnd.activate(e, dom.value, () => {
        if (!currentData.value.params) currentData.value.params = {}
        currentData.value.params.left = dom.value.style.left
        currentData.value.params.top = dom.value.style.top
      })
    }
    const onKeydown = (e) => { if (e.key === 'Enter') e.preventDefault() }
    const onKeyup = (e) => {
      if (e.key !== 'Enter') return
      
      const txt = dom.value.textContent.trim()
      if (txt.startsWith(':')) {
        const cmdStr = txt.split(':')[1]
        const [ cmd, ...args ] = cmdStr.split(' ')

        if (cmd === 'a') purrData[$.ulid()] = { ref: 'new node' }
        if (cmd === 'd') delete purrData[props.id]
        if (cmd === 'l') console.log(props.id, currentData)
        if (cmd === 'linkadd') {
          const [ id ] = args
          if (!id || !purrData[id]) return
          currentData.value.input = id.trim()
        }
        if (cmd === 'linkdel') {
          delete currentData.value.input
        }
        
        //dom.value.textContent = currentData.value.ref
        return
      }

      if (!inputData.value) {
        currentData.value.ref = txt
      }
    }

    return { 
      dom, 
      currentData,
      onKeydown, onKeyup, onPointerDown
    }
  },
  template: `
    <div 
        ref="dom" 
        style="border: 1px solid; min-width: 100px; position: absolute;"
        contenteditable="plaintext-only"
        @keydown="onKeydown($event)"
        @keyup="onKeyup($event)"
        @pointerdown="onPointerDown($event)"
    >
      {{ currentData.ref }}
    </div>
  `
}

return {
  components: { DataNode },
  setup: () => { 
    return { purrData }
  },
  template: `
    <div ref="dom" style="position: absolute; background: #f3f3f3; min-width: 250px; min-height: 250px;">
      <DataNode 
        v-for="(o, id) in purrData"
        :key="id"
        :id="id"
      />
    </div>
  `
}