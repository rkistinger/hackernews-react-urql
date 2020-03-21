import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider, Client, dedupExchange, fetchExchange } from 'urql'
import { cacheExchange } from '@urql/exchange-graphcache'

import './styles/index.css'
import App from './components/App'
import { getToken } from './token'

// Use a better normalized cache instead of urql's default cacheExchange
// (queries will automatically be updated when a mutation changes the data)
const cache = cacheExchange({})

// Configure a urql client instance with the endpoint of our GraphQL API
const client = new Client({
  url: 'http://localhost:4000',
  // Exchanges = middlewares used internally by urql (order matters)
  exchanges: [dedupExchange, cache, fetchExchange],
  /*
    fetchExchange will call fetchOptions for every request it sends and
    attaches the returned options to its default fetch parameters.

    If an async task needs to be preformed like re-authenticating
    or refreshing the token we can write a custom Exchange (middleware)
    to handle the authentication.
  */
  fetchOptions: () => {
    const token = getToken()
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    }
  },
})

ReactDOM.render(
  <BrowserRouter>
    {/* Supply the client to urql's context provider */}
    <Provider value={client}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
)
