import { unstable_batchedUpdates as batch } from 'react-dom'
import { isFunction, isObject, isPromise } from './utils'

export type State =
  | Record<string | number | symbol, any>
  | (() => Record<string | number | symbol, any>)

export type Actions = Record<string, ((...arg: any[]) => void) | ((...arg: any[]) => Promise<void>)>

type Effect = () => void
type EffectKey = string | number | symbol

const copy = new Map<EffectKey, any>()

const KeyEffects = new Map<EffectKey, Set<Effect>>()
const EffectKeys = new Map<Effect, Set<EffectKey>>()

const EffectSetterKeys = new Set<EffectKey>()

interface StoreOptions<S extends State = {}, A extends Actions = {}> {
  state: S
  actions?: A & ThisType<S & A>
}

export class Store<S extends State = {}, A extends Actions = {}> {
  public state: S
  public actions = {} as A

  public static Effect: Effect | null = null

  constructor({ state, actions }: StoreOptions<S, A>) {
    const rawState = isFunction(state) ? state() : state

    this.state = this.reactify(rawState)
    this.proxyState(rawState)
    this.proxyActions(actions as A)
  }

  private reactify(state: any, path = '') {
    return new Proxy(state, {
      get: (target, key, receiver) => {
        const fullKey = path + '.' + key.toString()

        if (Object.hasOwnProperty.call(target, key)) {
          if (copy.has(fullKey)) return copy.get(fullKey)

          this.trackEffect(fullKey)

          if (isObject(target[key])) {
            const p = this.reactify(state[key], fullKey)
            return copy.set(key, p), p
          }
        }

        return Reflect.get(target, key, receiver)
      },
      set: (target, key, value, receiver) => {
        const targetValue = target[key]

        if (value === targetValue && key !== 'length') {
          return true
        }

        const fullKey = path + '.' + key.toString()

        if (key === 'length' || Array.isArray(target)) {
          // push pop shift unshift
          this.trackKey(path.substring(1))
        } else {
          this.trackKey(fullKey.substring(1))
        }

        if (isObject(targetValue)) {
          copy.delete(fullKey)

          value = this.reactify(value, fullKey)
        }

        return Reflect.set(target, key, value, receiver)
      }
    })
  }

  private proxyState(state: S) {
    Object.keys(state).forEach((key) => {
      Object.defineProperty(this, key, {
        set: (value) => {
          this.state[key] = value
        },
        get: () => {
          return this.state[key]
        }
      })
    })
  }

  private proxyActions(actions: A) {
    for (const key in actions) {
      // @ts-ignore
      this.actions[key] = (...args: any[]) => {
        const returnValue = actions[key].apply(this, args)

        if (isPromise(returnValue)) {
          returnValue.then(this.notify)
        } else {
          this.notify()
        }
      }
    }

    Object.keys(this.actions).forEach((key) => {
      Object.defineProperty(this, key, {
        get: () => {
          return Reflect.get(this.actions, key)
        }
      })
    })
  }

  private trackEffect(path: EffectKey) {
    if (Store.Effect) {
      const key = path.toString().substring(1)

      if (!EffectKeys.get(Store.Effect)) {
        EffectKeys.set(Store.Effect, new Set())
      }
      EffectKeys.get(Store.Effect)!.add(key)

      if (!KeyEffects.get(key)) {
        KeyEffects.set(key, new Set())
      }
      KeyEffects.get(key)!.add(Store.Effect)

      const chunkPath = key.split('.')
      while (chunkPath.length > 1) {
        chunkPath.pop()
        const prevKey = chunkPath.toString()

        if (EffectKeys.get(Store.Effect)?.has(prevKey)) {
          EffectKeys.get(Store.Effect)?.delete(prevKey)
          KeyEffects.get(prevKey)?.delete(Store.Effect)
          if (KeyEffects.get(prevKey)?.size === 0) {
            KeyEffects.delete(prevKey)
          }
        }
      }
    }
  }

  private trackKey(key: EffectKey) {
    EffectSetterKeys.add(key)
  }

  public removeTrackedEffect(effect: Effect) {
    KeyEffects.forEach((deps, key) => {
      deps.delete(effect)
      if (deps.size === 0) {
        KeyEffects.delete(key)
      }
    })
    EffectKeys.delete(effect)
  }

  private notify() {
    batch(() => {
      EffectSetterKeys.forEach((key) => {
        KeyEffects.get(key)?.forEach((effect) => {
          effect()
        })
      })
    })
    EffectSetterKeys.clear()
  }

  public commit(effect: (state: S) => void) {
    effect(this.state)
    this.notify()
  }
}

export const createStore = <S extends State = {}, A extends Actions = {}>(
  options: StoreOptions<S, A>
) => {
  return new Store(options)
}

export type PinkStoreState<S> = S extends Store<infer T, any> ? T : never

export type PinkStoreActions<S> = S extends Store<any, infer T> ? T : never
