## Sote

[![CodeSandbox](https://img.shields.io/badge/Codesandbox-040404?style=for-the-badge&logo=codesandbox&logoColor=DBDBDB)](https://codesandbox.io/embed/nifty-sun-kenq35?theme=light)

## Create Store

```tsx
import { createStore } from 'sote'

const store = createStore({
  state: {
    count: 0
  },
  actions: {
    set(n: number) {
      this.count = n
    },
    add() {
      this.count++
    }
  }
})

type Store = typeof s
type State = typeof s.state
type Action = typeof s.actions
```

## Inject Store

```tsx
import React, { FC } from 'react'
import { Provider } from 'sote'

const App: FC<State & Action> = ({ count, set, add }) => {
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => set(0)}>reset</button>
      <button onClick={add}>add</button>
    </div>
  )
}

export default () => (
  <Provider value={s}>
    <SoteApp />
  </Provider>
)
```

### useStore

```tsx
import React, { FC } from 'react'
import { useStore } from 'sote'

const SoteApp: FC = () => {
  // get store
  // const { count, add, set } = useStore<Store>()

  // get part of store
  const store = useStore({
    mapStateToProps: (state: State) => ({
      count: state.count
    }),
    mapActionsToProps: (actions: Action) => ({
      add: actions.add,
      set: actions.set
    })
  })

  return <App {...store} />
}
```

### Connect

```tsx
import React, { FC } from 'react'

// inject part of state and actions from mapStateToProps and mapDispatchToProps
const SoteApp: FC = connect({
  mapStateToProps: (state: State) => ({
    count: state.count
  }),
  mapActionsToProps: (actions: Action) => ({
    add: actions.add,
    set: actions.set
  })
})(App)

// inject all state and actions to App
const SoteApp: FC = connect<Store>()(App)
```
