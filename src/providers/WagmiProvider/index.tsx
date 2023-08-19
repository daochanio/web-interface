import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { arbitrum, foundry } from 'wagmi/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { createPublicClient, http } from 'viem'

const { chains } = configureChains(
	[import.meta.env.DEV ? foundry : arbitrum],
	[
		jsonRpcProvider({
			rpc: () => ({
				http: import.meta.env.VITE_PROVIDER_HTTP_URL,
				wss: import.meta.env.VITE_PROVIDER_WS_URL,
			}),
		}),
	]
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

const config = createConfig({
	autoConnect: true,
	connectors: [walletConnectConnector, metaMaskConnector, coinbaseWalletConnector],
	publicClient: createPublicClient({
		chain: import.meta.env.DEV ? foundry : arbitrum,
		transport: http(),
	}),
})

function WagmiProvider({ children }: { children: React.ReactNode }) {
	return <WagmiConfig config={config}>{children}</WagmiConfig>
}

export default WagmiProvider
