import { Button, Icon } from '@chakra-ui/react'
import { FaChevronLeft } from 'react-icons/fa'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { Routes } from '../../common/routes'

export function BackButton() {
	const navigate = useNavigate()
	const intl = useIntl()
	return (
		<Button
			leftIcon={<Icon as={FaChevronLeft} w="5" h="5" color="brand.200" />}
			onClick={() => navigate(Routes.HOME)}
			aria-label="back"
			variant="ghost"
			bg="gray.900"
			_hover={{ bg: 'gray.700' }}
		>
			{intl.formatMessage({
				id: 'back',
				defaultMessage: 'Back',
			})}
		</Button>
	)
}
