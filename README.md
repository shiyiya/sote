```tsx
import React, { FC } from 'react'
import { Provider, createStore, connect } from 'stoe'

const s = createStore({
  state: {
    a: 1,
    b: 2
  },
  actions: {
    addb(n: number) {
      this.a = n
    },
    add() {
      this.a += 1
    }
  }
})

const App: FC = connect({
  mapStateToProps: (state) => ({
    a: state.a
  }),
  mapActionsToProps: (actions) => ({
    add: actions.add
  })
})((props) => {
  console.log('a rerender')

  return (
    <div>
      <button onClick={props.add}>Change {props.a}</button>
    </div>
  )
})

const App2: FC = connect({
  mapStateToProps: (s) => ({ b: s.b })
  mapActionToProps: (a) => ({
    add: a.addb
  })
})((props) => {
  console.log('b rerender')

  return <button onClick={props.add}>{props.b}</button>
})

export default () => (
  <Provider value={s}>
    <App />
    <App2 />
  </Provider>
)
```
