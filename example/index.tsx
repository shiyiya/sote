import React, { FC } from 'react'
import { Provider } from '../src/provider'
import { createStore } from '/./src/store'
import { connect } from '../src/connect'

const s = createStore({
  state: {
    a: 1,
    b: 2
  },
  actions: {
    set(n: number) {
      this.a = n
    },
    add() {
      this.a += 1
    }
  }
})

const App2: FC = connect({
  mapStateToProps: (s) => ({ b: s.b })
})((props) => {
  console.log('b rerender')

  return <button>{props.b}</button>
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

export default () => (
  <Provider value={s}>
    <App />
    <App2 />
  </Provider>
)
