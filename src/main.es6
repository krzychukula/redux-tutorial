'use strict'

const {createStore} = window.Redux

const counter = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

const store = createStore(counter)
const render = () => {
  document.body.innerText = store.getState()
}

document.addEventListener('click', () => {
  store.dispatch({type: 'INCREMENT'})
})

store.subscribe(render)
render()
