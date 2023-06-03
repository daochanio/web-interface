import { Box, Button, Flex, Image, Text } from '@chakra-ui/react'
import { APIResponse, Comment, createCommentVote } from '../../common/api'
import { RxChatBubble } from 'react-icons/rx'
import { CreateCommentModal } from '../common/CreateCommentModal'
import { Icon, IconButton, useToast } from '@chakra-ui/react'
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'
import { BiDownvote, BiUpvote } from 'react-icons/bi'
import { GoArrowDown, GoArrowUp } from 'react-icons/go'
import { getVoteValue, VoteType } from '../../common/constants'
import { useState, useEffect, useReducer } from 'react'
import { useIntl } from 'react-intl'
import { getCommentVoteType, setCommentVoteType } from '../../common/storage'
import useAuth from '../../hooks/useAuth'
import ProfileDisplay from './ProfileDisplay'

export function CommentComponent({ comment }: { comment: Comment }) {
	const intl = useIntl()

	return (
		<Box border="1px solid gray" borderRadius={5}>
			<Box margin={3}>
				<Flex alignItems="center">
					<Flex grow={1} />
					<ProfileDisplay user={comment.user} />
				</Flex>
				<Flex>
					<Flex grow={1} />
					<Text fontSize="xs" color="gray.400">
						{comment.user.reputation} {intl.formatMessage({ id: 'reputation', defaultMessage: 'Reputation' })}
					</Text>
				</Flex>
				<Flex>
					{comment.image && <Image src={comment.image.url} maxWidth={250} maxHeight={250} />}
					<Box border="1px solid gray" borderRadius={5} width="100%" m={2}>
						<Text flex={1} p={3}>
							{comment.content}
						</Text>
					</Box>
				</Flex>
				<VoteComponent threadId={comment.threadId} commentId={comment.id} count={comment.votes} />
				<ReplyToCommentButton repliedToCommentId={comment.id} />
			</Box>
		</Box>
	)
}

function ReplyToCommentButton({ repliedToCommentId }: { repliedToCommentId: string }) {
	const intl = useIntl()
	const [isOpen, setIsOpen] = useState(false)
	const { safeInvoke } = useAuth()

	return (
		<>
			<Button
				size="xs"
				variant="ghost"
				bg="gray.900"
				_hover={{ bg: 'gray.700' }}
				leftIcon={<Icon as={RxChatBubble} w={4} h={4} color="brand.200" />}
				onClick={safeInvoke(() => setIsOpen(true))}
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
 * by maintaining the concept of a pending vote that is accepted/rejected on success/failure of the api call
 */

type State = {
	pendingVoteType: VoteType | undefined
	activeVoteType: VoteType
	pendingVotes: number | undefined
	activeVotes: number
}
const initialState: State = {
	pendingVoteType: undefined,
	pendingVotes: undefined,
	activeVoteType: VoteType.Unvote,
	activeVotes: 0,
}

function reducer(state: State, action: { type: string; payload?: VoteType }): State {
	switch (action.type) {
		case 'SET_PENDING': {
			const diff = getVoteValue(action.payload) - getVoteValue(state.activeVoteType)
			const pendingVotes = state.activeVotes + diff
			return { ...state, pendingVoteType: action.payload, pendingVotes }
		}
		case 'SET_ACTIVE_TYPE': {
			if (!action.payload) {
				return state
			}
			return { ...state, activeVoteType: action.payload }
		}
		case 'ACCEPT_PENDING': {
			if (state.pendingVoteType === undefined || state.pendingVotes === undefined) {
				return state
			}
			return {
				...state,
				activeVotes: state.pendingVotes,
				activeVoteType: state.pendingVoteType,
				pendingVotes: undefined,
				pendingVoteType: undefined,
			}
		}
		case 'REJECT_PENDING': {
			return { ...state, pendingVotes: undefined, pendingVoteType: undefined }
		}
		default: {
			throw new Error('Invalid action type')
		}
	}
}

function VoteComponent({ threadId, commentId, count }: { threadId: string; commentId: string; count: number }) {
	const toast = useToast()
	const intl = useIntl()
	const { token, address, safeInvoke } = useAuth()
	const [state, dispatch] = useReducer(reducer, { ...initialState, activeVotes: count })
	const queryClient = useQueryClient()
	const { mutate, isLoading } = useMutation({
		mutationFn: createCommentVote,
		onSuccess: () => {
			const { pendingVoteType, pendingVotes } = state
			if (pendingVoteType === undefined || pendingVotes === undefined || !address) {
				return
			}

			// 1. update the comment votes in the query cache
			// 2. store the users vote in local storage
			// 3. clear the pending vote
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
										votes: pendingVotes,
									}
								}
								return comment
							}),
						}
					}),
				}
			})

			setCommentVoteType(address, commentId, pendingVoteType) // cache the vote
			dispatch({ type: 'ACCEPT_PENDING' })
		},
		onError: (error) => {
			dispatch({ type: 'REJECT_PENDING' })
			toast({
				title: intl.formatMessage({ id: 'error-creating-comment-vote', defaultMessage: 'Error voting on comment' }),
				status: 'error',
				isClosable: true,
			})
			console.error(error)
		},
	})

	useEffect(() => {
		if (!address) {
			return
		}
		// check local storage for the user's vote on mount/address change
		const cachedVoteType = getCommentVoteType(address, commentId)
		dispatch({ type: 'SET_ACTIVE_TYPE', payload: cachedVoteType })
	}, [address, commentId])

	// set pending data and asynchronously update the vote
	const onClick = (clickedVoteType: VoteType) => {
		// don't let the user fire multiple mutations at the same time
		// we will get out of sync between storage and the api
		if (isLoading) {
			return
		}
		const newVoteType = state.activeVoteType === clickedVoteType ? VoteType.Unvote : clickedVoteType
		dispatch({ type: 'SET_PENDING', payload: newVoteType })
		mutate({ threadId, commentId, token, voteType: newVoteType })
	}

	// optimistically take the pending data if present
	// otherwise take the active data
	const voteType = state.pendingVoteType ?? state.activeVoteType
	const votes = state.pendingVotes ?? state.activeVotes

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
				onClick={safeInvoke(() => onClick(VoteType.Upvote))}
				variant="ghost"
				bg="gray.900"
				_hover={{ bg: 'gray.800' }}
				w={4}
				h={4}
			/>
			{votes}
			<IconButton
				aria-label="downvote"
				icon={
					voteType === VoteType.Downvote ? (
						<Icon as={GoArrowDown} w={5} h={5} color="brand.200" />
					) : (
						<Icon as={BiDownvote} w={4} h={4} color="brand.200" />
					)
				}
				onClick={safeInvoke(() => onClick(VoteType.Downvote))}
				variant="ghost"
				bg="gray.900"
				_hover={{ bg: 'gray.800' }}
				w={4}
				h={4}
			/>
		</>
	)
}
