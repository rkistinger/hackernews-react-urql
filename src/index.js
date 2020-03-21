import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, Client, dedupExchange, fetchExchange } from 'urql'
import { cacheExchange } from '@urql/exchange-graphcache'

import './styles/index.css'

import App from './components/App'

// Use a better normalized cache instead of urql's default cacheExchange
const cache = cacheExchange({})

// Configure a urql client instance with the endpoint of our GraphQL API
const client = new Client({
  url: 'http://localhost:4000',
  // exchanges = middlewares used internally by urql (order matters)
  exchanges: [dedupExchange, cache, fetchExchange],
})

ReactDOM.render(
  // Supply the client to urql's context provider
  <Provider value={client}>
    <App />
  </Provider>,
  document.getElementById('root')
)
