'use strict'

import expect from 'expect'
import deepFreeze from 'deep-freeze'
import { createStore, combineReducers } from 'redux'
import React from 'react'
import ReactDOM from 'react-dom'
const { Component } = React

const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state
      }

      return {
        ...state,
        completed: !state.completed
      }
    default:
      return state
  }
}

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ]
    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action))
    default:
      return state
  }
}

const visibilityFilter = (
  state = 'SHOW_ALL',
  action
) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}

const todoApp = combineReducers({
  todos,
  visibilityFilter
})

const store = createStore(todoApp)

console.log('Initial store', store.getState())
console.log('ADD_TODO', store.dispatch({
  type: 'ADD_TODO',
  id: 0,
  text: 'Learn Redux'
}))
console.log('Store', store.getState())

console.log('SET_VISIBILITY_FILTER', store.dispatch({
  type: 'SET_VISIBILITY_FILTER',
  filter: 'SHOW_ALL'
}))
console.log('Store', store.getState())

const testAddTodo = () => {
  const stateBefore = []
  const action = {
    type: 'ADD_TODO',
    id: 0,
    text: 'Learn Redux'
  }
  const stateAfter = [{
    id: 0,
    text: 'Learn Redux',
    completed: false
  }]

  deepFreeze(stateBefore)
  deepFreeze(action)

  expect(
    todos(stateBefore, action)
  ).toEqual(stateAfter)
}

const testToggleTodo = () => {
  const stateBefore = [{
    id: 0,
    text: 'Learn Redux',
    completed: false
  }, {
    id: 1,
    text: 'Go shopping',
    completed: false
  }]
  const action = {
    type: 'TOGGLE_TODO',
    id: 1
  }
  const stateAfter = [{
    id: 0,
    text: 'Learn Redux',
    completed: false
  }, {
    id: 1,
    text: 'Go shopping',
    completed: true
  }]

  deepFreeze(stateBefore)
  deepFreeze(stateAfter)

  expect(
    todos(stateBefore, action)
  ).toEqual(stateAfter)
}

testAddTodo()
testToggleTodo()
console.log('reducer tests passed')

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case 'SHOW_ALL':
      return todos
    case 'SHOW_COMPLETED':
      return todos.filter(
        t => t.completed
      )
    case 'SHOW_ACTIVE':
      return todos.filter(
        t => !t.completed
      )
    default:
      return todos
  }
}

const Link = ({
  active,
  children,
  onClick
}) => {
  if (active) {
    return <span>{children}</span>
  }
  return (
    <a href='#'
       onClick={e => {
         e.preventDefault()
         onClick()
       }}
       >
       {children}
       </a>
  )
}

class FilterLink extends Component {
  componentDidMount () {
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate()
    })
  }
  componentWillUnmount () {
    this.unsubscribe()
  }
  render () {
    const props = this.props
    const state = store.getState()

    return (
      <Link
        active={
          props.filter === state.visibilityFilter
        }
        onClick={() =>
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter
          })
        } >
          {props.children}
        </Link>
    )
  }
}
let nextTodoId = 1
const AddTodo = () => {
  let input

  return (
    <div>
      <input ref={node => {
        input = node
      }} />
      <button onClick={() => {
        store.dispatch({
          type: 'ADD_TODO',
          id: nextTodoId++,
          text: input.value
        })
        input.value = ''
      }}>Add Todo</button>
    </div>
  )
}

const Todo = ({
  onClick,
  completed,
  text
}) => {
  return (<li
       onClick={onClick}
       style={{
         textDecoration:
          completed ? 'line-through' : 'none'
       }}>
    {text}
  </li>)
}

const TodoList = ({
  todos,
  onTodoClick
}) => {
  return (
    <ul>
    {todos.map(todo =>
      (<Todo key={todo.id}
      {...todo}
      onClick={() => onTodoClick(todo.id)} />)
    )}
  </ul>)
}

const Footer = () => (
  <p>
    Show:
    {' '}
    <FilterLink
      filter='SHOW_ALL'
      >
        All
    </FilterLink>
    {", "}
    <FilterLink
      filter='SHOW_ACTIVE'
      >
        Active
    </FilterLink>
    {", "}
    <FilterLink
      filter='SHOW_COMPLETED'
      >
        Completed
    </FilterLink>
  </p>
)

class VisibleTodoList extends Component {
  componentDidMount () {
    this.unsubscribe = store.subscribe(() => {
      this.forceUpdate()
    })
  }
  componentWillUnmount () {
    this.unsubscribe()
  }

  render () {
    const state = store.getState()

    return (
      <TodoList
        todos={
          getVisibleTodos(
            state.todos,
            state.visibilityFilter
          )
        }
        onTodoClick={id =>
          store.dispatch({
            type: 'TOGGLE_TODO',
            id
          })
        }
        />
    )
  }
}

const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)

ReactDOM.render(
  <TodoApp
    todos={store.getState().todos}
    visibilityFilter={store.getState().visibilityFilter}/>,
  document.getElementById('root')
)
