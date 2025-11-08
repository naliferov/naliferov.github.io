//GET REDIS INSTANCE

const x = {}

const getRedisInstance = async () => {
    const { Redis } = await import('https://esm.sh/@upstash/redis')
    return new Redis({
      url: 'https://holy-redfish-7937.upstash.io',
      token: localStorage.getItem('token') || 'Ah8BAAIgcDH8iJl1rQK-FZD7U3lrmcixchbsva9z2HQRDxtGlxLOrA',
    })
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
//VUE AND ULID
{
  const [ { ulid }, Vue ] = await Promise.all([
    import('https://esm.sh/ulid?bundle'),
    import('https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js')
  ])
  x.ulid = ulid
  x.vue = Vue
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

x.track = x.vue.ref('sys')
x.sys = x.vue.ref({})
x.user = x.vue.ref({})

x.openedObjects = x.vue.ref([])
x.showSideBar = x.vue.ref(true)
x.showFileInput = x.vue.ref(false)

x.set = async (k, v) => await $.redis.hset(x.track.value, { [k]: v } )
x.get = async (k) => await $.redis.hget(x.track.value, k)
x.del = async (k) => await $.redis.hdel(x.track.value, k)

{
  const arr = Object.values(await $.redis.hgetall(x.track.value))
  arr.sort((a, b) => (a.name > b.name) - (a.name < b.name));
  x.sys.value = Object.fromEntries(arr.map(o => [o.id, o]))
}

{
  const data = await x.kvRepo.get('openedObjects') ?? []
  x.openedObjects.value = typeof data === 'string' ? JSON.parse(data) : data
  x.openedObjects.value = x.openedObjects.value.filter((o) => {
    return o.objectId && x.sys.value[o.objectId]
  })

  x.vue.watch(
    x.openedObjects,
    (newOpenedObjects) => {
      const arr = newOpenedObjects.map(proxyItem => x.vue.toRaw(proxyItem))
      x.kvRepo.set('openedObjects', JSON.stringify(arr))
    },
    { deep: true }
  )
}

{
  const key = 'showSideBar'
  
  x.vue.watch(
    x.showSideBar,
    (flag) => flag ? x.kvRepo.on(key) : x.kvRepo.off(key),
  )
}

{
  const key = 'showFileInput'
  if (x.kvRepo.get(key)) x[key].value = true

  x.vue.watch(
    x[key],
    (flag) => flag ? x.kvRepo.on(key) : x.kvRepo.off(key),
  )
}

x.createFnFromCode = async (codeStr, name = '') => {
  const code = `export default async ($) => { 
    ${codeStr} 
    //# sourceURL=dynamic/${name}
  }`
  const blob = new Blob([code], { type: 'application/javascript' })
  return (await import(URL.createObjectURL(blob))).default
}

x.runCode = async (code, deps, name) => {
  try {
    const f = await x.createFnFromCode(code, name)
    return await f({ 
      ulid: x.ulid, Vue: x.vue, vue: x.vue, 
      runByName: x.runByName, runById: x.runById, getById: x.getById, getByName: x.getByName,
      ...deps
    })
  } catch (e) {
    console.log(`runCode error`, code)
  }
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

  const o = x.vue.toRaw(object)
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
      f: async ([ id ]) => await d(id),
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
        const { toRaw } = x.vue
        const o = x.getByName(name)
        if (o) console.log(toRaw(o))
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
  const { createApp, ref, onMounted } = x.vue

  const Frame = await x.runByName('frame', { updateObject: x.updateObject })

  const ObjectManager = {
    name: 'ObjectManager',
    props: ['repoName', 'objects', 'openObject'],
    template: `
      <div class="object-manager">
        <div class="heading">System Objects</div>
        <div 
          v-for="(o, objectId) in objects" 
          :key="objectId"
          class="object"
          @click="openObject(repoName, objectId)"
        >
          {{o.name}}
        </div>
      </div>
    `
  }

  const MonacoEditor = {
    name: 'MonacoEditor',
    props: ['repoName', 'objectId', 'openedObjectId', 'code', 'position'],
    setup(props) {
      const codeContainer = ref(null)

      onMounted(() => {
        const editor = monaco.editor.create(codeContainer.value, {
            value: props.code,
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontFamily: "Jetbrains Mono",
            fontSize: 15
        })
        editor.onDidChangeModelContent((e) => {  
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

      return { codeContainer }
    },
    template: `
    <div ref="codeContainer" style="margin: 0; height: ${window.innerHeight}px"></div>`
  }

  const OpenedObjectsComponent = {
    name: 'openedObjects',
    components: { MonacoEditor, Frame },

    setup() {
      const prepareObjects = () => {
        const result = []
        for (const object of x.openedObjects.value) {
          result.push({ ...object, object: x.getById(object.objectId) })
        }
        return result
      }

      return { prepareObjects, height: window.innerHeight }
    },

    template: `
      <div class="opened-objects" :style="{ height: height + 'px', overflow: 'auto' }">

        <div v-for="o in prepareObjects()" :key="o.id">
          <Frame v-if="o.opener === 'frame'" :openedObject="o"/>
          <div v-else>
            <div :id="o.id" class="object-name">{{o.object.name}}</div>
            <MonacoEditor
              :repoName="o.repoName"
              :objectId="o.object.id"
              :openedObjectId="o.id"
              :code="o.object.code"
              :position="o.position"
            />
          </div>
          
        </div>
        
      </div>
    `
  }

  const MainComponent = {
    name: 'Main',
    components: { ObjectManager, OpenedObjectsComponent },
    setup() {
      const inputTextDom = ref(null)
      const inputFileDom = ref(null)
      const inputKey = 'sysInput'

      const openObject = async (repoName, id) => {
        const object = await x.getById(id)

        const data = { repoName, id: x.ulid(), objectId: id }
        if (object.bin) data.opener = 'frame'

        x.openedObjects.value.push(data)
      }
      const closeObject = (openedObjectId) => {        
        x.openedObjects.value = x.openedObjects.value.filter((object => {
          return object.id !== openedObjectId
        }))
      }
      const scrollToObject = (openedObjectId) => {        
        const dom = document.getElementById(openedObjectId)
        if (!dom) return
        dom.scrollIntoView()
      }

      const onKeyDown = (e) => {
        if (e.code === 'Enter') e.preventDefault()
      }
      const onKeyUp = async (e) => {
        if (e.code !== 'Enter') return

        const txt = inputTextDom.value.textContent 
        
        x.kvRepo.set(inputKey, txt)

        const [ cmd, ...args ] = txt.split(' ')
        const cmdList = x.sysCMDs

        const file = inputFileDom.value ? inputFileDom.value.files[0] : null
        args.bin = file ? await x.readFileAsBase64(file) : null
        args.binMeta = file || null

        if (!cmdList[cmd]) return  
        const o = cmdList[cmd]
        if (o.f) o.f(args)
      }

      const prepareObjects = (objects) => {
        const result = []
        for (const object of objects) {
          result.push({ ...object, object: x.getById(object.objectId) })
        }
        return result
      }

      const toggleSideBar = () => x.showSideBar.value = !x.showSideBar.value
      
      onMounted(() => { 
           x.vue.watch(
            x.showSideBar,
            async (flag) => {
              if (!flag) return
              
              const inputCmd = x.kvRepo.get(inputKey) || 'Input cmd'
              if (inputCmd && inputTextDom.value) inputTextDom.value.textContent = inputCmd
            },
            { immediate: true, flush: 'post' }
          )
      })

      const style = document.createElement('style')
      style.textContent = `
        :root {
          --std-margin: 12px;
          --font: "JetBrains Mono", monospace;
        }
        body {
          font-family: var(--font);
          margin: 0;
        }

        #app {
          
        }
        .app-container { 
          display: flex;
        }
        .sidebar-switch {
          cursor: pointer;
          color: white;
          background: white;
        }
        .left-sidebar {
          font-size: 16px;
          color: #333333;
        }
        .cmd-input {
          padding: 0 var(--std-margin);
          width: 180px;
          background: #a7d0dd;
          white-space: nowrap;
          outline: none;
        }
        .file-input {
          margin: var(--std-margin) 0 0 0
        }
        .object-name {
          background: #e0e0e0;
        }
        
        .object-manager {
          padding: 0 var(--std-margin);
        }
        .object-manager .heading {
          font-weight: bold;
          margin: 10px 0;
        }
        .opened-objects-list {
          color: #333333; 
          font-family: var(--font);
          font-size: 16px;
          padding: 0 var(--std-margin);
        }
        .opened-objects-list .heading { 
          font-weight: bold;
          margin: 10px 0;
          white-space: nowrap;
        }

        .opened-objects { 
          flex: 1;
        }

        .frames-container {
          position: absolute;
        }
        .frame {
          position: absolute;
          font-family: var(--font);
          font-size: 16px;
        }
        .object { 
          cursor: pointer;
          white-space: nowrap;
        }
        input {
          font-family: var(--font);
          font-size: 16px
        }
      `
      document.head.appendChild(style)

      return {
        sys: x.sys, user: x.user,
        openObject, closeObject, scrollToObject,
        openedObjects: x.openedObjects, prepareObjects, toggleSideBar,

        inputTextDom, inputFileDom,
        onKeyDown, onKeyUp,

        showSideBar: x.showSideBar,
        showFileInput: x.showFileInput,
      }
    },
    template: `
      <div class="app-container">
        <div class="left-sidebar" v-if="showSideBar">
          <div
          class="cmd-input" 
          ref="inputTextDom"
          contenteditable="plaintext-only"
          @keydown="onKeyDown($event)"
          @keyup="onKeyUp($event)"
          ></div>
          <input class="file-input" v-if="showFileInput" ref="inputFileDom" type="file">

          <div class="opened-objects-list">
            <div class="heading">Opened Objects</div>

            <div class="object"
              v-for="o in prepareObjects(openedObjects)" 
              :key="o.id"
              @click="scrollToObject(o.id)"
              @dblclick="closeObject(o.id)">
                {{ o.object.name }}
                <span v-if="o.opener"> ({{o.opener }})<span>
            </div>
          </div>

          <ObjectManager 
            repoName="sys"
            :objects="sys"
            :openObject="openObject" 
          />
        </div>

        <OpenedObjectsComponent/>
      </div> 
    `
  }

const appContainer = document.createElement('div')
  appContainer.id = 'app'
  document.body.append(appContainer)
  createApp(MainComponent)
  x.app
}

export default x
