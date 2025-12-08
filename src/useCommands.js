import { useObjectsStore } from './stores/objects'

let objectsStore

const cmds = {
  add: {
    f: async (dataSource, args) => {
      const name = args[0]

      const obj = dataSource.getByName(name)
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
  addid: {
    f: async (args) => {
      const [ id ] = args
      const o = { id: id.trim(), name: id.trim() }

      if (x.sys.value[o.id]) return
      x.sys.value[o.id] = o
      await x.set(o.id, o)
    },
    desc: 'Function for adding new objects in list of opened objects. Example: addid {objectId}'
  },
  del: {
    f: async ([ name ]) => {
      const o = x.getByName(name) 
      if (o.notSaveable) {
        console.log(`object with name ${name} is not saveable`)
        return
      }
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
      if (o.notSaveable) {
        console.log(`object with name ${oldName} is not saveable`)
        return
      }

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
    async f([ name ]) {
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

  setDataSourceName: {
    f: async (args) => {
      objectsStore.setDataSourceName(args[0])
    },
    desc: 'Set setDataSourceName. Example: setDataSourceName nameOfDataSource'
  },

  setTrack: {
    f: async (args) => {
      objectsStore.setTrack(args[0])
    },
    desc: 'Set track. Example: track nameOfTrack'
  },
}

export const runCmd = async (name, args = []) => {
  const cmd = cmds[name]
  if (!cmd || !cmd.f) {
    console.warn(`Unknown command: ${name}`)
    return
  }
  if (!objectsStore) objectsStore = useObjectsStore()

  await cmd.f(args)
  return true
}

export const list = () =>
  Object.entries(cmds)
    .filter(([_, v]) => typeof v.f === 'function')
    .map(([name, v]) => ({ name, desc: v.desc }))

// const fInput = 
//     // fInput.type = 'file'
//     // fInput.addEventListener('change', async (e) => {
//     //   const dump = JSON.parse(await readFileFromInput(e.target.files[0]))
//     //   importDump(dbUser, dump)
//     // })
//     // userCmdInput.before(fInput)