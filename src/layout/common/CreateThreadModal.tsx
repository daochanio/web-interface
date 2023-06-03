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
import { useNavigate } from 'react-router-dom'
import { APIResponse, createThread, Thread } from '../../common/api'
import useAuth from '../../hooks/useAuth'

// TODO:
// - full form validation
// - thread preview
export function CreateThreadModal({ isOpen, close }: { isOpen: boolean; close: () => void }) {
	const intl = useIntl()
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [image, setImage] = useState<File>()
	const { token } = useAuth()
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	const toast = useToast()

	const { mutate, isLoading } = useMutation({
		mutationFn: createThread,
		onSuccess: ({ data }) => {
			queryClient.setQueryData(['threads'], (oldData: InfiniteData<APIResponse<Thread[]>> | undefined) => {
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
			})
			close()
			navigate(`/threads/${data.id}`)
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-creating-thread', defaultMessage: 'Error creating thread' }),
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
							id: 'create-a-new-thread',
							defaultMessage: 'Create New Thread',
						})}
					</Text>
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<FormControl>
						<Input
							type="text"
							placeholder={intl.formatMessage({ id: 'thread-title', defaultMessage: 'title' })}
							onChange={(event) => setTitle(event.target.value)}
						/>
						<Input
							type="text"
							placeholder={intl.formatMessage({ id: 'thread-content', defaultMessage: 'content' })}
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
					{!title || !content || !image ? (
						<Button isDisabled>{intl.formatMessage({ id: 'create', defaultMessage: 'Create' })}</Button>
					) : (
						<Button isLoading={isLoading} onClick={() => mutate({ title, content, image, token })}>
							{intl.formatMessage({ id: 'create', defaultMessage: 'Create' })}
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
