import { unstable_batchedUpdates as batch } from 'react-dom'
import { isFunction, isObject, isPromise } from './utils'

export type State =
  | Record<string | number | symbol, any>
  | (() => Record<string | number | symbol, any>)

export type Actions = Record<string, ((...arg: any[]) => void) | ((...arg: any[]) => Promise<void>)>

type Effect = () => void
type EffectKey = string

const copy = new Map<any, any>()

const effectKeys = new Set<EffectKey>()
const effects = new Map<EffectKey, Set<Effect>>()

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
        if (value == target[key] && key !== 'length') return false

        const fullKey = path + '.' + key.toString()

        this.trackKey(fullKey.substring(1))

        if (isObject(target[key])) {
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
      let deps = effects.get(key)
      if (!deps) {
        effects.set(key, (deps = new Set()))
      }

      deps.add(Store.Effect)
    }
  }

  private trackKey(key: EffectKey) {
    effectKeys.add(key)
  }

  public removeTrackedEffect(effect: Effect) {
    effects.forEach((deps, key) => {
      deps.delete(effect)
      if (deps.size === 0) {
        effects.delete(key)
      }
    })
  }

  private notify() {
    batch(() => {
      Array.from(effectKeys)
        .map((key) => {
          return key.split('.')[0]
        })
        .forEach((key) => {
          effects.get(key)?.forEach((effect) => {
            effect()
          })
        })

      effectKeys.clear()
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
