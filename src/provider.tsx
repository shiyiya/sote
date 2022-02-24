import React, { PropsWithChildren } from 'react'
import { Store, Actions, State } from './store'
import { SoteContext } from './context'

type Props<S extends State = {}, A extends Actions = {}> = {
  value: Store<S, A>
}

export const Provider = function ({ children, value }: PropsWithChildren<Props>) {
  const Context = SoteContext

  return <Context.Provider value={value}>{children}</Context.Provider>
}
