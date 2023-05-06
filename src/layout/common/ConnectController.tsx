import { Box, Tooltip } from '@chakra-ui/react'
import { Children, cloneElement } from 'react'
import { useIntl } from 'react-intl'
import { useAccount, useSigner } from 'wagmi'

// wrapps the children with a tooltip and a disabled prop
// indicating if the user has connected their wallet or not
export function ConnectController({ children }: { children: React.ReactElement | React.ReactElement[] }) {
	const intl = useIntl()
	const { data: signer } = useSigner()
	const { address, isConnected } = useAccount()
	const isDisabled = !signer || !isConnected || !address

	return (
		<Tooltip
			isDisabled={!isDisabled}
			label={intl.formatMessage({ id: 'connect-wallet-tooltip', defaultMessage: 'Connect to your wallet' })}
		>
			<Box as="span">{Children.map(children, (child) => cloneElement(child, { isDisabled }))}</Box>
		</Tooltip>
	)
}
