<template>
  <div class="opened-objects" :style="{ height: height + 'px', overflow: 'auto' }">
    <div v-for="o in preparedObjects" :key="o.id">
      <Frame v-if="o.opener === 'frame'" :openedObject="o" />
      <div v-else>
        <div :id="o.id" class="object-name">{{ o.object.name }}</div>
        <MonacoEditor
          :repoName="o.repoName"
          :objectId="o.object.id"
          :openedObjectId="o.id"
          :code="o.object.code"
          :position="o.position"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MonacoEditor from './monacoEditor.vue'
import Frame from './frame.vue'

const x = globalThis.x

const preparedObjects = computed(() =>
  x.openedObjects.value.map(o => ({
    ...o,
    object: x.getById(o.objectId),
  })),
)

const height = window.innerHeight

</script>

<style scoped>
.opened-objects {
  flex: 1;
}

.object-name {
  background: #e0e0e0;
  font-weight: 500;
  white-space: nowrap;
}
</style>
