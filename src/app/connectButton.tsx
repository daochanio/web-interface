'use client'

import { useHasMounted } from '@/src/hooks/useHasMounted'
import { MdKeyboardArrowDown, MdLanguage, MdLogin, MdOutlineCancel } from 'react-icons/md'
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
} from '@chakra-ui/react'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Connector, useAccount, useConnect, useDisconnect, useNetwork, useSigner, useSwitchNetwork } from 'wagmi'
import useDisplayAddress from '../hooks/useDisplayAddress'
import { signMessage } from '../common/api'
import { useMutation } from '@tanstack/react-query'

export default function ConnectButton() {
  const intl = useIntl()
  const { isConnected } = useAccount()
  const hasMounted = useHasMounted()

  // force this component to only render browser-side
  // wagmi uses browser-only APIs to connect to wallets that will cause issues during SSR
  // we return a forever loading button here as a placeholder
  // the text is to ensure the same length as the connect button that will replace this on mount
  if (!hasMounted) {
    return (
      <Button isLoading>
        {intl.formatMessage({
          id: 'connect-loading',
          defaultMessage: 'Connect',
        })}
      </Button>
    )
  }

  if (isConnected) {
    return <ProfileButton />
  }

  return <WalletConnectButton />
}

function ProfileButton() {
  const account = useAccount()
  const shortAddress = useDisplayAddress(account?.address)

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
            <SignMessageMenuItem />
            <SwitchNetworkMenuItem />
            <DisconnectMenuItem />
          </MenuList>
        </>
      )}
    </Menu>
  )
}

function SignMessageMenuItem({}) {
  const intl = useIntl()
  const { data: signer } = useSigner()
  const { mutate } = useMutation({
    mutationFn: signMessage,
  })

  if (!signer) {
    return <></>
  }

  return (
    <MenuItem onClick={() => mutate({ signer, noCache: true })}>
      <Flex alignItems="center">
        <Icon as={MdLogin} w={5} h={5} color="brand.200" />
      </Flex>
      <Text ml={3} color="brand.200">
        {intl.formatMessage({
          id: 'sign-in',
          defaultMessage: 'Sign in',
        })}
      </Text>
    </MenuItem>
  )
}

function SwitchNetworkMenuItem() {
  const intl = useIntl()
  const { switchNetwork } = useSwitchNetwork()
  const { chain } = useNetwork()
  const intendedChainId = Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '')
  if (chain?.id === intendedChainId || !switchNetwork) {
    return null
  }
  return (
    <>
      <MenuItem onClick={() => switchNetwork(intendedChainId)}>
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
  const { disconnect } = useDisconnect()
  return (
    <MenuItem onClick={() => disconnect()}>
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
              <ConnectorButton key={connector.id} connector={connector} />
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

function ConnectorButton({ connector }: { connector: Connector }) {
  const { connect, isLoading, pendingConnector } = useConnect()

  return (
    <Button
      height={50}
      my={3}
      isDisabled={!connector.ready || (isLoading && connector.id !== pendingConnector?.id)}
      isLoading={isLoading && connector.id === pendingConnector?.id}
      onClick={() => connect({ connector })}
    >
      {connector.name}
    </Button>
  )
}
