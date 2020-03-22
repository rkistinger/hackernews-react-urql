import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import {
  Provider,
  Client,
  dedupExchange,
  fetchExchange,
  subscriptionExchange,
} from 'urql'
import { cacheExchange } from '@urql/exchange-graphcache'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import './styles/index.css'
import App from './components/App'
import { FEED_QUERY } from './components/LinkList'
import { getToken } from './token'

// Use a normalized cache instead of urql's default cacheExchange
// (queries will automatically be updated when a mutation changes the cached data)
const cache = cacheExchange({
  // Manually define how the cache is updated when the specified mutations or subscriptions run
  updates: {
    Mutation: {
      post: (mutationData, _mutationVariables, cache) => {
        const { post } = mutationData

        // Pass the cached query + variables that need to be updated
        cache.updateQuery(
          {
            query: FEED_QUERY,
            variables: {
              first: 10,
              skip: 0,
              orderBy: 'createdAt_DESC',
            },
          },
          (cacheData) => {
            if (cacheData !== null) {
              cacheData.feed.links.unshift(post)
              cacheData.feed.count++
              return cacheData
            } else {
              return null
            }
          }
        )
      },
    },
    Subscription: {
      newLink: (subscriptionData, _args, cache) => {
        const { newLink } = subscriptionData

        cache.updateQuery(
          {
            query: FEED_QUERY,
            variables: {
              first: 10,
              skip: 0,
              orderBy: 'createdAt_DESC',
            },
          },
          (cacheData) => {
            if (cacheData !== null) {
              cacheData.feed.links.unshift(newLink)
              cacheData.feed.count++
              return cacheData
            } else {
              return null
            }
          }
        )
      },
    },
  },
})

// Initialize the websocket connection to use in subscriptions
const subscriptionClient = new SubscriptionClient('ws://localhost:4000', {
  reconnect: true,
  connectionParams: {
    authToken: getToken(),
  },
})

// Configure a urql client instance with the endpoint of our GraphQL API
const client = new Client({
  url: 'http://localhost:4000',
  // Exchanges = middlewares used internally by urql (order matters)
  exchanges: [
    dedupExchange,
    cache,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: (operation) => subscriptionClient.request(operation),
    }),
  ],
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
