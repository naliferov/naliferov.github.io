<template>
  <div ref="codeContainer" class="monaco-editor"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'

self.MonacoEnvironment = {
    getWorker(_moduleId, label) {
      if (label === 'json') {
        return new JsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new CssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new HtmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new TsWorker()
      }
      return new EditorWorker()
    },
  }

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
