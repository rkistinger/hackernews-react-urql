import React from 'react'
import gql from 'graphql-tag'
import { useQuery } from 'urql'

import Link from './Link'

// Create GraphQL query - gql parses string into the standard GraphQL AST
const FEED_QUERY = gql`
  query GetFeed {
    feed {
      links {
        id
        createdAt
        description
        url
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`

const LinkList = () => {
  // Pass GraphQL query to useQuery hook
  //  - eagerly executes queries and runs them immediately if no 'pause' option specified
  const [queryState] = useQuery({ query: FEED_QUERY })
  const { data, fetching, error } = queryState

  // Handle request loading & error states
  if (fetching) return <div>Fetching</div>
  if (error) return <div>Error</div>

  return (
    <div>
      {data.feed.links.map((link, index) => (
        <Link key={link.id} link={link} index={index} />
      ))}
    </div>
  )
}

export default LinkList
