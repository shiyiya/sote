import React from 'react'
import { ConnectOptions, useStore } from './hook'
import type { State, Store, Actions } from './store'

export const connect =
  <S extends Store<any, any>, RS extends State = {}, RA extends Actions = {}>(
    options: ConnectOptions<S, RS, RA>
  ) =>
  (WrappedComponent: React.ComponentType<any>) =>
  () => {
    const props = useStore(options)

    return <WrappedComponent {...props} />
  }
