import { Button, Flex, Icon, Image, Link, LinkBox, LinkOverlay, List, ListItem, Text } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MdArrowForwardIos } from 'react-icons/md'
import { useIntl } from 'react-intl'
import { Link as RouterLink } from 'react-router-dom'
import { getThreads } from '../../common/api'
import Error from '../error'
import { CreateThreadButton } from './createThread'

export default function Home() {
	const intl = useIntl()
	const queryClient = useQueryClient()
	const { data, isLoading, isError } = useQuery({ queryKey: ['threads'], queryFn: getThreads, staleTime: Infinity })

	if (isLoading) {
		return <p>Loading...</p>
	}

	if (isError || !data) {
		return <Error />
	}

	console.log(data)

	return (
		<>
			<Flex>
				<Flex grow={1} />
				<CreateThreadButton />
			</Flex>
			<List spacing={3}>
				{data.map((thread) => (
					<ListItem key={thread.id}>
						<LinkBox>
							<Image src={thread.image.url} maxWidth={250} maxHeight={250} />
							<LinkOverlay as={RouterLink} to={`/threads/${thread.id}`}>
								{thread.title}
							</LinkOverlay>
							<Text as="p">{thread.content}</Text>
						</LinkBox>
					</ListItem>
				))}
			</List>
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
		</>
	)
}
