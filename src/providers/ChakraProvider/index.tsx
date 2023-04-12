import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { theme } from './theme'

export default function ChakraProviderWrapper({ children }: { children: React.ReactNode }) {
	return (
		<>
			<ColorModeScript initialColorMode={'dark'} />
			<ChakraProvider theme={theme}>{children}</ChakraProvider>
		</>
	)
}
