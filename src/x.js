const vue = await import('vue')

const x = {}
globalThis.x = x

//REDIS, ULID, VUE
{
  const [ { Redis }, { ulid } ] = await Promise.all([
    import('https://esm.sh/@upstash/redis'),
    import('https://esm.sh/ulid?bundle'),
  ])
  x.redis = new Redis({
    url: 'https://holy-redfish-7937.upstash.io',
    token: localStorage.getItem('token') || 'Ah8BAAIgcDH8iJl1rQK-FZD7U3lrmcixchbsva9z2HQRDxtGlxLOrA',
  })
  x.ulid = ulid
}

//FONTS
{
  const l = document.createElement('link')
  l.rel = 'stylesheet'
  l.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'
  document.head.append(l)
}
//MONACO EDITOR
{
  const { promise: editorIsReady, resolve: editorIsReadyResolve } = Promise.withResolvers()
  const requireScript = document.createElement('script');
  requireScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js'
  requireScript.onload = () => {
      require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } })
      require(['vs/editor/editor.main'], editorIsReadyResolve)
  }
  document.head.append(requireScript)
  await editorIsReady
}

{
  class KvRepo {
    get(key) {
      return localStorage.getItem(key)
    }
    set(key, value) {
      localStorage.setItem(key, value)
    }
    del(key) {
        localStorage.removeItem(key)
    }
    on(key) {
      this.set(key, '1')
    }
    off(key) {
      this.del(key)
    }
  }
  x.kvRepo = new KvRepo
}

x.track = vue.ref('sys')
x.sys = vue.ref({})
x.user = vue.ref({})

x.openedObjects = vue.ref([])
x.showSideBar = vue.ref(true)
x.showFileInput = vue.ref(false)

x.set = async (k, v) => await x.redis.hset(x.track.value, { [k]: v } )
x.get = async (k) => await x.redis.redis.hget(x.track.value, k)
x.del = async (k) => await x.redis.redis.hdel(x.track.value, k)

{
  const arr = Object.values(await x.redis.hgetall(x.track.value))
  arr.sort((a, b) => (a.name > b.name) - (a.name < b.name));
  x.sys.value = Object.fromEntries(arr.map(o => [o.id, o]))
}

{
  const data = await x.kvRepo.get('openedObjects') ?? []
  x.openedObjects.value = typeof data === 'string' ? JSON.parse(data) : data
  x.openedObjects.value = x.openedObjects.value.filter((o) => {
    return o.objectId && x.sys.value[o.objectId]
  })

  vue.watch(
    x.openedObjects,
    (newOpenedObjects) => {
      const arr = newOpenedObjects.map(proxyItem => vue.toRaw(proxyItem))
      x.kvRepo.set('openedObjects', JSON.stringify(arr))
    },
    { deep: true }
  )
}

{
  const key = 'showSideBar'

  // vue.watch(
  //   x.showSideBar,
  //   (flag) => flag ? x.kvRepo.on(key) : x.kvRepo.off(key),
  // )
}

{
  const key = 'showFileInput'
  if (x.kvRepo.get(key)) x[key].value = true

  vue.watch(
    x[key],
    (flag) => flag ? x.kvRepo.on(key) : x.kvRepo.off(key),
  )
}

x.getById = (id) => x.sys.value[id]
x.getByName = (name, repoName = 'sys') => {
  const objectsRef = repoName === 'sys' ? x.sys : x.user
  const objects = objectsRef.value
  for (const k in objects) {
    const o = objects[k]
    if (o.name === name) return o
  }
}
x.runById = async (id, deps = {}) => {
  const o = x.getById(id)
  if (o && o.code) {
    return await x.runCode(o.code, deps, o.name)
  }
}
x.runByName = async (name, deps = {}) => {
  const o = x.getByName(name)
  if (o && o.code) return await x.runCode(o.code, deps, o.name)
}

x.getOpenedObject = (objectId) => {
  for (const openedObject of x.openedObjects.value) {
    if (openedObject.id === objectId) {
      return openedObject
    }
  }
}

