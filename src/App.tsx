import ChakraProvider from './providers/ChakraProvider'
import IntlProvider from './providers/IntlProvider'
import QueryProvider from './providers/QueryProvider'
import RouterProvider from './providers/RouterProvider'
import WagmiProvider from './providers/WagmiProvider'

function App() {
	return (
		<WagmiProvider>
			<ChakraProvider>
				<IntlProvider>
					<QueryProvider>
						<RouterProvider />
					</QueryProvider>
				</IntlProvider>
			</ChakraProvider>
		</WagmiProvider>
	)
}

export default App
