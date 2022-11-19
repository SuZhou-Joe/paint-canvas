import 'antd/dist/antd.variable.min.css';
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  connectorsForWallets
} from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import RequestProvider from '../components/request-provider';

const { chains, provider } = configureChains(
    [{
      id: 31415,
      name: 'Filecoin — Wallaby testnet',
      network: 'filecoin',
      testnet: true,
      rpcUrls: {
        default: 'https://wallaby.node.glif.io/rpc/v0'
      }
    }],
    [
      alchemyProvider({ apiKey: 'UP7-vCgH4OfFwUygRDLg8dXpADY-zb3T' }),
      publicProvider()
    ]
  );

  const { wallets } = getDefaultWallets({
    chains,
    appName: 'Paint me'
  });

  const connectors = connectorsForWallets([
    ...wallets,
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet({ chains }),
      ],
    },
  ])
  
  const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider
  })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <RequestProvider>
          <Component {...pageProps} />
        </RequestProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
