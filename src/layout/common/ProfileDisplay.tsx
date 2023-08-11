import { Avatar, Box, Flex, Text } from '@chakra-ui/react'
import { Image as ImageData, User } from '../../common/api'
import useDisplayAddress from '../../hooks/useDisplayAddress'
import Image from './Image'

export default function ProfileDisplay({ user }: { user: User }) {
	// it's possible that the user had an ens name at one point but no longer does
	const displayAddress = useDisplayAddress(user.address)

	return (
		<Flex alignItems="center">
			<AvatarDisplay image={user.ensAvatar} />
			<Box w={2} />
			<Text fontWeight="bold">{user.ensName ?? displayAddress}</Text>
		</Flex>
	)
}

function AvatarDisplay({ image }: { image?: ImageData }) {
	if (!image) {
		return <Avatar bg="brand.200" width={32} height={32} />
	}

	return <Image image={image} width={32} height={32} borderRadius="50%" />
}
