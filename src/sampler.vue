<template>
  <div ref="dom"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dom = ref(null)

onMounted(() => {
  const d = document.createElement('div')
  d.style.width = '32px'
  d.style.height = '32px'
  d.style.background = 'red'
  dom.value.append(d)
})
</script>