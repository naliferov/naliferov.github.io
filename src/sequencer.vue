<template>
  <div ref="dom">
    <input ref="inputDom" @keyup="onInput" />
    <br/><br/>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as Tone from 'tone'
Tone.start()

const x = globalThis.x
const synth = new Tone.Synth().toDestination()

const dom = ref(null)
const inputDom = ref(null)
let sequenceObject = null

const onInput = (e) => {
  if (e.key !== 'Enter') return
  const obj = x.getByName(inputDom.value.value.trim())
  if (!obj) return
  sequenceObject = obj
  console.log(sequenceObject)
}

if (sequenceObject) {
  x.updateObject({
    repoName: 'sys',
    objectId: sequenceObject.id,
    data: {
      sequence: []
    }
  })
}

const saveSequence = () => {
  if (!sequenceObject) return
  x.updateObject({
    repoName: 'sys',
    objectId: sequenceObject.id,
    data: []
  })
}

onMounted(() => {
  const sequenceObjectName = x.kvRepo.get('sequenceObjectName')
  if (sequenceObjectName) {
    inputDom.value = sequenceObjectName    
  }


  const c = document.createElement('div')
  Object.assign(c.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  })
  dom.value.append(c)

  const notes = [
    'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1',
    'G#1', 'A1', 'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2'
  ]

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i]
    
    const row = document.createElement('div')
    Object.assign(row.style, {
      display: 'flex',
      gap: '2px'
    })
    c.append(row)

    for (let y = 0; y < 16; y++) {
      const cell = document.createElement('div')
      cell.className = 'cell'
      
      row.append(cell)
      cell.addEventListener('click', (e) => {
        synth.triggerAttackRelease(note, "16n")
        saveSequence()
      })
    }
  }

})
</script>

<style>
.cell {
  width: 16px;
  height: 16px;
  background: grey;
}

</style>