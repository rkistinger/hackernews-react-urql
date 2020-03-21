import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from 'urql'

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
    }
  }
`

const CreateLink = (props) => {
  const [description, setDescription] = React.useState('')
  const [url, setUrl] = React.useState('')

  // Call executeMutation to run the mutation request
  const [mutationState, executeMutation] = useMutation(POST_MUTATION)

  const submit = async () => {
    // executeMutation returns a promise that we can await before preforming another action
    await executeMutation({ description, url })
    // props.history provided by react-router
    props.history.push('/')
  }

  return (
    <div>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          type="text"
          placeholder="A description for the link"
        />
        <input
          className="mb2"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="text"
          placeholder="The URL for the link"
        />
      </div>

      <button disabled={mutationState.fetching} onClick={submit}>
        Submit
      </button>
    </div>
  )
}

export default CreateLink
