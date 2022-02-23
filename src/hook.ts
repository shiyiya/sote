import { useContext, useEffect, useState } from 'react'
import { PinkStoreActions, PinkStoreState, Store, State, Actions } from './store'

export type ConnectOptions<S, RS, RA> = {
  mapStateToProps: (state: PinkStoreState<S>) => RS
  mapActionsToProps?: (actions: PinkStoreActions<S>) => RA
}

export const useStore = <S extends Store<any, any>, RS extends State = {}, RA extends Actions = {}>(
  options: ConnectOptions<S, RS, RA>
): RS & RA => {
  const context = useContext(Store.context!)
  if (!context) {
    throw new Error('Store is not defined')
  }

  const [_state, up] = useUpdate()

  const { mapStateToProps, mapActionsToProps } = options

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

export const useUpdate = () => {
  const [state, setState] = useState(0)
  return [state, () => setState((state) => state + 1)] as const
}

const s = new Store({ state: { a: 1 }, actions: { add() {} } })

const store = useStore<typeof s>({
  mapStateToProps: (state) => state,
  mapActionsToProps: (actions) => actions
})

//TODO: fix return type
store
