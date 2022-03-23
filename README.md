## Sote

[![CodeSandbox](https://img.shields.io/badge/Codesandbox-040404?style=for-the-badge&logo=codesandbox&logoColor=DBDBDB)](https://codesandbox.io/embed/nifty-sun-kenq35?theme=light)

```shell
pnpm i @bylin/sote
```

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
    async addAsync() {
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.count++
    }
  }
})

type Store = typeof store
type State = typeof store.state
type Action = typeof store.actions
```

## Inject Store

```tsx
import React, { FC } from 'react'
import { Provider } from 'sote'

const App: FC<State & Action> = ({ count, set, add, addAsync }) => {
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => set(0)}>reset</button>
      <button onClick={add}>add</button>
      <button onClick={addAsync}>addAsync</button>
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
    mapState: (state: State) => ({
      count: state.count
    }),
    mapActions: (actions: Action) => ({
      add: actions.add,
      set: actions.set
      addAsync: actions.addAsync
    })
  })

  return <App {...store} />
}
```

### useSelector & useActions

```tsx
const state = useSelect((state) => {
  count: state.count
})
const actions = useActions((actions) => {
  add: actions.add,
  set: actions.set
  addAsync: actions.addAsync
})
```

### Connect

```tsx
import React, { FC } from 'react'

// inject part of state and actions from mapState and mapDispatch
const SoteApp: FC = connect({
  mapState: (state: State) => ({
    count: state.count
  }),
  mapActions: (actions: Action) => ({
    add: actions.add,
    set: actions.set
    addAsync: actions.addAsync
  })
})(App)

// inject all state and actions to App
const SoteApp: FC = connect<Store>()(App)
```
