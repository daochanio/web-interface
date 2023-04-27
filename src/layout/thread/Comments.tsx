import { Button, Image, Spinner } from '@chakra-ui/react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { COMMENT_PAGE_SIZE } from '.'
import { Comment, getCommentsByThreadId, Page } from '../../common/api'
import { ReplyToCommentButton } from './createComment'

export function Comments({ initialComments, initialPage }: { initialComments?: Comment[]; initialPage?: Page }) {
	const { threadId } = useParams()
	const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
		queryKey: ['comments', threadId],
		queryFn: ({ pageParam }) => queryFn({ threadId, offset: pageParam ?? 0, limit: COMMENT_PAGE_SIZE }),
		getNextPageParam: ({ nextPage }) => nextPage?.offset,
		initialData: () => {
			if (!initialComments) {
				return undefined
			}
			return {
				pageParams: [0],
				pages: [{ data: initialComments, nextPage: initialPage }],
			}
		},
		staleTime: Infinity,
	})

	return (
		<div>
			{data &&
				data.pages.map((group, i) => (
					<Fragment key={i}>
						{group.data.map((comment) => (
							<div key={comment.id}>
								{comment.image && <Image src={comment.image.url} maxWidth={250} maxHeight={250} />}
								<p>{comment.content}</p>
								<ReplyToCommentButton repliedToCommentId={comment.id} />
							</div>
						))}
					</Fragment>
				))}
			<MoreButton hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} fetchNextPage={fetchNextPage} />
		</div>
	)
}

// TODO: Turn this into infinite scrolling
export function MoreButton({
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
}: {
	hasNextPage: boolean | undefined
	isFetchingNextPage: boolean
	fetchNextPage: () => void
}) {
	if (!hasNextPage) {
		return null
	}

	if (isFetchingNextPage) {
		return <Spinner color="brand.200" />
	}

	return <Button onClick={() => fetchNextPage()}>More</Button>
}

async function queryFn({ threadId, offset, limit }: { threadId?: string; offset: number; limit: number }) {
	if (!threadId) {
		throw new Error('threadId is required')
	}

	return await getCommentsByThreadId({ threadId, offset, limit })
}
