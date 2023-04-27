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
import { useSigner, useAccount } from 'wagmi'
import { createThread } from '../../common/api'

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
	const [image, setImage] = useState<File>()
	const { data: signer } = useSigner()
	const toast = useToast()

	const { mutate, isLoading } = useMutation({
		mutationFn: createThread,
		onSuccess: ({ data: { id } }) => {
			window.open(`/threads/${id}`, '_blank')
			close()
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
								if (!event.target.files || event.target.files.length < 1) {
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
								setImage(event.target.files[0])
							}}
						/>
					</FormControl>
				</ModalBody>

				<ModalFooter>
					{!title || !content || !image ? (
						<Button isDisabled>{intl.formatMessage({ id: 'create', defaultMessage: 'Create' })}</Button>
					) : (
						<Button isLoading={isLoading} onClick={() => mutate({ title, content, image, signer })}>
							{intl.formatMessage({ id: 'create', defaultMessage: 'Create' })}
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
