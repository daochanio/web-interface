import { Button, Flex, FormControl, Icon, Input, Link, List, ListItem, Tooltip, useToast } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { MdArrowForwardIos } from 'react-icons/md'
import { HiPlus } from 'react-icons/hi'
import { useIntl } from 'react-intl'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAccount, useSigner } from 'wagmi'
import { createThread, getThreads } from '../../common/api'
import Error from '../Error'

export default function Home() {
	const { data, isLoading, isError } = useQuery({ queryKey: ['threads'], queryFn: getThreads, staleTime: Infinity })

	if (isLoading) {
		return <p>Loading...</p>
	}

	if (isError || !data) {
		return <Error />
	}

	return (
		<>
			<List spacing={3}>
				{data.map((thread) => (
					<ListItem key={thread.id}>
						<Link as={RouterLink} to={`/threads/${thread.id}`}>
							{thread.content}
						</Link>
					</ListItem>
				))}
			</List>
			<CreateThreadButton />
			<NextButton />
		</>
	)
}

function NextButton() {
	const intl = useIntl()
	const queryClient = useQueryClient()
	return (
		<Flex>
			<Flex grow={1} />
			<Button
				rightIcon={<Icon as={MdArrowForwardIos} mt={1} w={3} h={3} color="gray.900" />}
				onClick={() => {
					queryClient.invalidateQueries({ queryKey: ['threads'] })
				}}
			>
				{intl.formatMessage({ id: 'next', defaultMessage: 'Next' })}
			</Button>
		</Flex>
	)
}

function CreateThreadButton() {
	const intl = useIntl()
	const [content, setContent] = useState('')
	const { data: signer } = useSigner()
	const navigate = useNavigate()
	const { isConnected } = useAccount()
	const toast = useToast()
	const { mutate } = useMutation({
		mutationFn: createThread,
		onSuccess: ({ id }) => {
			navigate(`/threads/${id}`)
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-creating-thread', defaultMessage: 'Error Creating Thread' }),
				status: 'error',
				duration: 9000,
				isClosable: true,
			})
			console.error(error)
		},
	})

	const isDisabled = !signer || !isConnected

	return (
		<FormControl>
			<Input
				type="text"
				placeholder={intl.formatMessage({ id: 'content', defaultMessage: 'content' })}
				onChange={(event) => setContent(event.target.value)}
			/>
			<Tooltip
				isDisabled={!isDisabled}
				label={intl.formatMessage({ id: 'connect-wallet-tooltip', defaultMessage: 'Connect to your wallet' })}
			>
				<Button
					rightIcon={<Icon as={HiPlus} mt={1} w={3} h={3} color="gray.900" />}
					isDisabled={isDisabled}
					onClick={() => mutate({ content, signer })}
				>
					{intl.formatMessage({ id: 'create-thread', defaultMessage: 'Create Thread' })}
				</Button>
			</Tooltip>
		</FormControl>
	)
}
