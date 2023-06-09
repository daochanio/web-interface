import { Button, Flex, List, ListItem, Spinner, Icon } from '@chakra-ui/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { getThreads } from '../../common/api'
import { ThreadHeader } from '../common/ThreadHeader'
import Unexpected from '../unexpected'
import { useState } from 'react'
import { HiPlus } from 'react-icons/hi'
import { useIntl } from 'react-intl'
import { CreateThreadModal } from '../common/CreateThreadModal'
import useAuth from '../../hooks/useAuth'

const THREAD_PAGE_SIZE = 10

export default function Home() {
	const intl = useIntl()
	const { data, isLoading, isError, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: ['threads'],
		queryFn: () => getThreads({ limit: THREAD_PAGE_SIZE }),
		getNextPageParam: () => 0,
		staleTime: Infinity,
	})
	const navigate = useNavigate()

	if (isLoading) {
		return <Spinner />
	}

	if (isError || !data) {
		return <Unexpected />
	}

	return (
		<>
			<Flex mb={5}>
				<Flex grow={1} />
				<CreateThreadButton />
			</Flex>
			<List spacing={3}>
				{data.pages.map((group, i) => (
					<Fragment key={i}>
						{group.data.map((thread) => (
							<ListItem key={thread.id}>
								<ThreadHeader thread={thread} />
								<Button my={5} onClick={() => navigate(`/threads/${thread.id}`)}>
									{intl.formatMessage({ id: 'view', defaultMessage: 'View' })}
								</Button>
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

function CreateThreadButton() {
	const intl = useIntl()
	const [isOpen, setIsOpen] = useState(false)
	const { safeInvoke } = useAuth()
	return (
		<>
			<Button
				rightIcon={<Icon as={HiPlus} mt={1} w={3} h={3} color="gray.900" />}
				onClick={safeInvoke(() => setIsOpen(true))}
			>
				{intl.formatMessage({
					id: 'create-a-thread',
					defaultMessage: 'New Thread',
				})}
			</Button>
			<CreateThreadModal isOpen={isOpen} close={() => setIsOpen(false)} />
		</>
	)
}

// TODO: Turn this into infinite scrolling
function MoreButton({ isFetchingNextPage, fetchNextPage }: { isFetchingNextPage: boolean; fetchNextPage: () => void }) {
	if (isFetchingNextPage) {
		return <Spinner color="brand.200" />
	}

	return <Button onClick={() => fetchNextPage()}>More</Button>
}
