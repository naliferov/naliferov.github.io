<template>
  <div
    ref="dom"
    style="border: 1px solid; min-width: 100px; position: absolute;"
    contenteditable="plaintext-only"
    @keydown="onKeydown"
    @keyup="onKeyup"
    @pointerdown="onPointerDown"
  >
    {{ currentData.ref }}
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// внешние сущности, как у тебя в коде
// purrData, dnd, $.ulid — считаю глобальными
// если нужно — добавлю импорты
const props = defineProps({
  name: String,
  id: String,
  output: String,
  valueName: String
})

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
    // apply processor
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

const onKeydown = (e) => {
  if (e.key === 'Enter') e.preventDefault()
}

const onKeyup = (e) => {
  if (e.key !== 'Enter') return

  const txt = dom.value.textContent.trim()

  if (txt.startsWith(':')) {
    const cmdStr = txt.split(':')[1]
    const [cmd, ...args] = cmdStr.split(' ')

    if (cmd === 'a') purrData[$.ulid()] = { ref: 'new node' }
    if (cmd === 'd') delete purrData[props.id]
    if (cmd === 'l') console.log(props.id, currentData.value)
    if (cmd === 'linkadd') {
      const [id] = args
      if (!id || !purrData[id]) return
      currentData.value.input = id.trim()
    }
    if (cmd === 'linkdel') {
      delete currentData.value.input
    }

    return
  }

  if (!inputData.value) {
    currentData.value.ref = txt
  }
}
</script>

<style scoped>
/* можно вынести всё из inline-style — если захочешь, перепишу */
</style>