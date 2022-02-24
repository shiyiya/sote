import React, { useState } from 'react'
import { useStore, Provider } from '../src'
import { todoStore } from './store'
import './index.css'
import ReactDOM from 'react-dom'

const Header = () => {
  return (
    <header>
      <h1>To Do List</h1>
    </header>
  )
}

const ToDoList = () => {
  const store = useStore<typeof todoStore>({
    mapActionsToProps: (a) => a,
    mapStateToProps: (s) => ({ toDoList: s.todoList })
  }) as any

  const handleToggle = (id) => {
    let mapped = store.toDoList.map((task) => {
      return task.id === Number(id) ? { ...task, complete: !task.complete } : { ...task }
    })
    store.setToDoList(mapped)
  }

  const handleFilter = () => {
    let filtered = store.toDoList.filter((task) => {
      return !task.complete
    })
    store.setToDoList(filtered)
  }

  return (
    <div>
      {store.toDoList.map((todo, i) => {
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

  const store = useStore<typeof todoStore>({
    mapActionsToProps: (a) => a,
    mapStateToProps: (s) => ({ toDoList: s.todoList })
  }) as any

  const addTask = (userInput) => {
    let copy = [...store.toDoList]
    copy = [...copy, { id: store.toDoList.length + 1, task: userInput, complete: false }]
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
  return (
    <form onSubmit={handleSubmit}>
      <input value={userInput} type="text" onChange={handleChange} placeholder="Enter task..." />
      <button>Submit</button>
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
