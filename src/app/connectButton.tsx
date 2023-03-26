"use client";

import { useHasMounted } from "@/src/hooks/useHasMounted";
import { MdLanguage, MdOutlineCancel } from "react-icons/md";
import {
  Button,
  Divider,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import useDisplayAddress from "../hooks/useDisplayAddress";
import { ChevronDownIcon } from "@chakra-ui/icons";

export default function ConnectButton() {
  const intl = useIntl();
  const { isConnected } = useAccount();
  const hasMounted = useHasMounted();

  // force this component to only render browser-side
  // wagmi uses browser-only APIs to connect to wallets that will cause issues during SSR
  // we return a forever loading button here as a placeholder
  // the text is to ensure the same length as the connect button that will replace this on mount
  if (!hasMounted) {
    return (
      <Button isLoading>
        {intl.formatMessage({
          id: "connect-loading",
          defaultMessage: "Connect",
        })}
      </Button>
    );
  }

  if (isConnected) {
    return <ProfileButton />;
  }

  return <WalletConnectButton />;
}

function ProfileButton() {
  const intl = useIntl();
  const account = useAccount();
  const shortAddress = useDisplayAddress(account?.address);
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const intendedChainId = Number.parseInt(
    process.env.NEXT_PUBLIC_CHAIN_ID ?? ""
  );

  return (
    <Menu>
      <MenuButton variant="ghost" as={Button} rightIcon={<ChevronDownIcon />}>
        {shortAddress}
      </MenuButton>
      <MenuList>
        {chain?.id !== intendedChainId && switchNetwork && (
          <>
            <MenuItem onClick={() => switchNetwork(intendedChainId)}>
              <Flex alignItems="center">
                <Icon as={MdLanguage} w={5} h={5} color="brand.200" />
              </Flex>
              <Text ml={3} color="brand.200">
                {intl.formatMessage(
                  { id: "switch-network", defaultMessage: "Switch to {chain}" },
                  { chain: "Arbitrum" }
                )}
              </Text>
            </MenuItem>
            <Divider my={2} />
          </>
        )}
        <MenuItem onClick={() => disconnect()}>
          <Flex alignItems="center">
            <Icon color="red.500" as={MdOutlineCancel} w={5} h={5} />
          </Flex>
          <Text color="red.500" ml={3}>
            {intl.formatMessage({
              id: "disconnect-wallet",
              defaultMessage: "Disconnect Wallet",
            })}
          </Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

function WalletConnectButton() {
  const toast = useToast();
  const intl = useIntl();
  const { isConnected } = useAccount();
  const { error } = useConnect();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && isConnected) {
      toast({
        title: intl.formatMessage({
          id: "connected-to-wallet",
          defaultMessage: "Connected to wallet",
        }),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }

    if (isConnected) {
      setIsOpen(false);
    }
  }, [isConnected, isOpen, toast, intl]);

  useEffect(() => {
    if (error) {
      toast({
        title: intl.formatMessage({
          id: "error-connect-to-wallet",
          defaultMessage: "Error connecting to wallet",
        }),
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast, intl]);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        {intl.formatMessage({
          id: "connect",
          defaultMessage: "Connect",
        })}
      </Button>
      <WalletConnectModal isOpen={isOpen} close={() => setIsOpen(false)} />
    </>
  );
}

function WalletConnectModal({
  isOpen,
  close,
}: {
  isOpen: boolean;
  close: () => void;
}) {
  const intl = useIntl();
  const { connectors } = useConnect();

  return (
    <Modal isOpen={isOpen} onClose={() => close()}>
      <ModalOverlay />
      <ModalContent backgroundColor="gray.900">
        <ModalHeader>
          <Text textAlign="center">
            {intl.formatMessage({
              id: "connect-a-wallet",
              defaultMessage: "Connect to a Wallet",
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
              id: "close-wallet-connect-modal",
              defaultMessage: "Close",
            })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ConnectorButton({ connector }: { connector: Connector }) {
  const { connect, isLoading, pendingConnector } = useConnect();

  return (
    <Button
      height={50}
      my={3}
      isDisabled={
        !connector.ready || (isLoading && connector.id !== pendingConnector?.id)
      }
      isLoading={isLoading && connector.id === pendingConnector?.id}
      onClick={() => connect({ connector })}
    >
      {connector.name}
    </Button>
  );
}
