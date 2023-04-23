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
	Icon,
	Tooltip,
	useToast,
	FormControl,
	Input,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { HiPlus } from 'react-icons/hi'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useSigner, useAccount } from 'wagmi'
import { uploadImage, createThread } from '../../common/api'

export function CreateThreadButton() {
	const intl = useIntl()
	const [isOpen, setIsOpen] = useState(false)
	const { data: signer } = useSigner()
	const { isConnected } = useAccount()

	const isDisabled = !signer || !isConnected

	return (
		<>
			<Tooltip
				isDisabled={!isDisabled}
				label={intl.formatMessage({ id: 'connect-wallet-tooltip', defaultMessage: 'Connect to your wallet' })}
			>
				<Button
					rightIcon={<Icon as={HiPlus} mt={1} w={3} h={3} color="gray.900" />}
					isDisabled={isDisabled}
					onClick={() => setIsOpen(true)}
				>
					{intl.formatMessage({
						id: 'create-a-thread',
						defaultMessage: 'New Thread',
					})}
				</Button>
			</Tooltip>
			<CreateThreadModal isOpen={isOpen} close={() => setIsOpen(false)} />
		</>
	)
}

// TODO:
// - full form validation
// - thread preview
function CreateThreadModal({ isOpen, close }: { isOpen: boolean; close: () => void }) {
	const intl = useIntl()
	const [title, setTitle] = useState('')
	const [content, setContent] = useState('')
	const [imageFileName, setImageFileName] = useState('')
	const { data: signer } = useSigner()
	const navigate = useNavigate()
	const toast = useToast()

	const { mutate: uploadImageMutation, isLoading: uploadLoading } = useMutation({
		mutationFn: uploadImage,
		onSuccess: ({ data: { fileName } }) => {
			setImageFileName(fileName)
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-uploading-image', defaultMessage: 'Error uploading image' }),
				status: 'error',
				duration: 9000,
				isClosable: true,
			})
			console.error(error)
		},
	})
	const { mutate: createThreadMutation, isLoading: createThreadLoading } = useMutation({
		mutationFn: createThread,
		onSuccess: ({ data: { id } }) => {
			navigate(`/threads/${id}`)
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-creating-thread', defaultMessage: 'Error creating thread' }),
				status: 'error',
				duration: 9000,
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
								if (!event.target.files) {
									toast({
										title: intl.formatMessage({
											id: 'error-uploading-image',
											defaultMessage: 'Invalid image provided',
										}),
										status: 'error',
										duration: 9000,
										isClosable: true,
									})
									return
								}
								uploadImageMutation({ image: event.target.files[0], signer })
							}}
						/>
					</FormControl>
				</ModalBody>

				<ModalFooter>
					<Button
						isDisabled={!title || !content || !imageFileName}
						isLoading={uploadLoading || createThreadLoading}
						onClick={() => createThreadMutation({ title, content, imageFileName, signer })}
					>
						{intl.formatMessage({ id: 'create', defaultMessage: 'Create' })}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
