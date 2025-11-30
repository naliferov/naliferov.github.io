<template>
  <div class="opened-objects">
    <div v-for="o in openedObjectsStore.openedObjects" :key="o.id">
      object:{{ o.id }}
      <!-- <Frame :openedObject="o" /> -->
    </div>
  </div>
</template>

<script setup>
import Frame from './Frame.vue'
import { useOpenedObjectsStore } from './stores/openedObjects'

const openedObjectsStore = useOpenedObjectsStore()
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
