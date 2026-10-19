export interface Stat {
  label: string;
  value: string;
  demo: boolean;
}

/** Landing stats. Every value is demo until wired to a real indexer. */
export const LANDING_STATS: Stat[] = [
  { label: 'Testnet volume', value: '$1.2M', demo: true },
  { label: 'Trades executed', value: '48,210', demo: true },
  { label: 'Median fill latency', value: '410ms', demo: true },
  { label: 'Platform fee (testnet)', value: '0.00%', demo: false },
];

export const FEATURES = [
  { title: 'Pulse', body: 'Live new-pair feed split into New, Final Stretch and Migrated, with filters and presets.', path: '/pulse' },
  { title: 'Instant trade', body: 'One-click buy/sell presets and hotkeys, signed by your own wallet.', path: '/discover' },
  { title: 'Wallet tracker', body: 'Follow smart money and get notified when tracked wallets buy or sell.', path: '/trackers' },
  { title: 'Perpetuals', body: 'Leveraged perps terminal with orderbook and TP/SL controls (preview).', path: '/perps' },
  { title: 'Yield', body: 'Park idle balances in on-chain vaults between trades (preview).', path: '/yield' },
  { title: 'Rewards', body: 'Referral tiers and cashback for active traders (preview).', path: '/rewards' },
] as const;

export const STEPS = [
  { n: '01', title: 'Connect', body: 'Connect a browser wallet (MetaMask, Rabby, Coinbase, Phantom EVM). We never see your keys.' },
  { n: '02', title: 'Fund', body: 'Bridge or faucet testnet ETH into your own wallet. No deposits into our custody.' },
  { n: '03', title: 'Trade', body: 'Spot new pairs in Pulse, set presets, and execute with one click. You sign every trade.' },
] as const;

export const SECURITY_POINTS = [
  { title: 'Non-custodial', body: 'Trades are signed in your wallet. There is no shared or server-held signing key.' },
  { title: 'Abort on cancel', body: 'Rejecting a wallet prompt cancels the trade. Nothing is executed on your behalf.' },
  { title: 'Clear demo labelling', body: 'Simulated data is marked "Demo" everywhere until it is backed by a real indexer.' },
  { title: 'Open source', body: 'Contracts and frontend are public. A third-party audit is planned before mainnet.' },
] as const;

export const FEE_ROWS = [
  { tier: 'Standard', fee: '0.00%', cashback: '-', note: 'Testnet launch period' },
  { tier: 'Referred trader', fee: '0.00%', cashback: 'Planned', note: 'Referral program in development' },
  { tier: 'Referrer', fee: '0.00%', cashback: 'Planned', note: 'Revenue share on referred volume' },
] as const;

export const FAQ = [
  { q: 'Is One Shot live on mainnet?', a: 'No. One Shot currently runs on a public testnet. Testnet assets have no monetary value.' },
  { q: 'Do you hold my funds or keys?', a: 'No. You connect your own wallet and sign every transaction yourself.' },
  { q: 'Why does some data say "Demo"?', a: 'Several hubs (Pulse metrics, perps, yield, rewards) use simulated data while the real indexer is built. They are labelled clearly.' },
  { q: 'What does it cost?', a: 'There is no platform fee during the testnet period. You still pay network gas.' },
  { q: 'Which wallets are supported?', a: 'Any EIP-1193 / EIP-6963 browser wallet, including MetaMask, Rabby, Coinbase Wallet and Phantom (EVM).' },
] as const;
