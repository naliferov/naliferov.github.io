class DragAndDrop {
  constructor() {
    this.targetDom = null
    this.xShift = 0
    this.yShift = 0
  }

  activate(event, targetDom, onMoveFinishedCallback) {
    this.targetDom = targetDom
    this.onMoveFinishedCallback = onMoveFinishedCallback
    
    const rect = this.targetDom.getBoundingClientRect()
    this.xShift = event.clientX - rect.left
    this.yShift = event.clientY - rect.top

    document.addEventListener('pointermove', this.onPointerMove)
    document.addEventListener('pointerup', this.onPointerUp)
  }

  onPointerMove = (e) => {
    if (!this.targetDom) return
    this.targetDom.style.left = (e.clientX - this.xShift) + 'px'
    this.targetDom.style.top  = (e.clientY - this.yShift) + 'px'
  }

  onPointerUp = () => {
    document.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('pointerup', this.onPointerUp)

    if (!this.targetDom) return

    this.targetDom = null
  }
}

export default DragAndDrop