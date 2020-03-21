import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from 'urql'

import Link from './Link'

// Create GraphQL query - gql parses string into the standard GraphQL AST
const FEED_QUERY = gql`
  query {
    feed {
      links {
        id
        createdAt
        description
        url
      }
    }
  }
`

const LinkList = () => {
  // Pass GraphQL query to useQuery hook (executes immediately)
  const [queryState] = useQuery({ query: FEED_QUERY })
  const { data, fetching, error } = queryState

  // Handle request loading & error states
  if (fetching) return <div>Fetching</div>
  if (error) return <div>Error</div>

  return (
    <div>
      {data.feed.links.map((link) => (
        <Link key={link.id} link={link} />
      ))}
    </div>
  )
}

export default LinkList
