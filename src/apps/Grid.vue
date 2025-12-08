<template>
  <div ref="dom"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const dom = ref(null)

onMounted(() => {
  const c = document.createElement('div')
  Object.assign(c.style, {
    display: 'grid',
    gridTemplateColumns: 'repeat(16,32px)',
    gridTemplateRows: 'repeat(16,32px)',
    gap: '2px'
  })
  dom.value.append(c)

  for (let i = 0; i < 256; i++) {
    const d = document.createElement('div')
    d.style.width = '32px'
    d.style.height = '32px'
    d.style.background = 'grey'
    c.append(d)
  }
})
</script>
<style scoped>
</style>