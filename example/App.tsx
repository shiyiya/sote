import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useStore, Provider, connect, useCommit } from '../src'
import { todoStore, TodoStoreState, TodoStoreValue, TodoStoreActions } from './store'

import './index.css'

const Time = () => {
  const commit = useCommit<TodoStoreValue>()
  const store = useStore({
    mapState: (s: TodoStoreState) => ({
      time: s.date.time
    })
  })
  console.log('Time render')

  return (
    <p
      onClick={() => {
        commit((state) => {
          state.date.time = new Date().toLocaleTimeString()
        })
      }}
    >
      {store.time}
    </p>
  )
}

const Header = connect({
  mapState: (s: TodoStoreState) => ({
    display: s.date.display
  }),
  mapActions: (a: TodoStoreActions) => ({
    toggleTimeDisplay: a.toggleTimeDisplay
  })
})(({ display, toggleTimeDisplay }) => {
  console.log('Header render')

  return (
    <header>
      <h1>To Do List</h1>
      <label className="switch">
        <input type="checkbox" onChange={toggleTimeDisplay} checked={display} />
        <span className="slider round"></span>
      </label>
      {display && <Time />}
    </header>
  )
})

const ToDoList = () => {
  const store = useStore({
    mapState: (s: TodoStoreState) => ({ todoList: s.todoList }),
    mapActions: (a: TodoStoreActions) => a
  })

  const handleToggle = (id) => {
    let mapped = store.todoList.map((task) => {
      return task.id === Number(id) ? { ...task, complete: !task.complete } : { ...task }
    })
    store.setToDoList(mapped)
  }

  const handleFilter = () => {
    let filtered = store.todoList.filter((task) => {
      return !task.complete
    })
    store.setToDoList(filtered)
  }

  console.log('ToDoList render')

  return (
    <div>
      {store.todoList.map((todo, i) => {
        return <ToDo todo={todo} handleToggle={handleToggle} key={i} />
      })}
      <button style={{ margin: '20px' }} onClick={handleFilter}>
        Clear Completed
      </button>
    </div>
  )
}

const ToDo = ({ todo, handleToggle }) => {
  const handleClick = (e) => {
    e.preventDefault()
    handleToggle(e.currentTarget.id)
  }

  return (
    <div
      id={todo.id}
      key={todo.id + todo.task}
      onClick={handleClick}
      className={todo.complete ? 'todo strike' : 'todo'}
    >
      {todo.task}
    </div>
  )
}

const ToDoForm = () => {
  const [userInput, setUserInput] = useState('')

  // subscribe map store
  const store = useStore({
    mapState: (s: TodoStoreState) => ({ todoList: s.todoList }),
    mapActions: (a: TodoStoreActions) => a
  })

  const addTask = (userInput) => {
    const copy = [
      ...store.todoList,
      { id: store.todoList.length + 1, task: userInput, complete: false }
    ]
    store.addToDo({ id: store.todoList.length + 1, task: userInput, complete: false })
  }

  const handleChange = (e) => {
    setUserInput(e.currentTarget.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    addTask(userInput)
    setUserInput('')
  }

  const handleWaitSubmit = (e) => {
    e.preventDefault()
    store.waitAddToDo(userInput)
    setUserInput('')
  }

  console.log('ToDoForm render')

  return (
    <form onSubmit={handleSubmit}>
      <input value={userInput} type="text" onChange={handleChange} placeholder="Enter task..." />
      <button type="submit">Submit</button>
      <button type="button" onClick={handleWaitSubmit}>
        Wait 1s submit
      </button>
    </form>
  )
}

function App() {
  return (
    <div className="App">
      <Header />
      <ToDoList />
      <ToDoForm />
    </div>
  )
}

ReactDOM.render(
  <Provider value={todoStore}>
    <App />
  </Provider>,
  document.getElementById('app')
)
