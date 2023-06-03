import { Box, Tooltip } from '@chakra-ui/react'
import { Children, cloneElement } from 'react'
import { useIntl } from 'react-intl'
import useAuth from '../../hooks/useAuth'

// wrapps the children with a tooltip and a disabled prop
// indicating if the user has connected their wallet or not
export function AuthController({ children }: { children: React.ReactElement | React.ReactElement[] }) {
	const intl = useIntl()
	const { isAuthenticated } = useAuth()

	return (
		<Tooltip
			isDisabled={isAuthenticated}
			label={intl.formatMessage({ id: 'connect-wallet-tooltip', defaultMessage: 'Connect to your wallet' })}
		>
			<Box as="span">{Children.map(children, (child) => cloneElement(child, { isDisabled: !isAuthenticated }))}</Box>
		</Tooltip>
	)
}
