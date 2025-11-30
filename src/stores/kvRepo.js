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

export default KvRepo