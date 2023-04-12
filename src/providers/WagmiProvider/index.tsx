import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { arbitrum, arbitrumGoerli } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'

const { chains, provider } = configureChains(
	[import.meta.env.DEV ? arbitrumGoerli : arbitrum],
	[alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY ?? '' })]
)

const walletConnectConnector = new WalletConnectConnector({
	chains,
	options: {
		projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID ?? '',
		showQrModal: true,
	},
})

const metaMaskConnector = new MetaMaskConnector({
	chains,
})

const coinbaseWalletConnector = new CoinbaseWalletConnector({
	chains,
	options: {
		appName: 'daochan.io',
	},
})

const injectedConnector = new InjectedConnector({
	chains,
	options: {
		name: 'Injected',
		shimDisconnect: true,
	},
})

const client = createClient({
	autoConnect: true,
	connectors: [walletConnectConnector, metaMaskConnector, coinbaseWalletConnector, injectedConnector],
	provider,
})

function WagmiProvider({ children }: { children: React.ReactNode }) {
	return <WagmiConfig client={client}>{children}</WagmiConfig>
}

export default WagmiProvider
