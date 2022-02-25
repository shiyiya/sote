import React from 'react'
import { ConnectOptions, useStore } from './hook'
import type { State, Actions, Store } from './store'

export function connect<S extends Store>(): (
  WrappedComponent: React.ComponentType<S['state'] & S['actions']>
) => React.FC

export function connect<
  S extends Store = Store<any, any>,
  RS extends State = {},
  RA extends Actions = {}
>(options: ConnectOptions<S, RS, RA>): (WrappedComponent: React.ComponentType<RS & RA>) => React.FC

export function connect<
  S extends Store = Store<any, any>,
  RS extends State = any,
  RA extends Actions = any
>(options?: ConnectOptions<S, RS, RA>) {
  return (WrappedComponent: React.ComponentType<RS & RA>): React.FC =>
    (...props) => {
      const store = useStore(options)

      return <WrappedComponent {...store} {...props} />
    }
}
