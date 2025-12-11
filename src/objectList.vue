<template>
  <div class="object-list">
    <ObjectProps :object="objects" />
  </div>
</template>

<script setup>
import { useOpenedObjectsStore } from './stores/openedObjects'
import ObjectProps from './ObjectProps.vue'

defineOptions({ name: 'ObjectList' })

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
