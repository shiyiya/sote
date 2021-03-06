import { createStore } from '../src'

const rawTodoList = [
  {
    id: 1,
    task: 'Give dog a bath',
    complete: true
  },
  {
    id: 2,
    task: 'Do laundry',
    complete: true
  },
  {
    id: 3,
    task: 'Vacuum floor',
    complete: false
  },
  {
    id: 4,
    task: 'Feed cat',
    complete: true
  },
  {
    id: 5,
    task: 'Change light bulbs',
    complete: false
  },
  {
    id: 6,
    task: 'Go to Store',
    complete: true
  },
  {
    id: 7,
    task: 'Fill gas tank',
    complete: true
  },
  {
    id: 8,
    task: 'Change linens',
    complete: false
  },
  {
    id: 9,
    task: 'Rake leaves',
    complete: true
  },
  {
    id: 10,
    task: 'Bake Cookies',
    complete: false
  },
  {
    id: 11,
    task: 'Take nap',
    complete: true
  },
  {
    id: 12,
    task: 'Read book',
    complete: true
  },
  {
    id: 13,
    task: 'Exercise',
    complete: false
  },
  {
    id: 14,
    task: 'Give dog a bath',
    complete: false
  },
  {
    id: 15,
    task: 'Do laundry',
    complete: false
  },
  {
    id: 16,
    task: 'Vacuum floor',
    complete: false
  },
  {
    id: 17,
    task: 'Feed cat',
    complete: true
  },
  {
    id: 18,
    task: 'Change light bulbs',
    complete: false
  },
  {
    id: 19,
    task: 'Go to Store',
    complete: false
  },
  {
    id: 20,
    task: 'Fill gas tank',
    complete: false
  }
]

export const todoStore = createStore({
  state: {
    todoList: rawTodoList,
    date: {
      display: false,
      time: new Date().toLocaleTimeString()
    }
  },
  actions: {
    toggleTimeDisplay() {
      this.date.display = !this.date.display
    },
    updateTime() {
      this.date.time = new Date().toLocaleTimeString()
    },
    setToDoList(todoList) {
      this.todoList = todoList
    },
    addToDo(task) {
      this.todoList.push(task)
    },
    async waitAddToDo(task) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      this.setToDoList(
        this.todoList.concat({
          id: this.todoList.length + 1,
          task,
          complete: false
        })
      )
    },
    // next api
    waitRemoveToDo(props, { commit }) {
      setTimeout(() => {
        this.todoList.push({
          id: this.todoList.length + 1,
          task: props.task,
          complete: false
        })
        commit()
      }, 1000)
    }
  }
})

export type TodoStoreValue = typeof todoStore

export type TodoStoreState = TodoStoreValue['state']

export type TodoStoreActions = TodoStoreValue['actions']
