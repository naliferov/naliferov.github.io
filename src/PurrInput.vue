<template>
  <div ref="dom">
    <input ref="inputDom" @input="onInput"></input>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dom = ref(null)
const inputDom = ref(null)

const onInput = (e) => {
  if (e.key !== 'Enter') return
  emit('on-update', e.target.value)
}

onMounted(() => {
  //const d = document.createElement('div')
  //d.textContent = ''
  //dom.value.append(d)
})
</script>