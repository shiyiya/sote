import { useState, useContext, useEffect, useMemo } from 'react'
import { Store, State, Actions, PinkStoreState, PinkStoreActions } from './store'
import { SoteContext, SoteContextValue } from './context'

export const useUpdater = () => {
  const [updateCount, setUpdateCount] = useState(0)
  return [updateCount, () => setUpdateCount((state) => (state += 1))] as const
}

export type ConnectOptions<S, RS, RA> = {
  mapStateToProps?: (state: PinkStoreState<S>) => RS
  mapActionsToProps?: (actions: PinkStoreActions<S>) => RA
}

export function useStore<S extends Store>(): PinkStoreState<S> & PinkStoreActions<S>

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
  const { mapStateToProps, mapActionsToProps } = options || {
    mapStateToProps: (state: PinkStoreState<S>) => ({ ...state }),
    mapActionsToProps: (actions: PinkStoreActions<S>) => actions
  }

  const trackEffect = useMemo(
    () => () => {
      if (updateCount === 0) {
        Store.Effect = updater
        const s = mapStateToProps?.(context.state)
        Store.Effect = null
        return s
      } else {
        return mapStateToProps?.(context.state)
      }
    },
    []
  )

  const store = {
    ...trackEffect(),
    ...mapActionsToProps?.(context.actions)
  } as RS & RA

  useEffect(() => () => context.removeTrackedEffect(updater), [])

  return store
}
