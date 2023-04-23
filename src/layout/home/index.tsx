import { Button, Flex, Image, LinkBox, LinkOverlay, List, ListItem, Spinner, Text } from '@chakra-ui/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { getThreads } from '../../common/api'
import Unexpected from '../unexpected'
import { CreateThreadButton } from './createThread'

export default function Home() {
	const { data, isLoading, isError, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: ['threads'],
		queryFn: () => getThreads({ limit: 1 }),
		getNextPageParam: () => 0,
		staleTime: Infinity,
	})

	if (isLoading) {
		return <Spinner />
	}

	if (isError || !data) {
		return <Unexpected />
	}

	return (
		<>
			<Flex>
				<Flex grow={1} />
				<CreateThreadButton />
			</Flex>
			<List spacing={3}>
				{data.pages.map((group, i) => (
					<Fragment key={i}>
						{group.data.map((thread) => (
							<ListItem key={thread.id}>
								<LinkBox>
									{thread.image && <Image src={thread.image.url} maxWidth={250} maxHeight={250} />}
									<LinkOverlay as={RouterLink} to={`/threads/${thread.id}`}>
										{thread.title}
									</LinkOverlay>
									<Text as="p">{thread.content}</Text>
								</LinkBox>
							</ListItem>
						))}
					</Fragment>
				))}
			</List>
			<Flex>
				<Flex grow={1} />
				<MoreButton isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} />
			</Flex>
		</>
	)
}

// TODO: Turn this into infinite scrolling
export function MoreButton({
	isFetchingNextPage,
	fetchNextPage,
}: {
	isFetchingNextPage: boolean
	fetchNextPage: () => void
}) {
	if (isFetchingNextPage) {
		return <Spinner color="brand.200" />
	}

	return <Button onClick={() => fetchNextPage()}>More</Button>
}
