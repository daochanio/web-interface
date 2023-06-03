import { useToast } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useAccount, useMutation, useWalletClient } from 'wagmi'
import { signin } from '../common/api'
import jwtDecode from 'jwt-decode'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Claims = {
	iss: string
	sub: string
	iat: number
	exp: number
}

interface TokenState {
	tokens: { [address: string]: string | undefined }
	setToken: (address: string, token: string | undefined) => void
	getToken: (address: string | undefined) => string | undefined
}

// tokens are managed through zustand and persisted to local storage
// so that users
export const useTokenStore = create<TokenState>()(
	persist(
		(set, get) => ({
			tokens: {},
			setToken: (address, token) =>
				set(({ tokens }) => {
					return { tokens: { ...tokens, [address]: token } }
				}),
			getToken: (address) => {
				return address ? get().tokens[address] : undefined
			},
		}),
		{
			name: 'token-storage',
		}
	)
)

export default function useSignin({ onSuccess }: { onSuccess?: () => void } = {}) {
	const intl = useIntl()
	const toast = useToast()
	const { address } = useAccount()
	const { data: walletClient } = useWalletClient()
	const { setToken, getToken } = useTokenStore()
	const { mutate, isLoading, isError } = useMutation({
		mutationFn: async () => {
			if (!walletClient) {
				throw new Error('No connector provided')
			}
			return signin({ walletClient })
		},
		onMutate: () => {
			toast({
				title: intl.formatMessage({
					id: 'signing-in-info',
					defaultMessage: 'Check your wallet for a message signing request!',
				}),
				status: 'info',
				duration: 5000,
				isClosable: true,
			})
		},
		onSuccess: (data) => {
			setToken(data.address, data.token)
			if (onSuccess) {
				onSuccess()
			}
		},
		onError: (error) => {
			toast({
				title: intl.formatMessage({ id: 'error-signin', defaultMessage: 'Failed to sign message' }),
				status: 'error',
				duration: 5000,
				isClosable: true,
			})
			console.error(error)
		},
	})

	const token = getToken(address)

	// check token expiration
	useEffect(() => {
		if (!address) {
			return
		}

		if (!token) {
			return
		}

		const claims = jwtDecode(token) as Claims
		const remainingMS = claims.exp * 1000 - Date.now()

		if (remainingMS < 0) {
			setToken(address, undefined)
			return
		}

		const timer = setTimeout(() => {
			setToken(address, undefined)
		}, remainingMS)
		return () => {
			clearTimeout(timer)
		}
	}, [token, address, setToken])

	return { token, signin: mutate, isLoading, isError }
}
