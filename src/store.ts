import { unstable_batchedUpdates as batch } from 'react-dom'
import { isFunction } from './utils/isFunction'

export type State = Record<string | number | symbol, any>

export type Actions = Record<string, (...arg: any[]) => void>

type Subscriber = () => void

interface StoreOptions<S extends State = {}, A extends Actions = {}> {
  state: S
  actions?: A & ThisType<A & S>
}

export type PinkStoreState<S> = S extends Store<infer T, any> ? T : never

export type PinkStoreActions<S> = S extends Store<any, infer T> ? T : never

export class Store<S extends State = {}, A extends Actions = {}> {
  public static tracksubscriber: Subscriber | null = null

  public state: S
  public actions: A = {} as A

  private effectKeys = new Set<string>()
  private effectDeps = new Map<string, Set<Function>>()

  constructor({ state, actions }: StoreOptions<S, A>) {
    this.state = isFunction(state) ? state() : state

    Object.keys(this.state).forEach((key) => {
      Object.defineProperty(this, key, {
        get: () => {
          //todo: track all & deep
          this.trackEffect(key)
          return Reflect.get(this.state, key)
        },
        set: (value) => {
          if (value !== Reflect.get(this.state, key)) {
            this.trackKeys(key)
            return Reflect.set(this.state, key, value)
          }

          return false
        }
      })
    })

    for (const key in actions) {
      // @ts-ignore
      this.actions[key] = (...args: any[]) => {
        actions[key].apply(this, args)
        this.notify(this.effectKeys)
        this.effectKeys.clear()
      }
    }
  }

  public trackEffect(key: string) {
    if (Store.tracksubscriber) {
      let deps = this.effectDeps.get(key)
      if (!deps) {
        this.effectDeps.set(key, (deps = new Set()))
      }

      deps.add(Store.tracksubscriber)
    }
  }

  public trackKeys(key: string) {
    this.effectKeys.add(key)
  }

  public removeTrackedEffect(subscriber: Subscriber) {
    this.effectDeps.forEach((deps, key) => {
      deps.delete(subscriber)
      if (deps.size === 0) {
        this.effectDeps.delete(key)
      }
    })
  }

  public notify(keys: Set<string>) {
    keys.forEach((key) => {
      const deps = this.effectDeps.get(key)
      batch(() => deps?.forEach((subscriber) => subscriber()))
    })
  }
}

export const createStore = <S extends State = {}, A extends Actions = {}>(
  options: StoreOptions<S, A>
) => {
  return new Store(options)
}
