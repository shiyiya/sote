import { useState, useEffect } from 'react'

const effectDeps = {}
const state = {}

const reactify = (store) => {
  Object.keys(store).forEach((key) => {
    state[key] = () => {
      const [_state, setState] = useState(store[key])
      useEffect(() => {
        effectDeps[key] || (effectDeps[key] = new Set())
        effectDeps[key].add(setState)

        return () => effectDeps[key].delete(setState)
      }, [])

      return _state
    }
  })

  return new Proxy(state, {
    get: (_, key) => {
      return state[key]?.() || store[key]
    },
    set: (_, key, value) => {
      const r = Reflect.set(store, key, value)
      effectDeps[key]?.forEach((setState) => setState(value))
      return r
    }
  })
}
