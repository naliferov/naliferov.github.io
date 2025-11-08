const { defineComponent, onMounted } = $.vue

export default defineComponent({
  setup: (props) => {
    
    const dom = $.Vue.ref(null)

    const cat = $.getByName('cat')

    onMounted(() => {
      const c = document.createElement('div')
      c.style.display = 'grid'
      c.style.gridTemplateColumns = 'repeat(8, 32px)'
      c.style.gridTemplateRows = 'repeat(8, 32px)'
      c.style.gap = '2px'
      dom.value.append(c)

      for (let i = 0; i < 64; i++) {
        const d = document.createElement('div')
        d.style.width = '32px'
        d.style.height = '32px'
        d.style.background = 'grey'
        c.append(d)
      }

    })

    return { dom }
  },
  template: `<div ref="dom"></div>`
})