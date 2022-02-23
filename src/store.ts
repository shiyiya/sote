import { Context } from 'react'
import { isFunction } from './utils'

type State = Record<string | number | symbol, any>

type Actions = Record<string, (...arg: any[]) => void>

type Subscriber = () => void

interface StoreOptions<S extends State = {}, A extends Actions = {}> {
  state: S
  actions?: A & ThisType<A & S>
}

export type PinkStoreState<S> = S extends Store<infer T, any> ? T : never

export type PinkStoreActions<S> = S extends Store<any, infer T> ? T : never

export class Store<S extends State = {}, A extends Actions = {}> {
  public static tracksubscriber: Subscriber | null = null
  public static context: Context<any> | null = null

  public state: S
  public actions: A = {} as A
  private subscriber: Subscriber[] = []

  private effectKeys = new Set<string>()
  private effectDeps = new Map<any, Set<Function>>()

  constructor({ state, actions }: StoreOptions<S, A>) {
    this.state = isFunction(state) ? state() : state

    Object.keys(this.state).forEach((key) => {
      Object.defineProperty(this, key, {
        get: () => {
          //todo: track all & deep
          if (Store.tracksubscriber) {
            let deps = this.effectDeps.get(key)
            if (!deps) {
              this.effectDeps.set(key, (deps = new Set()))
            }

            deps.add(Store.tracksubscriber)
          }
          return Reflect.get(this.state, key)
        },
        set: (value) => {
          if (value !== Reflect.get(this.state, key)) {
            this.effectKeys.add(key)

            return Reflect.set(this.state, key, value)
          }

          return false
        }
      })
    })

    for (const key in actions) {
      // @ts-ignore
      this.actions[key] = (...args: any[]) => {
        actions?.[key].apply(this, args)
        this.lazyNotify(this.effectKeys)
        this.effectKeys.clear()
      }
    }
  }

  public subscribe(subscriber: Subscriber) {
    this.subscriber.push(subscriber)
  }

  public unsubscribe(subscriber: Subscriber) {
    const index = this.subscriber.indexOf(subscriber)
    if (index > -1) {
      this.subscriber.splice(index, 1)
    }
  }

  public notify() {
    this.subscriber.forEach((subscriber) => subscriber())
  }

  public lazyNotify(keys: Set<string>) {
    keys.forEach((key) => {
      const deps = this.effectDeps.get(key)
      deps?.forEach((subscriber) => subscriber())
    })
  }
}

export const createStore = <S extends State = {}, A extends Actions = {}>(
  options: StoreOptions<S, A>
) => {
  return new Store(options)
}

createStore({
  state: {
    a: 1
  },
  actions: {
    set(n: number) {
      this.a = n
    },
    add() {
      this.a++
    }
  }
})
