const safeModePage = async () => {
    const storage = localStorage

    const redis = await getRedisInstance()
    const sysMain = await redis.hget('sys', 'sys-main')
    const pre = document.createElement('pre')
    document.body.appendChild(pre)

    pre.contentEditable = true
    pre.innerText = sysMain.code
    pre.addEventListener('keyup', async (e) => {
      e.preventDefault()
      sysMain.code = pre.innerText
      await redis.hset('sys', { 'sys-main': sysMain })
    })
    pre.addEventListener('scroll', (e) => storage.setItem('sysMainScroll', e.target.scrollTop))
    pre.scrollTop = storage.getItem('sysMainScroll')

    Object.assign(pre.style, {
      fontFamily: 'monospace',
      fontSize: '14px',
      padding: '10px',
      backgroundColor: '#f0f0f0',
      height: window.innerHeight + 'px',
      overflow: 'scroll'
    })
}

export { safeModePage }