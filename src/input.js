const { defineComponent, onMounted } = $.Vue

return defineComponent({
  setup: (props) => {
    
    const dom = $.Vue.ref(null)

    onMounted(() => {
      const d = document.createElement('div')
      d.setAttribute('contenteditable', 'plaintext-only')
      d.textContent = 'ok ok ok this is input'
      d.style.background = 'lightgray'
      dom.value.append(d)
   })

    return { dom }
  },
  template: `<div ref="dom"></div>`
})