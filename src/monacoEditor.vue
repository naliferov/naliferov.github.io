<template>
  <div ref="codeContainer" class="monaco-editor"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  repoName: String,
  objectId: String,
  openedObjectId: String,
  code: String,
  position: Object
})

const codeContainer = ref(null)
const x = globalThis.x

onMounted(() => {
  const editor = monaco.editor.create(codeContainer.value, {
    value: props.code,
    language: 'javascript',
    theme: 'vs-dark',
    automaticLayout: true,
    fontFamily: 'Jetbrains Mono',
    fontSize: 15
  })

  editor.onDidChangeModelContent(() => {
    x.updateObject({
      repoName: props.repoName,
      objectId: props.objectId,
      openedObjectId: props.openedObjectId,
      code: editor.getValue(),
      position: editor.getPosition()
    })
  })

  if (props.position) {
    editor.revealPositionInCenter(props.position)
  }

  editor.layout()
})
</script>

<style scoped>
.monaco-editor {
  margin: 0;
  height: 100vh;
}
</style>
