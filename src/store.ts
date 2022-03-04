import { unstable_batchedUpdates as batch } from 'react-dom'
import { isFunction, isObject, isPromise } from './utils'

export type State =
  | Record<string | number | symbol, any>
  | (() => Record<string | number | symbol, any>)

export type Actions = Record<string, ((...arg: any[]) => void) | ((...arg: any[]) => Promise<void>)>

type Effect = () => void
type EffectKey = string

const copy = new Map<any, any>()

const EFFECT_SETTER_KEYS = new Set<EffectKey>()
const EFFECT_MAP = new Map<EffectKey, Set<Effect>>()
const EFFECT_KEYS = new Map<Effect, Set<EffectKey>>()

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
        },
        configurable: true,
        enumerable: true
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

      if (!EFFECT_KEYS.get(Store.Effect)) {
        EFFECT_KEYS.set(Store.Effect, new Set())
      }
      EFFECT_KEYS.get(Store.Effect)!.add(key)

      if (!EFFECT_MAP.get(key)) {
        EFFECT_MAP.set(key, new Set())
      }
      EFFECT_MAP.get(key)!.add(Store.Effect)

      const chunkPath = key.split('.')
      while (chunkPath.length > 1) {
        chunkPath.pop()
        const prevKey = chunkPath.toString()

        if (EFFECT_KEYS.get(Store.Effect)?.has(prevKey)) {
          EFFECT_KEYS.get(Store.Effect)?.delete(prevKey)
          EFFECT_MAP.get(prevKey)?.delete(Store.Effect)
          if (EFFECT_MAP.get(prevKey)?.size === 0) {
            EFFECT_MAP.delete(prevKey)
          }
        }
      }
    }
  }

  private trackKey(key: EffectKey) {
    EFFECT_SETTER_KEYS.add(key)
  }

  public removeTrackedEffect(effect: Effect) {
    EFFECT_MAP.forEach((deps, key) => {
      deps.delete(effect)
      if (deps.size === 0) {
        EFFECT_MAP.delete(key)
      }
    })
    EFFECT_KEYS.delete(effect)
  }

  private notify() {
    batch(() => {
      EFFECT_SETTER_KEYS.forEach((key) => {
        EFFECT_MAP.get(key)?.forEach((effect) => {
          effect()
        })
      })

      EFFECT_SETTER_KEYS.clear()
    })
  }
}

export const createStore = <S extends State = {}, A extends Actions = {}>(
  options: StoreOptions<S, A>
) => {
  return new Store(options)
}

export type PinkStoreState<S> = S extends Store<infer T, any> ? T : never

export type PinkStoreActions<S> = S extends Store<any, infer T> ? T : never
