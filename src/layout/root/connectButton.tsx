import { MdKeyboardArrowDown, MdLanguage, MdOutlineCancel } from 'react-icons/md'
import { TbPlugConnected } from 'react-icons/tb'
import {
	Button,
	Flex,
	Icon,
	Menu,
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuList,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Connector, useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi'
import { useMutation } from '@tanstack/react-query'
import useDisplayAddress from '../../hooks/useDisplayAddress'
import { signMessage } from '../../common/api'
import { clearSignature } from '../../common/storage'

export default function ConnectButton() {
	const intl = useIntl()
	const toast = useToast()
	const { mutate } = useMutation({
		mutationFn: async ({ connector }: { connector: Connector | undefined }) => {
			if (!connector) {
				throw new Error('No connector provided')
			}
			const walletClient = await connector.getWalletClient()
			return await signMessage({ walletClient })
		},
		onSuccess: ({ cached }) => {
			if (cached) {
				return
			}
			toast({
				title: intl.formatMessage({ id: 'success-signin', defaultMessage: 'Successfully signed in!' }),
				status: 'success',
				duration: 5000,
				isClosable: true,
			})
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-signin', defaultMessage: 'Failed to sign in' }),
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
			console.error(error)
		},
	})
	const { isConnected } = useAccount({
		onConnect: ({ connector }) => mutate({ connector }),
	})

	if (isConnected) {
		return <ProfileButton />
	}

	return <WalletConnectButton />
}

function ProfileButton() {
	const { address } = useAccount()
	const shortAddress = useDisplayAddress(address)

	return (
		<Menu>
			{({ isOpen }) => (
				<>
					<MenuButton
						as={Button}
						bg="gray.800"
						color="brand.200"
						_hover={{ bg: 'gray.900' }}
						_active={{ bg: 'gray.900' }}
						rightIcon={
							<Icon
								as={MdKeyboardArrowDown}
								color="brand.200"
								transition={'all .25s ease-in-out'}
								transform={isOpen ? 'rotate(180deg)' : ''}
							/>
						}
					>
						{shortAddress}
					</MenuButton>
					<MenuList>
						<SwitchNetworkMenuItem />
						<DisconnectMenuItem />
					</MenuList>
				</>
			)}
		</Menu>
	)
}

function SwitchNetworkMenuItem() {
	const intl = useIntl()
	const { switchNetworkAsync } = useSwitchNetwork()
	const toast = useToast()
	const { chain } = useNetwork()
	const intendedChainId = Number.parseInt(import.meta.env.VITE_CHAIN_ID ?? '')
	const { mutate } = useMutation({
		mutationFn: switchNetworkAsync,
		onSuccess: () => {
			toast({
				title: intl.formatMessage({
					id: 'success-switching-network',
					defaultMessage: 'Successfully switched network!',
				}),
				status: 'success',
				duration: 5000,
				isClosable: true,
			})
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-switching-network', defaultMessage: 'Error switching network' }),
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
			console.error(error)
		},
	})

	if (chain?.id === intendedChainId || !switchNetworkAsync) {
		return null
	}

	return (
		<>
			<MenuItem onClick={() => mutate(intendedChainId)}>
				<Flex alignItems="center">
					<Icon as={MdLanguage} w={5} h={5} color="brand.200" />
				</Flex>
				<Text ml={3} color="brand.200">
					{intl.formatMessage(
						{
							id: 'switch-network',
							defaultMessage: 'Switch to {chain}',
						},
						{ chain: 'Arbitrum' }
					)}
				</Text>
			</MenuItem>
			<MenuDivider />
		</>
	)
}

function DisconnectMenuItem() {
	const intl = useIntl()
	const toast = useToast()
	const { address } = useAccount()
	const { disconnectAsync } = useDisconnect()
	const { mutate } = useMutation({
		mutationFn: async () => {
			await disconnectAsync()
			if (address) {
				clearSignature(address)
			}
		},
		onSuccess: () => {
			toast({
				title: intl.formatMessage({
					id: 'success-disconnect',
					defaultMessage: 'Successfully disconnected wallet!',
				}),
				status: 'success',
				duration: 5000,
				isClosable: true,
			})
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-disconnect', defaultMessage: 'Error disconnecting wallet' }),
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
			console.error(error)
		},
	})

	return (
		<MenuItem onClick={() => mutate()}>
			<Flex alignItems="center">
				<Icon color="red.500" as={MdOutlineCancel} w={5} h={5} />
			</Flex>
			<Text color="red.500" ml={3}>
				{intl.formatMessage({
					id: 'disconnect-wallet',
					defaultMessage: 'Disconnect Wallet',
				})}
			</Text>
		</MenuItem>
	)
}

function WalletConnectButton() {
	const intl = useIntl()
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			<Button onClick={() => setIsOpen(true)} rightIcon={<Icon as={TbPlugConnected} w={4} h={4} color="gray.900" />}>
				{intl.formatMessage({
					id: 'connect',
					defaultMessage: 'Connect',
				})}
			</Button>
			<WalletConnectModal isOpen={isOpen} close={() => setIsOpen(false)} />
		</>
	)
}

function WalletConnectModal({ isOpen, close }: { isOpen: boolean; close: () => void }) {
	const intl = useIntl()
	const { connectors } = useConnect()

	return (
		<Modal isOpen={isOpen} onClose={() => close()}>
			<ModalOverlay />
			<ModalContent backgroundColor="gray.900">
				<ModalHeader>
					<Text textAlign="center">
						{intl.formatMessage({
							id: 'connect-a-wallet',
							defaultMessage: 'Connect to a Wallet',
						})}
					</Text>
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Flex direction="column">
						{connectors.map((connector) => (
							<ConnectorButton key={connector.id} connector={connector} onConnect={close} />
						))}
					</Flex>
				</ModalBody>

				<ModalFooter>
					<Button mr={3} onClick={() => close()}>
						{intl.formatMessage({
							id: 'close-wallet-connect-modal',
							defaultMessage: 'Close',
						})}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}

function ConnectorButton({ connector, onConnect }: { connector: Connector; onConnect: () => void }) {
	const { connect, isLoading, pendingConnector } = useConnect()

	return (
		<Button
			height={50}
			my={3}
			isDisabled={!connector.ready || (isLoading && connector.id !== pendingConnector?.id)}
			isLoading={isLoading && connector.id === pendingConnector?.id}
			onClick={() => {
				connect({ connector })
				onConnect()
			}}
		>
			{connector.name}
		</Button>
	)
}
