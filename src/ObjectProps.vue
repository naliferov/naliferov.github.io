<template>
  <div class="object-view" 
       v-for="(v, k) in object"
       :key="k"
       @contextmenu.prevent.stop="isObjectOrArray(v) && toggleCtxMenu(v)">
    <b>
      <span
        class="extend-collapse"
        v-if="isObjectOrArray(v) && !isExtended(v)"
        @click="extendObject(v)">+</span>
      <span
        class="extend-collapse"
        v-else-if="isObjectOrArray(v) && isExtended(v)"
        @click="collapseObject(v)">-</span>
        
      <span v-if="!isArray(object)" class="key">{{ k + ': '}}</span>
    </b>

    <span v-if="showCtxMenu(v)" class="addItem">{{ ' + ' }}</span>

    <ObjectProps 
      v-if="isObjectOrArray(v) && isExtended(v)" 
      :object="v"
    />
    <span v-else-if="isObject(v) || isArray(v)" class="dots" @click="extendObject(v)">... </span>
    <span v-else class="primitive">{{ v }}</span>
  </div>
</template>

<script setup>
const props = defineProps({ object: Object })
const x = '_x'

const isObject = (v) => typeof v === 'object' && !Array.isArray(v) && v !== null
const isArray = (v) => Array.isArray(v)
const isObjectOrArray = (v) => typeof v === 'object' && v !== null

const isExtended = (v) => v?.[x]?.extend
const collapseObject = (v) => {
  if (v[x]) delete v[x].extend
}
const extendObject = async (v) => {
  if (!v[x]) v[x] = {}
  v[x].extend = true
}

const toggleCtxMenu = (v) => {
  if (!v[x]) v[x] = {}
  v[x].ctxMenu = !v[x].ctxMenu
}

const showCtxMenu = (v) => v[x]?.ctxMenu

</script>

<style scoped>
  .object-view {
    margin-left: 15px;
  }
  .extend, .collapse, .dots {
    cursor: pointer;
  }
  .extend-collapse {
    margin-right: 3px;
    width: 10px;
    display: inline-block;
    cursor: pointer;
  }
</style>
