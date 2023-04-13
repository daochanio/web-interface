import { Flex, Heading, Text } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

export default function NotFound() {
	const intl = useIntl()

	return (
		<>
			<Flex justifyContent="center">
				<Heading display="inline-block" as="h2" size="2xl" bg="brand.200" backgroundClip="text">
					Oops!
				</Heading>
			</Flex>
			<Text textAlign="center" fontSize="18px" mt={3} mb={2}>
				{intl.formatMessage({ id: 'page-not-found', defaultMessage: 'Page Not Found' })}
			</Text>
			<Text textAlign="center" color={'gray.500'} mb={6}>
				{intl.formatMessage({
					id: 'non-existent-page',
					defaultMessage: "The page you're looking for does not seem to exist",
				})}
			</Text>
		</>
	)
}
