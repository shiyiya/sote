import React, { Context, PropsWithChildren, useRef } from 'react'
import { Store } from './store'

type Props<T> = {
  value: T
}

export const Provider = function <T>({ children, value }: PropsWithChildren<Props<T>>) {
  const Context = useRef<Context<T>>(null as any)

  if (Context.current === null) {
    Context.current = React.createContext<T>(null as any)
    Store.context = Context.current
  }

  return (
    Context.current && <Context.current.Provider value={value}>{children}</Context.current.Provider>
  )
}
