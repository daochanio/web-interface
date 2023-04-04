import ChakraProvider from './ChakraProvider'
import IntlProvider from './IntlProvider'
import QueryProvider from './QueryProvider'
import WagmiProvider from './WagmiProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <ChakraProvider>
        <IntlProvider>
          <QueryProvider>{children}</QueryProvider>
        </IntlProvider>
      </ChakraProvider>
    </WagmiProvider>
  )
}
