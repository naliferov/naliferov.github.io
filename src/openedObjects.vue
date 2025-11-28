<template>
  <div class="opened-objects" :style="{ height: height + 'px' }">
    <div v-for="o in objects" :key="o.id">
      <Frame :openedObject="o" />
    </div>
  </div>
</template>

<script setup>
import Frame from './frame.vue'

const x = globalThis.x
const objects = x.openedObjects
const height = window.innerHeight

</script>

<style scoped>
.opened-objects {
  display: flex;
  gap: 10px;
  flex: 1;
  overflow: auto;
}

.flex-1 {
  flex: 1;
}

.object-name {
  background: #e0e0e0;
  font-weight: 500;
  white-space: nowrap;
}
</style>
