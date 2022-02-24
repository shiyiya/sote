import { useState, useContext, useEffect } from 'react'
import { Store, State, Actions, PinkStoreState, PinkStoreActions } from './store'
import { SoteContext, SoteContextValue } from './context'

export const useUpdate = () => {
  const [state, setState] = useState(0)
  return [state, () => setState((state) => state + 1)] as const
}

export type ConnectOptions<S, RS, RA> = {
  mapStateToProps: (state: PinkStoreState<S>) => RS
  mapActionsToProps: (actions: PinkStoreActions<S>) => RA
}

export const useStore = <S extends Store, RS extends State = {}, RA extends Actions = {}>({
  mapStateToProps,
  mapActionsToProps
}: ConnectOptions<S, RS, RA>): RS & RA => {
  const context = useContext<SoteContextValue<PinkStoreState<S>, PinkStoreActions<S>>>(SoteContext)

  const [_state, up] = useUpdate()

  const trackEffect = (): RS => {
    if (_state === 0) {
      Store.tracksubscriber = up
      const s = mapStateToProps(context as any)
      Store.tracksubscriber = null
      return s
    } else {
      return mapStateToProps(context.state)
    }
  }

  const store = {
    ...trackEffect(),
    ...mapActionsToProps?.(context.actions)
  }

  useEffect(() => {
    context.subscribe(up)

    return () => context.unsubscribe(up)
  }, [])

  return store
}
