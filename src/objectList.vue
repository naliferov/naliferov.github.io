<template>
  <div class="object-list">
    <div class="heading">Objects</div>
    <div
      v-for="(o, objectId) in objects"
      :key="objectId"
      class="object"
      @click="openedObjectsStore.add(repoName, objectId)"
    >
      {{ o.name }}
    </div>
  </div>
</template>

<script setup>
import { useOpenedObjectsStore } from './stores/openedObjects'

const props = defineProps({
  repoName: String,
  objects: Object,
})

const openedObjectsStore = useOpenedObjectsStore()

</script>

<style scoped>
.object-list .heading {
  font-weight: bold;
  margin: 10px 0;
}

.object {
  cursor: pointer;
  white-space: nowrap;
}
</style>
