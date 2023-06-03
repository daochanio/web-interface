import { Avatar, Box, Flex, Text } from '@chakra-ui/react'
import { User } from '../../common/api'
import useDisplayAddress from '../../hooks/useDisplayAddress'

export default function ProfileDisplay({ user }: { user: User }) {
	// it's possible that the user had an ens name at one point but no longer does
	const displayAddress = useDisplayAddress(user.address)

	return (
		<Flex alignItems="center">
			<Avatar bg="brand.200" size="sm" src={user.ensAvatar?.url} />
			<Box w={2} />
			<Text fontWeight="bold">{user.ensName ?? displayAddress}</Text>
		</Flex>
	)
}
