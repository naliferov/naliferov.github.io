x.createFnFromCode = async (codeStr, name = '') => {
  // const code = `export default async ($) => { 
  //   ${codeStr} 
  //   //# sourceURL=dynamic/${name}
  // }`
  // const blob = new Blob([code], { type: 'application/javascript' })
  // return (await import(URL.createObjectURL(blob))).default
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
    console.error(`runCode erro >> `, e, code)
  }
}