x.updateObject = (update) => {
  
  const objectRef = update.repoName === 'sys' ? x.sys : x.user
  const object = objectRef.value[update.objectId]
  if (!object) return

  const o = vue.toRaw(object)
  if (update.code) o.code = update.code
  if (update.data) o.data = update.data
  if (update.code || update.data) {
    x.set(o.id, o)
  }

  const openedObject = x.getOpenedObject(update.openedObjectId)
  if (!openedObject) return
  
  if (update.position) {
    openedObject.position = update.position
  }
  if (update.frameParams) {
    openedObject.frameParams = update.frameParams
  }
}

x.createCMDs = (assign = {}) => {
  const CMDs = {
    add: {
      f: async (args) => {
        const [ name ] = args

        const obj = x.getByName(name)
        if (obj) {
          console.log(`object with name ${name} already exists`)
          return
        }
        const o = { id: x.ulid(), name: name.trim() }
        if (args.bin) o.bin = args.bin
        x.sys.value[o.id] = o

        await x.set(o.id, o)
      },
      desc: 'Function for adding new objects in list of functions. Example: add {new objectName}'
    },
    del: {
      f: async ([ name ]) => {
        const o = x.getByName(name)
        if (o) {
          delete x.sys.value[o.id]
          await x.del(o.id)
          return
        }
        console.log(`object with name ${name} not found`)
      },
      desc: 'Function for deleting objects from the list by name. Example: del {objectName}'
    },
    delById: {
      f: async ([ id ]) => await x.del(id),
      desc: 'Function for delete object by id. Example: mv oldName newName'
    },
    mv: {
      f: async ([ oldName, newName ]) => {
        const o = x.getByName(oldName)
        if (!o) return      
        o.name = newName
        await x.set(o.id, o)
      },
      desc: 'Function for rename object. Example: mv oldName newName'
    },
    setProp: {
      f: async ([ objectName, prop, value ]) => {
        const o = x.getByName(objectName)
        if (!o || !prop || !value) return
        o[prop.trim()] = value.trim()
        await x.set(o.id, o)
      },
      desc: 'Find object by name, set prop and value. Example'
    },
    delProp: {
      f: async ([ objectName, prop ]) => {
        const o = x.getByName(objectName)
        if (!o) return      
        delete o[prop]
        await x.set(o.id, o)
      },
      desc: 'Find object by name, del prop. Example'
    },
    open: {
      f([ objectName, openerName ]) {
        const o = x.getByName(objectName)
        if (!o || !openerName) return

        x.openedObjects.value.push({ 
          repoName: 'sys', 
          id: x.ulid(),
          objectId: o.id,
          opener: openerName 
        })
      },
      desc: 'Function for open objects as app. Example: run objectName arg1 arg2 ...'
    },
    log: {
      f: async ([ name ]) => {
        const o = x.getByName(name)
        if (o) console.log(vue.toRaw(o))
      },
      desc: 'Function for logging object by name. Example: run functionName arg1 arg2 ...'
    },
    fileInput: {
      f: async () => {
        x.showFileInput.value = !x.showFileInput.value
      },
      desc: 'Function for logging object by name. Example: run functionName arg1 arg2 ...'
    },
    exportDump: {
      f: async ([]) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([JSON.stringify(x.sys.value)], { type: 'application/json' }))
        a.download = 'dump.json'
        a.click()
        URL.revokeObjectURL(a.href)
      },
      desc: 'Export dump'
    },
  }

  Object.assign(CMDs, assign)

  return CMDs
}
x.sysCMDs = x.createCMDs({ repoName: 'sys' })
x.userCMDs = x.createCMDs({
  repoName: 'user',
  async 'import-dump'() {
    // const fInput = 
    // fInput.type = 'file'
    // fInput.addEventListener('change', async (e) => {
    //   const dump = JSON.parse(await readFileFromInput(e.target.files[0]))
    //   importDump(dbUser, dump)
    // })
    // userCmdInput.before(fInput)
  },
  //async 'export-dump'() { exportDump(dbUser, ['objects', 'kv'], 'user.json') },
})

x.readFileAsBase64 = async (file) => {
  const { promise, resolve, reject } = Promise.withResolvers()

  const r = new FileReader()
  r.readAsDataURL(file)
  r.onload = () => {
    const base64 = r.result.split(',')[1]
    resolve(base64)
  }
  r.onerror = reject
  return promise
}

//LOAD VUE
{
  const { createApp } = vue
  const { default: MainComponent } = await import('./main.vue')
  x.app = createApp(MainComponent)
}

export default x
