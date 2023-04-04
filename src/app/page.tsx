'use client'

import { Button, FormControl, FormLabel, Input, List, ListItem } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useSigner } from 'wagmi'
import { createThread, getThreads } from '../common/api'

export default function Home() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['threads'], queryFn: () => getThreads(0, 100) })

  if (isError) {
    return <p>Error</p>
  }

  if (isLoading) {
    return <p>Loading...</p>
  }

  return (
    <>
      <List spacing={3}>
        {data?.map((thread) => (
          <ListItem key={thread.id}>{thread.content}</ListItem>
        ))}
      </List>
      <CreateThreadButton />
    </>
  )
}

function CreateThreadButton() {
  const intl = useIntl()
  const [content, setContent] = useState('')
  const { data: signer } = useSigner()
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: createThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] })
    },
  })

  return (
    <FormControl>
      <FormLabel>Content</FormLabel>
      <Input type="text" onChange={(event) => setContent(event.target.value)} />
      <Button disabled={!signer} onClick={() => mutate({ content, signer: signer! })}>
        {intl.formatMessage({ id: 'create-thread', defaultMessage: 'Create Thread' })}
      </Button>
    </FormControl>
  )
}
