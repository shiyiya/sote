import { useState, useContext, useEffect } from 'react'
import { Store, State, Actions, PinkStoreState, PinkStoreActions } from './store'
import { SoteContext, SoteContextValue } from './context'

export const useUpdate = () => {
  const [updateCount, setUpdateCount] = useState(0)
  return [updateCount, () => setUpdateCount((state) => (state += 1))] as const
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

  const [updateCount, updater] = useUpdate()

  const trackEffect = (): RS => {
    if (updateCount === 0) {
      Store.tracksubscriber = updater
      const s = mapStateToProps(context as unknown as PinkStoreState<S>)
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

  useEffect(() => () => context.removeTrackedEffect(updater), [])

  return store
}
