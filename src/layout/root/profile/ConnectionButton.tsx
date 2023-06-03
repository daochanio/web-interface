import {
	useSteps,
	Stepper,
	Step,
	StepIndicator,
	StepStatus,
	StepIcon,
	StepNumber,
	StepTitle,
	StepSeparator,
	Flex,
	Button,
	Box,
	Image,
	Text,
	useDisclosure,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Icon,
	useToast,
	Spinner,
} from '@chakra-ui/react'
import React, { useEffect } from 'react'
import { TbPlugConnected } from 'react-icons/tb'
import { useIntl } from 'react-intl'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import useSignin from '../../../hooks/useSignin'
import useUser from '../../../hooks/useUser'
import ProfileDisplay from '../../common/ProfileDisplay'
import { create } from 'zustand'

interface ConnectionState {
	isOpen: boolean
	onOpen: () => void
	onClose: () => void
}

// The connection drawer being open is provided as global state with zustand.
// This way other components can open the drawer from anyware in the app when the user needs to connect.
export const useConnectionStore = create<ConnectionState>()((set) => ({
	isOpen: false,
	onOpen: () => set(() => ({ isOpen: true })),
	onClose: () => set(() => ({ isOpen: false })),
}))

// General idea: A multi-step modal dialog that walks the user through the signup process:
// 1. Connect wallet
// 2. Sign message
// 3. Confirm ENS name
// 4. TODO: Switch network?

export default function ConnectionButton() {
	const intl = useIntl()
	const { isOpen, onOpen, onClose } = useConnectionStore()
	const btnRef = React.useRef(null)

	return (
		<>
			<Button ref={btnRef} onClick={onOpen} rightIcon={<Icon as={TbPlugConnected} w={4} h={4} color="gray.900" />}>
				{intl.formatMessage({
					id: 'connect',
					defaultMessage: 'Connect',
				})}
			</Button>
			<Drawer size="sm" placement="right" isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef}>
				<DrawerOverlay />
				<DrawerContent background="gray.900">
					<DrawerCloseButton variant="ghost" _hover={{ bg: 'gray.700' }} />
					<DrawerHeader>
						{intl.formatMessage({ id: 'complete-connection-steps', defaultMessage: 'Complete connection steps' })}
					</DrawerHeader>

					<DrawerBody>
						<ConnectionStepper onClose={onClose} />
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	)
}

function ConnectionStepper({ onClose }: { onClose: () => void }) {
	const intl = useIntl()
	const steps = [
		{
			title: intl.formatMessage({ id: 'connect-to-wallet-step', defaultMessage: 'Connect wallet' }),
		},
		{
			title: intl.formatMessage({ id: 'sign-message-step', defaultMessage: 'Sign message' }),
		},
		{
			title: intl.formatMessage({ id: 'confirm-ens-name-step', defaultMessage: 'Confirm ENS Name' }),
		},
	]
	const { activeStep, goToNext } = useSteps({
		index: 0,
		count: steps.length,
	})

	return (
		<Box maxWidth={700}>
			<Stepper index={activeStep} colorScheme="brand" mb={7}>
				{steps.map((step, index) => (
					<Step key={index}>
						<StepIndicator>
							<StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
						</StepIndicator>
						<StepTitle>{step.title}</StepTitle>
						<StepSeparator />
					</Step>
				))}
			</Stepper>
			{activeStep === 0 && <ConnectWalletStep goToNext={goToNext} />}
			{activeStep === 1 && <SignMessageStep goToNext={goToNext} />}
			{activeStep === 2 && <ConfirmENSNameStep goToNext={onClose} />}
		</Box>
	)
}

function ConnectWalletStep({ goToNext }: { goToNext: () => void }) {
	const intl = useIntl()
	const toast = useToast()
	const { isConnected } = useAccount()
	const { disconnect } = useDisconnect()
	const { connectors, connect, isLoading, pendingConnector } = useConnect({
		onSuccess: () => goToNext(),
		onError: (error) => {
			toast({
				title: intl.formatMessage({
					id: 'error-connecting-wallet',
					defaultMessage: 'Error connecting wallet',
				}),
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
			console.error(error)
		},
	})

	useEffect(() => {
		if (isConnected) {
			disconnect()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Flex direction="column">
			{connectors
				.filter((connector) => connector.ready)
				.map((connector) => (
					<Button
						key={connector.id}
						height={50}
						m={1}
						isDisabled={!connector.ready || (isLoading && connector.id !== pendingConnector?.id)}
						isLoading={isLoading && connector.id === pendingConnector?.id}
						onClick={() => connect({ connector })}
						justifyContent="left"
					>
						<Image src={`/logos/${connector.id}.svg`} w={10} h={10} ml={5} mr={3} />
						<Text fontWeight="bold">{connector.name}</Text>
					</Button>
				))}
		</Flex>
	)
}

function SignMessageStep({ goToNext }: { goToNext: () => void }) {
	const intl = useIntl()
	const { signin, isLoading } = useSignin({ onSuccess: () => goToNext() })

	return (
		<Button onClick={() => signin()} isLoading={isLoading}>
			{intl.formatMessage({ id: 'sign-message-button', defaultMessage: 'Sign Message' })}
		</Button>
	)
}

function ConfirmENSNameStep({ goToNext }: { goToNext: () => void }) {
	const intl = useIntl()
	const { address } = useAccount()
	const { user, isLoading, isError, refetch, isRefetching } = useUser({ address })

	if (isLoading) {
		return (
			<>
				<Text display="block" textAlign="center">
					{intl.formatMessage({
						id: 'loading-ens-profile',
						defaultMessage: 'Loading ENS profile...',
					})}
				</Text>
				<Flex justifyContent="center">
					<Spinner size="md" />
				</Flex>
			</>
		)
	}

	if (!user || isError) {
		return (
			<>
				<Text>
					{intl.formatMessage({
						id: 'error-loading-ens-profile',
						defaultMessage: 'There was an error fetching your ENS Profile. Please try again.',
					})}
				</Text>
				<Button onClick={() => refetch()}>
					{intl.formatMessage({ id: 'recheck-error', defaultMessage: 'Re-check ENS Name' })}
				</Button>
			</>
		)
	}

	if (!user.ensName) {
		return (
			<>
				<Text>
					{intl.formatMessage({
						id: 'could-not-find-ens-name',
						defaultMessage: 'We could not find your ENS Name. Please configure one and try again.',
					})}
				</Text>
				<Button onClick={() => refetch()} isLoading={isLoading || isRefetching}>
					{intl.formatMessage({ id: 'recheck-error', defaultMessage: 'Re-check ENS Name' })}
				</Button>
			</>
		)
	}

	return (
		<>
			<ProfileDisplay user={user} />
			<Button onClick={goToNext}>{intl.formatMessage({ id: 'confirm-ens-info', defaultMessage: 'Confirm' })}</Button>
		</>
	)
}
