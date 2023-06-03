import { useQuery } from '@tanstack/react-query'
import { getUserByAddress } from '../common/api'

export default function useUser({ address }: { address: string | undefined }) {
	const {
		data: user,
		isLoading,
		isError,
		refetch,
		isRefetching,
	} = useQuery(
		['users', address],
		async () => {
			if (!address) {
				return null
			}
			const { data } = await getUserByAddress({ address })
			// If this is the first time the user is signing in, we need to wait for the users ens information to be hydrated
			// We treat this as an error and allow react query to naturally retry with its exponential backoff
			if (!data.updatedAt) {
				throw new Error('User not hydrated yet')
			}
			return data
		},
		{
			staleTime: Infinity,
		}
	)

	return { user, isLoading, isError, refetch, isRefetching }
}
