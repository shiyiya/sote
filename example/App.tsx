import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { useStore, Provider, connect, useCommit, useSelector, useActions } from '../src'
import { todoStore, TodoStoreState, TodoStoreActions, TodoStoreValue } from './store'

import './index.css'

const Time = () => {
  const commit = useCommit()
  const store = useSelector((s: TodoStoreState) => ({
    time: s.date.time
  }))
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
})(function Header({ display, toggleTimeDisplay }) {
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
    <div className="todo-list">
      {store.todoList.map((todo, i) => (
        <ToDo todo={todo} handleToggle={handleToggle} key={i} />
      ))}
      <button style={{ margin: '10px' }} onClick={handleFilter}>
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
  const { addToDo, waitAddToDo } = useActions<TodoStoreValue>()

  const addTask = (userInput) => {
    addToDo({ id: Date.now(), task: userInput, complete: false })
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
    waitAddToDo(userInput)
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
    <>
      <Header />
      <ToDoList />
      <ToDoForm />
    </>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <Provider value={todoStore}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('app')
)
