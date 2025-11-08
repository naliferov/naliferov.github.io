const { defineComponent, onMounted } = $.Vue

return defineComponent({
  setup: (props) => {
    
    const dom = $.Vue.ref(null)

    onMounted(() => {
        const d = document.createElement('div')
        d.style.width = '32px'
        d.style.height = '32px'
        d.style.background = 'red'
        dom.value.append(d)
   })

    return { dom }
  },
  template: `<div ref="dom"></div>`
})