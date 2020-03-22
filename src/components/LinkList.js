import React from 'react'
import gql from 'graphql-tag'
import { useQuery, useSubscription } from 'urql'

import Link from './Link'

// Create GraphQL query - gql parses string into the standard GraphQL AST
export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
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

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription NewVotesSubscription {
    newVote {
      link {
        id
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

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription NewLinksSubscription {
    newLink {
      id
      url
      description
      createdAt
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
`

const LinkList = (props) => {
  const isNewPage = props.location.pathname.includes('new')
  const page = parseInt(props.match.params.page, 10)
  const pageSize = 10
  const skip = isNewPage ? (page - 1) * pageSize : 0

  // Pass GraphQL query to useQuery hook
  //  - eagerly executes queries and runs them immediately if no 'pause' option specified
  const [queryState, executeQuery] = useQuery({
    query: FEED_QUERY,
    variables: {
      skip,
      first: isNewPage ? pageSize : 100,
      orderBy: isNewPage ? 'createdAt_DESC' : null,
    },
    /*
      We could also use polling to refetch the data.
      'cache-and-network' is necessary so the cache updates from the network request
    */
    //  pollInterval: 5000,
    //  requestPolicy: 'cache-and-network',
  })
  const { data, fetching, error } = queryState

  /*
    A new vote is an update to an existing link so no cache updater needs to be defined.

    The normalized cache can update the link that the subscription definition asks for
    and automatically refresh the FEED_QUERY data.
  */
  useSubscription({ query: NEW_VOTES_SUBSCRIPTION })

  /*
    New links do not exist in urql's cache so we need to define a manual cache
    updater to automatically refresh the FEED_QUERY data.
  */
  useSubscription({ query: NEW_LINKS_SUBSCRIPTION })

  const refetch = () => {
    executeQuery({
      // refetch from network:
      // requestPolicy: 'network-only',
      // refetch from network but keep displaying cached data:
      requestPolicy: 'cache-and-network',
    })
  }

  const goToNextPage = () => {
    if (page <= data.feed.count / 10) {
      props.history.push(`/new/${page + 1}`)
    }
  }

  const goToPrevPage = () => {
    if (page > 1) {
      props.history.push(`/new/${page - 1}`)
    }
  }

  const linksToRender = React.useMemo(() => {
    if (!data) {
      return []
    } else if (isNewPage) {
      return data.feed.links
    } else {
      const rankedLinks = data.feed.links
        .slice()
        .sort((l1, l2) => l2.votes.length - l1.votes.length)
      return rankedLinks
    }
  }, [data, isNewPage])

  // Handle request loading & error states
  if (fetching) return <div>Fetching</div>
  if (error) return <div>Error</div>

  return (
    <div>
      <button onClick={refetch}>Refresh Links</button>

      {linksToRender.map((link, index) => (
        <Link key={link.id} link={link} index={skip + index} />
      ))}

      {isNewPage && (
        <div className="flex ml4 mv3 gray">
          <div className="pointer mr2" onClick={goToPrevPage}>
            Previous
          </div>
          <div className="pointer" onClick={goToNextPage}>
            Next
          </div>
        </div>
      )}
    </div>
  )
}

export default LinkList
