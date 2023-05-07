import { Flex, Spinner, Button, Icon } from '@chakra-ui/react'
import { InfiniteData, QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { APIResponse, getThreadById, Thread } from '../../common/api'
import { ThreadHeader } from '../common/ThreadHeader'
import Unexpected from '../unexpected'
import { Comments } from './Comments'
import { useState } from 'react'
import { HiPlus } from 'react-icons/hi'
import { useIntl } from 'react-intl'
import { CreateCommentModal } from '../common/CreateCommentModal'
import { ConnectController } from '../common/ConnectController'

export const COMMENT_PAGE_SIZE = 10

export default function ThreadPage() {
	const { threadId } = useParams()
	const queryClient = useQueryClient()
	const { data, isLoading, isError } = useQuery({
		queryKey: ['threads', threadId],
		queryFn: () => queryFn({ threadId, offset: 0, limit: COMMENT_PAGE_SIZE }),
		initialData: () => findInitialThread(queryClient, threadId),
		staleTime: Infinity,
	})

	if (isLoading) {
		return <Spinner />
	}

	if (isError || !data) {
		return <Unexpected />
	}

	return (
		<div>
			<Flex>
				<Flex grow={1} />
				<CreateCommentButton />
			</Flex>
			<ThreadHeader thread={data.data} />
			<Comments initialComments={data.data.comments} initialPage={data.nextPage} />
		</div>
	)
}

// If the user is navigating from the home page we likely already have the thread in the cache.
// Finding the thread in the cache is a PITA because its a nested array of pages of threads
// TODO: Comments for the thread will be undefined since get all threads doesn't return hydrated comments
// We can make get all threads return a small amount of hydrated comments in the future.
// This may have performance implications though.
function findInitialThread(queryClient: QueryClient, threadId?: string) {
	const queryData: InfiniteData<APIResponse<Thread[]>> | undefined = queryClient.getQueryData(['threads'])

	if (!queryData || !threadId) {
		return undefined
	}

	for (const page of queryData.pages) {
		for (const thread of page.data) {
			if (thread.id.toString() === threadId) {
				return { data: thread, nextPage: undefined }
			}
		}
	}
}

async function queryFn({ threadId, offset, limit }: { threadId?: string; offset: number; limit: number }) {
	if (!threadId) {
		throw new Error('threadId is required')
	}

	return getThreadById({ id: threadId, offset, limit })
}

function CreateCommentButton() {
	const intl = useIntl()
	const [isOpen, setIsOpen] = useState(false)
	return (
		<>
			<ConnectController>
				<Button rightIcon={<Icon as={HiPlus} mt={1} w={3} h={3} color="gray.900" />} onClick={() => setIsOpen(true)}>
					{intl.formatMessage({
						id: 'create-a-comment',
						defaultMessage: 'New Comment',
					})}
				</Button>
			</ConnectController>
			{isOpen && <CreateCommentModal isOpen={isOpen} close={() => setIsOpen(false)} />}
		</>
	)
}
