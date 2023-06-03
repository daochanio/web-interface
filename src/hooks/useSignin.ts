import { useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { useAccount, useMutation, useWalletClient } from 'wagmi'
import { signin } from '../common/api'
import { getToken, setToken as setTokenStorage } from '../common/storage'
import jwtDecode from 'jwt-decode'

type Claims = {
	iss: string
	sub: string
	iat: number
	exp: number
}

export default function useSignin({ onSuccess }: { onSuccess?: () => void } = {}) {
	const intl = useIntl()
	const toast = useToast()
	const { address } = useAccount()
	const { data: walletClient } = useWalletClient()
	const [token, setTokenState] = useState<string | undefined>(undefined)
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
					defaultMessage: 'Check your wallet for a sign message request!',
				}),
				status: 'info',
				duration: 5000,
				isClosable: true,
			})
		},
		onSuccess: (data) => {
			setTokenStorage(data.address, data.token)
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

	// keep token state in sync with storage
	useEffect(() => {
		function checkToken() {
			const storageToken = getToken(address)
			if (storageToken && getRemainingMS(storageToken) > 0) {
				setTokenState(storageToken)
			}
		}

		checkToken()

		window.addEventListener('storage', checkToken)

		return () => {
			window.removeEventListener('storage', checkToken)
		}
	}, [address])

	// check token expiration
	useEffect(() => {
		if (!token) {
			return
		}

		const remainingMS = getRemainingMS(token)

		const timer = setTimeout(() => {
			setTokenState(undefined)
		}, remainingMS)
		return () => {
			clearTimeout(timer)
		}
	}, [token])

	return { signin: mutate, token, isLoading, isError }
}

function getRemainingMS(token: string) {
	const claims = jwtDecode(token) as Claims
	return claims.exp * 1000 - Date.now()
}
