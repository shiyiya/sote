import React from 'react'
import { Store, Actions, State } from './store'

export type SoteContextValue<S extends State = any, A extends Actions = any> = Store<S, A>

export const SoteContext = /*#__PURE__*/ React.createContext<SoteContextValue>(null as any)

if (process.env.NODE_ENV !== 'production') {
  SoteContext.displayName = 'Sote'
}

export type SoteContextInstance = typeof SoteContext
