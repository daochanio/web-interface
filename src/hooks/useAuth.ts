import { useAccount } from 'wagmi'
import { useConnectionStore } from '../layout/root/profile/ConnectionButton'
import useSignin from './useSignin'
import useUser from './useUser'

export type SafeInvoke = (fn: () => void) => () => void

export default function useAuth() {
	const { isConnected, address } = useAccount()
	const { token } = useSignin()
	const { user } = useUser({ address })
	const { onOpen } = useConnectionStore()

	const isAuthenticated = isConnected && address && !!token && !!user && !!user.ensName

	// When wrapping functions that require authentication, use the safeInvoke function
	// This will open the connection modal if the user is not authenticated
	const safeInvoke: SafeInvoke = (fn: () => void) => {
		return () => {
			if (isAuthenticated) {
				fn()
			} else {
				onOpen()
			}
		}
	}

	return { isAuthenticated, user, token, address, safeInvoke }
}
