const x = {  
  x(k, obj) {
    this[k] = Object.create(this)
    Object.assign(this[k], obj)
  }
}

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