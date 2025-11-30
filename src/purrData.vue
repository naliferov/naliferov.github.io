<template>
  <div
    ref="dom"
    style="position: absolute; background: #f3f3f3; min-width: 250px; min-height: 250px;"
  >
    <PurrDataNode
      v-for="(o, id) in purrData"
      :key="id"
      :id="id"
    />
  </div>
</template>

<script setup>
import { reactive, watch, ref, toRaw } from 'vue'
import PurrDataNode from './PurrDataNode.vue'

//props: STORE, OBJECT_ID

const dom = ref(null)
const purrData = reactive({})

watch(
  purrData,
  () => {
    // $.updateObject({
    //   repoName: $.openedObject.repoName,
    //   objectId: $.openedObject.objectId,
    //   data: toRaw(purrData)
    // })
  },
  { deep: true }
)
</script>

<style scoped>
/* при желании можно вынести inline-стили сюда */
</style>
