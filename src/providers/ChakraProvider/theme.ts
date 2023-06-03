import { extendTheme } from '@chakra-ui/react'
import { menuTheme } from './menu'

const config = {
	initialColorMode: 'dark',
	useSystemColorMode: false,
	colors: {
		brand: {
			50: '#ffede0',
			100: '#fecfb4',
			200: '#fab387',
			300: '#f79255',
			400: '#f57426',
			500: '#db5b0e',
			600: '#aa4609',
			700: '#7a3205',
			800: '#4a1d00',
			900: '#1d0800',
		},
		gray: {
			50: '#f8f0f2',
			100: '#d8d8d9',
			200: '#bebebe',
			300: '#a4a4a4',
			400: '#8a8a8a',
			500: '#717171',
			600: '#585858',
			700: '#262626',
			800: '#1a1a1b',
			900: '#121212',
		},
	},
	zIndices: {
		// modified to ensure the wallet connect modal is on top of the connection drawer (zIndex 89 at the time of writing)
		// all the other zIndices are scaled to avoid weird overlaps
		base: 0,
		docked: 10,
		dropdown: 20,
		sticky: 30,
		banner: 40,
		overlay: 50,
		modal: 60, // <- this needs to be lower than wallet connect zindex
		popover: 70,
		skipLink: 80,
		toast: 90,
		tooltip: 100,
	},
	styles: {
		global: {
			body: {
				bg: 'gray.900',
				color: 'whiteAlpha.900',
				fontWeight: '500',
			},
		},
	},
	components: {
		Text: {
			baseStyle: {
				fontWeight: '500',
			},
		},
		Icon: {
			defaultProps: {
				color: 'whiteAlpha.900',
			},
		},
		Button: {
			variants: {
				solid: {
					bg: 'brand.200',
					fontWeight: '700',
					color: 'gray.700',
					_hover: {
						bg: 'brand.400',
					},
				},
				ghost: {
					bg: 'gray.800',
					fontWeight: '700',
					color: 'brand.200',
					_hover: {
						bg: 'gray.900',
					},
				},
			},
		},
		Menu: menuTheme,
	},
}

export const theme = extendTheme(config)
