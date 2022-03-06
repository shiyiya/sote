import { useState, useContext, useEffect, useMemo } from 'react'
import { Store, State, Actions, PinkStoreState, PinkStoreActions } from './store'
import { SoteContext, SoteContextValue } from './context'

export const useUpdater = () => {
  const [updateCount, setUpdateCount] = useState(0)
  return [updateCount, () => setUpdateCount((state) => (state += 1))] as const
}

export type ConnectOptions<S, RS, RA> = {
  mapState?: (state: PinkStoreState<S>) => RS
  mapActions?: (actions: PinkStoreActions<S>) => RA
}

export function useStore<S extends Store>(): S['state'] & S['actions']

export function useStore<
  S extends Store = Store<any, any>,
  RS extends State = any,
  RA extends Actions = any
>(options?: ConnectOptions<S, RS, RA>): RS & RA

export function useStore<S extends Store = Store, RS extends State = any, RA extends Actions = any>(
  options?: ConnectOptions<S, RS, RA>
): RS & RA {
  const [updateCount, updater] = useUpdater()
  const context = useContext<SoteContextValue<PinkStoreState<S>, PinkStoreActions<S>>>(SoteContext)
  const { mapState, mapActions } = options || {
    mapState: (state: PinkStoreState<S>) => ({ ...state }),
    mapActions: (actions: PinkStoreActions<S>) => actions
  }

  const trackEffect = () => {
    if (updateCount === 0) {
      Store.Effect = updater
      const s = mapState?.(context.state)
      Store.Effect = null
      return s
    } else {
      return mapState?.(context.state)
    }
  }

  const store = {
    ...trackEffect(),
    ...useMemo(() => mapActions?.(context.actions), [mapActions])
  } as RS & RA

  useEffect(() => () => context.removeTrackedEffect(updater), [])

  return store
}

export const useCommit = <S extends Store = Store>() => {
  const context = useContext<SoteContextValue<PinkStoreState<S>, PinkStoreActions<S>>>(SoteContext)

  return context.commit.bind(context)
}
