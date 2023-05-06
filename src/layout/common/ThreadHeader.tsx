import { Image } from '@chakra-ui/react'
import { Thread } from '../../common/api'
import { Icon, IconButton, Text, useToast } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BiDownvote, BiUpvote } from 'react-icons/bi'
import { GoArrowDown, GoArrowUp } from 'react-icons/go'
import { useIntl } from 'react-intl'
import { useAccount, useSigner } from 'wagmi'
import { createThreadVote } from '../../common/api'
import { VoteType } from '../../common/constants'
import { getItem, setItem } from '../../common/storage'
import { ConnectController } from './ConnectController'

export function ThreadHeader({ thread: { id, title, image, content, votes } }: { thread: Thread }) {
	return (
		<>
			<h1>{title}</h1>
			{image && <Image src={image.url} maxWidth={250} maxHeight={250} />}
			<p>{content}</p>
			<ConnectController>
				<VoteComponent threadId={id} count={votes} isDisabled={true} />
			</ConnectController>
		</>
	)
}

export function VoteComponent({
	threadId,
	count,
	isDisabled,
}: {
	threadId: string
	count: string
	isDisabled: boolean
}) {
	const toast = useToast()
	const intl = useIntl()
	const { data: signer } = useSigner()
	const { address } = useAccount()
	const [voteType, setVoteType] = useState<VoteType>(VoteType.Unvote)
	const { mutate } = useMutation({
		mutationFn: createThreadVote,
		onSuccess: () => {
			// store the users vote in local storage
			// update the thread count in the cache
			if (address) {
				setItem('threadvote', `${address}.${threadId}`, voteType)
			}
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-creating-thread-vote', defaultMessage: 'Error voting on thread' }),
				status: 'error',
				isClosable: true,
			})
			console.error(error)
		},
	})

	const onClick = (clickedVoteType: VoteType) => {
		const newVoteType = voteType === clickedVoteType ? VoteType.Unvote : clickedVoteType
		mutate({ threadId, signer, voteType: newVoteType })
		setVoteType(newVoteType)
	}

	useEffect(() => {
		// check local storage for the user's vote on mount/wallet change
		if (address) {
			const cachedVoteType = getItem('threadvote', `${address}.${threadId}`) as VoteType | undefined
			if (cachedVoteType) {
				setVoteType(cachedVoteType)
			}
		}
	}, [address, threadId])

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
			<Text as="span">{count}</Text>
			<IconButton
				aria-label="downvote"
				icon={
					voteType === VoteType.Downvote ? (
						<Icon as={GoArrowDown} w={5} h={5} color="brand.200" />
					) : (
						<Icon as={BiDownvote} w={4} h={4} color="brand.200" />
					)
				}
				isDisabled={isDisabled}
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
