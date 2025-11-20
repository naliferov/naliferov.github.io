<template>
  <div ref="codeContainer" class="monaco-editor"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  repoName: String,
  objectId: String,
  openedObjectId: String,
  code: String,
  position: Object
})

const codeContainer = ref(null)
const x = globalThis.x

onMounted(async () => {

  const monaco = await import('monaco-editor')
  const { default: EditorWorker } = await import(
    'monaco-editor/esm/vs/editor/editor.worker?worker'
  )
  const { default: JsonWorker } = await import(
    'monaco-editor/esm/vs/language/json/json.worker?worker'
  )
  const { default: TsWorker } = await import(
    'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
  )
  const { default: HtmlWorker } = await import(
    'monaco-editor/esm/vs/language/html/html.worker?worker'
  )
  const { default: CssWorker } = await import(
    'monaco-editor/esm/vs/language/css/css.worker?worker'
  )
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
