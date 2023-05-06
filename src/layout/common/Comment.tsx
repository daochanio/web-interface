import { Button, Flex, Image, Spinner } from '@chakra-ui/react'
import { APIResponse, Comment, createCommentVote } from '../../common/api'
import { useSigner, useAccount } from 'wagmi'
import { RxChatBubble } from 'react-icons/rx'
import { CreateCommentModal } from '../common/CreateCommentModal'
import { Icon, IconButton, Text, useToast } from '@chakra-ui/react'
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'
import { BiDownvote, BiUpvote } from 'react-icons/bi'
import { GoArrowDown, GoArrowUp } from 'react-icons/go'
import { VoteType } from '../../common/constants'
import { getItem, setItem } from '../../common/storage'
import { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { ConnectController } from './ConnectController'

export function CommentComponent({ comment }: { comment: Comment }) {
	return (
		<>
			{comment.image && <Image src={comment.image.url} maxWidth={250} maxHeight={250} />}
			<p>{comment.content}</p>
			<ConnectController>
				<VoteComponent threadId={comment.threadId} commentId={comment.id} count={comment.votes} isDisabled={true} />
				<ReplyToCommentButton repliedToCommentId={comment.id} isDisabled={true} />
			</ConnectController>
		</>
	)
}

function ReplyToCommentButton({ repliedToCommentId, isDisabled }: { repliedToCommentId: string; isDisabled: boolean }) {
	const intl = useIntl()
	const [isOpen, setIsOpen] = useState(false)
	return (
		<>
			<Button
				size="xs"
				variant="ghost"
				bg="gray.900"
				_hover={{ bg: 'gray.700' }}
				leftIcon={<Icon as={RxChatBubble} w={4} h={4} color="brand.200" />}
				isDisabled={isDisabled}
				onClick={() => setIsOpen(true)}
			>
				{intl.formatMessage({
					id: 'reply-to-comment',
					defaultMessage: 'Reply',
				})}
			</Button>
			{isOpen && (
				<CreateCommentModal isOpen={isOpen} close={() => setIsOpen(false)} repliedToCommentId={repliedToCommentId} />
			)}
		</>
	)
}

/**
 * Voting is an interesting case because the user expects to see their vote immediately
 * We also don't wan't to call the api to check whether they have voted or not for every thread/comment we render
 * This would be incredibly expensive and slow
 * So we both cache the user's votes in local storage and also render the user's votes optimistically
 */
function VoteComponent({
	threadId,
	commentId,
	count,
	isDisabled,
}: {
	threadId: string
	commentId: string
	count: string
	isDisabled: boolean
}) {
	const toast = useToast()
	const intl = useIntl()
	const { data: signer } = useSigner()
	const { address } = useAccount()
	const [pendingVoteType, setPendingVoteType] = useState<VoteType | undefined>()
	const [activeVoteType, setActiveVoteType] = useState<VoteType>(VoteType.Unvote)
	const queryClient = useQueryClient()
	const { mutate, isLoading } = useMutation({
		mutationFn: createCommentVote,
		onSuccess: () => {
			if (!pendingVoteType) {
				return
			}
			// store the users vote in local storage
			// update the comment count in the query cache
			// clear the pending vote

			const votes = BigInt(count)
			console.log(activeVoteType, pendingVoteType)

			//TODO: bigint and account for unvote
			// maybe check cache before setting to find if there is an old vote
			queryClient.setQueryData(['comments', threadId], (oldData: InfiniteData<APIResponse<Comment[]>> | undefined) => {
				if (!oldData) {
					return
				}
				return {
					pageParams: oldData.pageParams,
					pages: oldData.pages.map((page) => {
						return {
							...page,
							data: page.data.map((comment) => {
								if (comment.id === commentId) {
									return {
										...comment,
										votes:
											pendingVoteType === VoteType.Upvote
												? `${parseInt(comment.votes) + 1}`
												: `${parseInt(comment.votes) - 1}`,
									}
								}
								return comment
							}),
						}
					}),
				}
			})

			setItem('comment.vote', `${address}.${commentId}`, pendingVoteType) // cache the vote
			setActiveVoteType(pendingVoteType) // accept the pending vote type
			setPendingVoteType(undefined) // clear the pending vote type
		},
		onError: (error) => {
			setPendingVoteType(undefined) // clear the pending vote type
			toast({
				title: intl.formatMessage({ id: 'error-creating-comment-vote', defaultMessage: 'Error voting on comment' }),
				status: 'error',
				isClosable: true,
			})
			console.error(error)
		},
	})

	const onClick = (clickedVoteType: VoteType) => {
		const newVoteType = activeVoteType === clickedVoteType ? VoteType.Unvote : clickedVoteType
		setPendingVoteType(newVoteType)
		mutate({ threadId, commentId, signer, voteType: newVoteType })
	}

	useEffect(() => {
		// check local storage for the user's vote on mount/address change
		if (address) {
			const cachedVoteType = getItem('comment.vote', `${address}.${commentId}`) as VoteType | undefined
			if (cachedVoteType) {
				setActiveVoteType(cachedVoteType)
			}
		}
	}, [address, commentId])

	// optimistically take the pending vote type if present
	// otherwise take the active vote type

	const voteType = pendingVoteType ?? activeVoteType

	return (
		<>
			<IconButton
				aria-label="upvote"
				icon={
					voteType === VoteType.Upvote ? (
						<Icon as={GoArrowUp} w={5} h={5} color="brand.200" />
					) : (
						<Icon as={BiUpvote} w={4} h={4} color="brand.200" />
					)
				}
				isDisabled={isDisabled}
				onClick={() => onClick(VoteType.Upvote)}
				variant="ghost"
				bg="gray.900"
				_hover={{ bg: 'gray.800' }}
				w={4}
				h={4}
			/>
			{isLoading ? <Spinner w={2} h={2} /> : <Text as="span">{count}</Text>}
			<IconButton
				aria-label="downvote"
				isDisabled={isDisabled}
				icon={
					voteType === VoteType.Downvote ? (
						<Icon as={GoArrowDown} w={5} h={5} color="brand.200" />
					) : (
						<Icon as={BiDownvote} w={4} h={4} color="brand.200" />
					)
				}
				onClick={() => onClick(VoteType.Downvote)}
				variant="ghost"
				bg="gray.900"
				_hover={{ bg: 'gray.800' }}
				w={4}
				h={4}
			/>
		</>
	)
}
