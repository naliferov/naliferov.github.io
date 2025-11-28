<template>
  <div ref="dom">
    <input ref="inputDom" @keyup="onInput" />
    <br/><br/>

    <button class="play-button" @click="onPlayClick">Play</button>
    <button class="play-button" @click="onStopClick">Stop</button>
    <br/><br/>

    <div class="clip">
      <div v-for="(row, i) in grid" :key="i" class="row">
        
        <div v-for="(cell, y) in row"
          :key="y"
          class="cell" 
          :class="{ 'active': cell }" 
          @click="onCellClick(i, y)"
        ></div>

      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, toRaw } from 'vue'

const x = globalThis.x
const dom = ref(null)
const inputDom = ref(null)

const clips = ref([])
const grid = ref([])
const notes = [
  'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2',
  'G#2', 'A2', 'A#2', 'B2',
  'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3',
  'G#3', 'A3', 'A#3', 'B3'
]

for (let i = 0; i < notes.length; i++) {
  grid.value.push([])
  for (let y = 0; y < 16; y++) {
    grid.value[i].push(0)
  }
}

let audio = null

const getAudio = async () => {
  if (!audio) {
    const Tone = await import('tone')
    audio = {
      Tone,
      synth: new Tone.Synth().toDestination(),
      //monoSynth: new Tone.MonoSynth().toDestination(),
      //duoSynth: new Tone.DuoSynth().toDestination(),
    }
    await Tone.start()
  }

  return audio
}

const onInput = (e) => {
  if (e.key !== 'Enter') return
  const obj = x.getByName(inputDom.value.value.trim())
  if (!obj) return
}
const onCellClick = async (rowNum, cellNum) => {
  grid.value[rowNum][cellNum] = !grid.value[rowNum][cellNum]

  const audio = await getAudio()
  audio.synth.triggerAttackRelease(notes[rowNum], "16n")

  await x.updateObject({
    repoName: 'sys',
    objectId: 'sequencerData',
    data: toRaw(grid.value)
  })
}

let loop = null

const onPlayClick = async () => {
  const audio = await getAudio()
  audio.Tone.Transport.bpm.value = 120

  let step = 0
  loop = new audio.Tone.Loop((time) => {
      for (let i = 0; i < grid.value.length; i++) {
        const isActive = grid.value[i][step]
        if (!isActive) continue
        audio.synth.triggerAttackRelease(notes[i], '16n', time)
      }
      step = (step + 1) % 16
  }, '16n')

  loop.start(0)
  audio.Tone.Transport.start()

  //currentStep = (currentStep + 1) % totalSteps

  //const audio = await getAudio()
  //audio.synth.triggerAttackRelease(notes[rowNum], "16n")
}

const onStopClick = async () => {
  const audio = await getAudio()
  audio.Tone.Transport.stop()
  loop.stop()
}

onMounted(async () => {
  const sequencerData = await x.getObjectData('sequencerData')
  if (sequencerData) grid.value = sequencerData

  //synth.triggerAttackRelease(note, "16n")
})
</script>

<style>
.clip {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.row {
  display: flex;
  gap: 2px;
}
.cell {
  width: 14px;
  height: 14px;
  background: grey;
}
.cell.active {
  background: black;
}

</style>