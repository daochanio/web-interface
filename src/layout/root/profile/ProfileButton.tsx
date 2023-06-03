import {
	Box,
	Button,
	Divider,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Flex,
	Icon,
	Stat,
	StatLabel,
	StatNumber,
	Text,
	useDisclosure,
	useToast,
} from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { useDisconnect, useMutation, useNetwork, useSwitchNetwork } from 'wagmi'
import { MdLanguage, MdOutlineCancel } from 'react-icons/md'
import { User } from '../../../common/api'
import ProfileDisplay from '../../common/ProfileDisplay'
import { useRef } from 'react'

export default function ProfileButton({ user }: { user: User }) {
	const { isOpen, onOpen, onClose } = useDisclosure()
	const btnRef = useRef(null)
	return (
		<>
			<Button
				onClick={onOpen}
				ref={btnRef}
				bg="gray.800"
				color="brand.200"
				_hover={{ bg: 'gray.900' }}
				_active={{ bg: 'gray.900' }}
			>
				<ProfileDisplay user={user} />
			</Button>
			<Drawer size="sm" placement="right" isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef}>
				<DrawerOverlay />
				<DrawerContent background="gray.900">
					<DrawerCloseButton variant="ghost" _hover={{ bg: 'gray.700' }} />
					<DrawerHeader>
						<ProfileDisplay user={user} />
					</DrawerHeader>
					<DrawerBody>
						<Divider />
						<ReputationBalance user={user} />
						<Flex direction="column" px={5}>
							<SwitchNetworkMenuItem />
							<DisconnectMenuItem />
						</Flex>
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	)
}

function ReputationBalance({ user }: { user: User }) {
	const intl = useIntl()

	return (
		<Text color="whiteAlpha.900" fontSize="md" textAlign="center" my={5}>
			{user.reputation} {intl.formatMessage({ id: 'drawer-reputation', defaultMessage: 'Reputation' })}
		</Text>
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
		<Button onClick={() => mutate(intendedChainId)} bg="gray.700" _hover={{ bg: 'gray.500' }} my={1}>
			<Flex alignItems="center">
				<Icon as={MdLanguage} w={5} h={5} color="whiteAlpha.900" />
			</Flex>
			<Text ml={3} color="whiteAlpha.900">
				{intl.formatMessage(
					{
						id: 'switch-network',
						defaultMessage: 'Switch to {chain}',
					},
					{ chain: 'Arbitrum' }
				)}
			</Text>
		</Button>
	)
}

function DisconnectMenuItem() {
	const intl = useIntl()
	const toast = useToast()
	const { disconnectAsync } = useDisconnect()
	const { mutate } = useMutation({
		mutationFn: disconnectAsync,
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
		<Button onClick={() => mutate()} bg="gray.700" _hover={{ bg: 'gray.500' }} my={1}>
			<Flex alignItems="center">
				<Icon color="red.500" as={MdOutlineCancel} w={5} h={5} />
			</Flex>
			<Text color="red.500" ml={3}>
				{intl.formatMessage({
					id: 'disconnect-wallet',
					defaultMessage: 'Disconnect Wallet',
				})}
			</Text>
		</Button>
	)
}
