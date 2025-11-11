<template>
  <div ref="dom"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dom = ref(null)

onMounted(() => {
  const d = document.createElement('div')
  d.setAttribute('contenteditable', 'plaintext-only')
  d.textContent = 'ok ok ok this is input'
  d.style.background = 'lightgray'
  dom.value.append(d)
})
</script>