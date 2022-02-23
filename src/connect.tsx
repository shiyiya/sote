import React, { useContext, useEffect, useState } from 'react'
import { Store, PinkStoreState, PinkStoreActions } from './store'

type ConnectOptions<S, RS, RA> = {
  mapStateToProps?: (state: PinkStoreState<S>) => RS
  mapActionsToProps?: (actions: PinkStoreActions<S>) => RA
}

export const connect =
  <S extends Store<any, any>, RS, RA>(options: ConnectOptions<S, RS, RA>) =>
  (WrappedComponent: React.ComponentType<RS & RA>) =>
  () => {
    const context = useContext<S>(Store.context!)
    const { mapStateToProps, mapActionsToProps } = options

    const [_state, setState] = useState(0)
    const up = () => {
      setState((state) => state + 1)
    }

    const trackEffect = () => {
      if (_state === 0) {
        Store.tracksubscriber = up
        const s = mapStateToProps?.(context as any)
        Store.tracksubscriber = null
        return s
      } else {
        return mapStateToProps?.(context.state)
      }
    }

    const props = {
      // ...mapStateToProps?.(context.state),
      ...trackEffect(),
      ...mapActionsToProps?.(context.actions)
    } as RS & RA

    useEffect(() => {
      context.subscribe(up)
      return () => {
        context.unsubscribe(up)
      }
    }, [])

    return <WrappedComponent {...props} />
  }
