import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from 'urql'

import { getToken } from '../token'
import { timeDifferenceForDate } from '../dates'

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
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

const Link = ({ index, link }) => {
  const isLoggedIn = !!getToken()

  const [mutationState, executeMutation] = useMutation(VOTE_MUTATION)

  const upvote = () => {
    if (!mutationState.fetching) {
      // The link received back from the mutation will automatically update the FEED_QUERY
      // because we have enabled a normalized cache for the urql Client
      executeMutation({ linkId: link.id })
    }
  }

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{index + 1}.</span>
        {isLoggedIn && (
          <div className="ml1 gray f11" onClick={upvote}>
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {link.description} ({link.url})
        </div>
        <div className="f6 lh-copy gray">
          {link.votes.length} votes | by{' '}
          {link.postedBy ? link.postedBy.name : 'Unknown'}{' '}
          {timeDifferenceForDate(link.createdAt)}
        </div>
      </div>
    </div>
  )
}

export default Link
