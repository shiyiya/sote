import { unstable_batchedUpdates as batch } from 'react-dom'
import { isFunction, isPromise } from './utils'

export type State =
  | Record<string | number | symbol, any>
  | (() => Record<string | number | symbol, any>)

export type Actions = Record<string, ((...arg: any[]) => void) | ((...arg: any[]) => Promise<void>)>

type Effect = () => void
type EffectKey = string | symbol

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

  private proxyState(state: any) {
    // this.state = new Proxy(state, {
    //   get: (target, key, receiver) => {
    //     this.trackEffect(key)
    //     return Reflect.get(target, key, receiver)
    //   },
    //   set: (target, key, value, receiver) => {
    //     if (value !== Reflect.get(this.state, key)) {
    //       this.trackKey(key)
    //       return Reflect.set(target, key, value, receiver)
    //     }
    //     return false
    //   }
    // })

    // proxy push pop shift unshift
    Object.keys(this.state).forEach((key) => {
      Object.defineProperty(this, key, {
        set: (value) => {
          return Reflect.set(this.state, key, value)
        },
        get: () => {
          return Reflect.get(this.state, key)
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

  private reactify(obj: any, path = '') {
    return new Proxy(obj, {
      get: (target, key, receiver) => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          //todo poxy.ts
          return this.reactify(obj[key], path + '.' + `${String(key)}`)
        }

        this.trackEffect(path)
        return Reflect.get(target, key, receiver)
      },
      set: (target, key, value, receiver) => {
        if (value !== Reflect.get(this.state, key)) {
          this.trackKey(key)
          return Reflect.set(target, key, value, receiver)
        }
        return false
      }
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
      effectKeys.forEach((key) => {
        effects.get(key)?.forEach((effect) => effect())
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
