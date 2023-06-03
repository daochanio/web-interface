import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Button,
	Text,
	useToast,
	FormControl,
	Input,
} from '@chakra-ui/react'
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { APIResponse, Comment, createComment } from '../../common/api'
import useAuth from '../../hooks/useAuth'

// TODO:
// - full form validation
// - comment preview
export function CreateCommentModal({
	isOpen,
	close,
	repliedToCommentId,
}: {
	isOpen: boolean
	close: () => void
	repliedToCommentId?: string
}) {
	const intl = useIntl()
	const { threadId } = useParams()
	const [content, setContent] = useState('')
	const [image, setImage] = useState<File>()
	const { token } = useAuth()
	const toast = useToast()
	const queryClient = useQueryClient()
	const { mutate, isLoading } = useMutation({
		mutationFn: createComment,
		onSuccess: ({ data }) => {
			// Essentially we need to put the comment at the front of the comments list for this thread.
			// We can do this by updating the cache directly.
			// Updates via setQueryData must be performed in an immutable way,
			// which is a PITA for a nested array.
			// NOTE: We are not technically updating the paging data here, but I think its fine?
			// https://react-query.tanstack.com/guides/mutations#updating-query-data
			queryClient.setQueryData(
				['comments', data.threadId],
				(oldData: InfiniteData<APIResponse<Comment[]>> | undefined) => {
					if (!oldData) {
						return undefined
					}
					const newPageZeroData = [data, ...oldData.pages[0].data]
					const newPageZero = { data: newPageZeroData, nextPage: oldData.pages[0].nextPage }
					oldData.pages.splice(0, 1)
					return {
						pages: [newPageZero, ...oldData.pages],
						pageParams: [...oldData.pageParams],
					}
				}
			)
			close()
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-creating-comment', defaultMessage: 'Error creating comment' }),
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
			console.error(error)
		},
	})
	return (
		<Modal isOpen={isOpen} onClose={() => close()}>
			<ModalOverlay />
			<ModalContent backgroundColor="gray.900">
				<ModalHeader>
					<Text textAlign="center">
						{intl.formatMessage({
							id: 'create-a-new-comment',
							defaultMessage: 'Create New Comment',
						})}
					</Text>
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<FormControl>
						<Input
							type="text"
							placeholder={intl.formatMessage({ id: 'comment-content', defaultMessage: 'content' })}
							onChange={(event) => setContent(event.target.value)}
						/>
						<Input
							type="file"
							accept="image/*"
							onChange={(event) => {
								if (!event.target.files || event.target.files.length < 1) {
									toast({
										title: intl.formatMessage({
											id: 'error-uploading-image',
											defaultMessage: 'Invalid image provided',
										}),
										status: 'error',
										duration: 5000,
										isClosable: true,
									})
									return
								}
								setImage(event.target.files[0])
							}}
						/>
					</FormControl>
				</ModalBody>

				<ModalFooter>
					{!threadId || !content || !image ? (
						<Button isDisabled>{intl.formatMessage({ id: 'create', defaultMessage: 'Create' })}</Button>
					) : (
						<Button
							isLoading={isLoading}
							onClick={() => mutate({ threadId, content, image, token, repliedToCommentId })}
						>
							{intl.formatMessage({ id: 'create', defaultMessage: 'Create' })}
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
