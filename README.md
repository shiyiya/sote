# Try It Online

https://codesandbox.io/embed/nifty-sun-kenq35?theme=light

```tsx
import React, { FC } from 'react'
import { Provider, createStore, connect } from '../src'

const s = createStore({
  state: {
    a: 1,
    b: 2
  },
  actions: {
    setA(n: number) {
      this.a = n
    },
    addA() {
      this.a++
    },
    addB() {
      this.b++
    },
    setAAndB(n: number) {
      // batch update
      this.a = n
      this.a++
      this.b = n
      this.b++
    }
  }
})

const App: FC = connect({
  mapStateToProps: (state) => ({
    a: state.a
  }),
  mapActionsToProps: (actions) => ({
    add: actions.addA,
    set: actions.setA,
    setAAndB: actions.setAAndB
  })
})((props) => {
  console.log('a rerender')

  return (
    <>
      <button onClick={props.add}>Add A {props.a}</button>
      <br />
      <button onClick={() => props.set(Math.floor(Math.random() * 100))}>Set A {props.a}</button>
      <br />
      <button onClick={() => props.setAAndB(Math.floor(Math.random() * 100))}>
        Change A {`&`} B
      </button>
      <br />
    </>
  )
})

const Bpp: FC = connect({
  mapStateToProps: (s) => ({ b: s.b }),
  mapActionsToProps: (a) => ({
    add: a.addB
  })
})((props) => {
  console.log('b rerender')

  return <button onClick={props.add}>ADD B {props.b}</button>
})

export default () => (
  <Provider value={s}>
    <App />
    <Bpp />
  </Provider>
)
```
