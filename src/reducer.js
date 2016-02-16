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
  filter: 'SHOW_COMPLETED'
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

const FilterLink = ({
  filter,
  currentFilter,
  children
}) => {
  if (filter === currentFilter) {
    return <span>{children}</span>
  }
  return (
    <a href='#'
       onClick={e => {
         e.preventDefault()
         store.dispatch({
           type: 'SET_VISIBILITY_FILTER',
           filter
         })
       }}
       >
       {children}
       </a>
  )
}

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

let nextTodoId = 1
class TodoApp extends Component {
  render () {
    const {
      todos,
      visibilityFilter
    } = this.props
    const visibleTodos = getVisibleTodos(
      todos,
      visibilityFilter
    )
    return (
      <div>
        <input ref={node => {
          this.input = node
        }} />
        <button onClick={() => {
          store.dispatch({
            type: 'ADD_TODO',
            text: this.input.value,
            id: nextTodoId++
          })
          this.input.value = ''
        }}>Add Todo</button>
        <ul>
          {visibleTodos.map(todo => {
            return <li key={todo.id}
                       onClick={() => {
                         store.dispatch({
                           type: 'TOGGLE_TODO',
                           id: todo.id
                         })
                       }}
                       style={{
                         textDecoration:
                          todo.completed ? 'line-through' : 'none'
                       }}>
              {todo.text}
            </li>
          })}
        </ul>
        <p>
          Show:
          {' '}
          <FilterLink
            filter='SHOW_ALL'
            currentFilter={visibilityFilter}
            >
              All
          </FilterLink>
          <FilterLink
            filter='SHOW_ACTIVE'
            currentFilter={visibilityFilter}
            >
              Active
          </FilterLink>
          <FilterLink
            filter='SHOW_COMPLETED'
            currentFilter={visibilityFilter}
            >
              Completed
          </FilterLink>
        </p>
      </div>
    )
  }
}
TodoApp.propTypes = {
  todos: React.PropTypes.array,
  visibilityFilter: React.PropTypes.string
}

const render = () => {
  ReactDOM.render(
    <TodoApp
      todos={store.getState().todos}
      visibilityFilter={store.getState().visibilityFilter}/>,
    document.getElementById('root')
  )
}

store.subscribe(render)
render()
