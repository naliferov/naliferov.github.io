<template>
  <div class="object-props" v-for="(v, k) in object" :key="k">
    <b>
      {{ isObject(v) && isExtended(v) ? '-' : '+' }} {{ k }}:
    </b>
    <ObjectProps v-if="isObject(v) && isExtended(v)" :object="v"/>
    
    <span v-else-if="isObject(v)" class="regular-object">... </span>
    
    <span v-else class="primitive-value">
  {{ v }}
</span>
  </div>
</template>

<script setup>

defineOptions({ name: 'ObjectProps' })

const isObject = (v) => typeof v === 'object' && !Array.isArray(v) && v !== null
const isExtended = (v) => v._extended

const props = defineProps({ object: Object })
</script>

<style scoped>
  .object-props {
    margin-left: 10px;
  }
</style>
