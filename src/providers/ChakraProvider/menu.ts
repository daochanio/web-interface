import { menuAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys)

const baseStyle = definePartsStyle({
	list: {
		border: '1px solid',
		borderColor: 'gray.700',
		bg: 'gray.900',
	},
	item: {
		bg: 'gray.900',
		_hover: {
			bg: 'gray.700',
		},
	},
	divider: {
		borderColor: 'gray.600',
	},
})

export const menuTheme = defineMultiStyleConfig({ baseStyle })
