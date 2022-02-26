import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useStore, Provider } from '../src'
import { todoStore, TodoStoreValue, TodoStoreState, TodoStoreActions } from './store'

import './index.css'

const Header = () => {
  // getter
  const { done } = useStore({
    mapStateToProps: (s: TodoStoreState) => ({
      done: s.todoList.filter((t) => t.complete).length
    })
  })
  return (
    <header>
      <h1>To Do List {done}</h1>
    </header>
  )
}

const ToDoList = () => {
  const store = useStore<TodoStoreValue>() // subscribe all store

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
    mapStateToProps: (a: TodoStoreState) => ({ ...a }),
    mapActionsToProps: (s: TodoStoreActions) => s
  })

  const addTask = (userInput) => {
    let copy = [...store.todoList]
    copy = [...copy, { id: store.todoList.length + 1, task: userInput, complete: false }]
    store.setToDoList(copy)
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
