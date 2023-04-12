import { Button, FormControl, FormLabel, Input, Link, List, ListItem } from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useSigner } from 'wagmi'
import { createThread, getThreads } from '../../common/api'

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
					<ListItem key={thread.id}>
						<Link as={RouterLink} to={`/threads/${thread.id}`}>
							{thread.content}
						</Link>
					</ListItem>
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
	const navigate = useNavigate()
	const { mutate } = useMutation({
		mutationFn: createThread,
		onSuccess: ({ id }) => {
			navigate(`/threads/${id}`)
		},
	})

	return (
		<FormControl>
			<FormLabel>Content</FormLabel>
			<Input type="text" onChange={(event) => setContent(event.target.value)} />
			<Button isDisabled={!signer} onClick={() => mutate({ content, signer })}>
				{intl.formatMessage({ id: 'create-thread', defaultMessage: 'Create Thread' })}
			</Button>
		</FormControl>
	)
}
