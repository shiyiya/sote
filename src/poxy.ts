const copy = new Map<any, any>()

function poxy(value: any) {
  return new Proxy(value, {
    get: (target, key, receiver) => {
      if (copy.has(key)) {
        return copy.get(key)
      }

      if (typeof value[key] === 'object' && value[key] !== null) {
        const p = poxy(value[key])
        return copy.set(key, p), p
      }

      return Reflect.get(target, key, receiver)
    }
  })
}
