import { Flex, Heading, Text } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

function Error() {
	const intl = useIntl()
	return (
		<>
			<Flex justifyContent="center">
				<Heading textAlign="center" display="inline-block" as="h2" size="2xl" bg="red.400" backgroundClip="text">
					:(
				</Heading>
			</Flex>
			<Text textAlign="center" fontSize="18px" mt={3} mb={2}>
				{intl.formatMessage({ id: 'unexpected-error', defaultMessage: 'Unexpected Error' })}
			</Text>
			<Text textAlign="center" color={'gray.500'} mb={6}>
				{intl.formatMessage({
					id: 'error-loading-page',
					defaultMessage: 'There was an error loading the page',
				})}
			</Text>
		</>
	)
}

export default Error
