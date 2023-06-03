import { useAccount } from 'wagmi'
import useSignin from './useSignin'
import useUser from './useUser'

export default function useAuth() {
	const { isConnected, address } = useAccount()
	const { token } = useSignin()
	const { user } = useUser({ address })

	const isAuthenticated = isConnected && address && !!token && !!user && !!user.ensName

	return { isAuthenticated, user, token, address }
}
