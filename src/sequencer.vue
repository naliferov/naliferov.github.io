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

const notes = [
  'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1',
  'G#1', 'A1', 'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2'
]

const onInput = (e) => {
  if (e.key !== 'Enter') return
  const obj = x.getByName(inputDom.value.value.trim())
  if (!obj) return
  sequenceObject = obj
  console.log(sequenceObject)
}

const createSequence = () => {
  const sequence = []

  const createRows = () => {
    const rows = []
    for (let i = 0; i < 16; i++) {
      const row = []
      for (let y = 0; y < 16; y++) {
        row.push(false)
      }
      rows.push(row)
    }
    return rows
  }

  //create 16 clips
  //for (let i = 0; i < 16; i++) {
    sequence.push(createRows())
  //  }

  return sequence
}

console.log(createSequence())

const updateSequence = (row, cell) => {
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

  const container = document.createElement('div')
  container.classList.add('sequencerContainer')
  dom.value.append(container)

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i]
    
    const row = document.createElement('div')
    row.classList.add('sequencerRow')
    container.append(row)

    for (let y = 0; y < 16; y++) {
      const cell = document.createElement('div')
      cell.classList.add('sequencerCell')
      
      row.append(cell)
      cell.addEventListener('click', (e) => {
        synth.triggerAttackRelease(note, "16n")
        cell.classList.toggle('sequencerCellActive')
      })
    }
  }

})
</script>

<style>
.sequencerContainer {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sequencerRow {
  display: flex;
  gap: 2px;
}
.sequencerCell {
  width: 16px;
  height: 16px;  
  background: grey;
}
.sequencerCell.active {
  background: rgb(16, 16, 16);
}

</style>