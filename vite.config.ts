import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  parseEther,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const robinhoodTestnet = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.chain.robinhood.com'] },
  },
});

// SECURITY: these dev-server endpoints sign with the local deployer key (.deployer.json) and have
// no authentication. They are OFF by default and only mount under `vite dev` when
// ENABLE_DEV_RELAYER=true is set explicitly. Never expose them publicly; never use in production.
const DEV_RELAYER_ENABLED = process.env.ENABLE_DEV_RELAYER === 'true';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'one-shot-dev-relayer',
      apply: 'serve',
      configureServer(server) {
        if (!DEV_RELAYER_ENABLED) return;
        // eslint-disable-next-line no-console
        console.warn('[one-shot] ENABLE_DEV_RELAYER=true: unauthenticated local relayer endpoints are mounted.');
        // 1. On-Chain 0% Fee Swap Relayer (for Embedded Session Key / Instant Execution)
        server.middlewares.use('/api/relayer-swap', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { tokenAddress, side, ethAmount, tokenAmount } = JSON.parse(body);
              const deployerFile = path.resolve('.deployer.json');
              const contractsFile = path.resolve('src/lib/contracts.json');

              const deployer = JSON.parse(fs.readFileSync(deployerFile, 'utf8'));
              const contracts = JSON.parse(fs.readFileSync(contractsFile, 'utf8'));
              const account = privateKeyToAccount(deployer.privateKey);

              const publicClient = createPublicClient({
                chain: robinhoodTestnet,
                transport: http('https://rpc.testnet.chain.robinhood.com'),
              });

              const walletClient = createWalletClient({
                account,
                chain: robinhoodTestnet,
                transport: http('https://rpc.testnet.chain.robinhood.com'),
              });

              const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
              let txHash: `0x${string}`;

              if (side === 'BUY') {
                // Cap testnet relayer ETH value so deployer stays funded across many demo trades
                const safeEth = Math.min(Number(ethAmount) || 0.0001, 0.0003).toFixed(6);
                txHash = await walletClient.writeContract({
                  address: contracts.routerAddress as `0x${string}`,
                  abi: contracts.RobinhoodTerminalRouter.abi,
                  functionName: 'buyTokensZeroFee',
                  args: [tokenAddress as `0x${string}`, 0n, deadline],
                  value: parseEther(safeEth),
                });
              } else {
                const sellWei = parseEther(String(Math.max(Number(tokenAmount) || 1000, 1)));
                txHash = await walletClient.writeContract({
                  address: contracts.routerAddress as `0x${string}`,
                  abi: contracts.RobinhoodTerminalRouter.abi,
                  functionName: 'sellTokensZeroFee',
                  args: [tokenAddress as `0x${string}`, sellWei, 0n, deadline],
                });
              }

              await publicClient.waitForTransactionReceipt({ hash: txHash });

              res.end(
                JSON.stringify({
                  ok: true,
                  txHash,
                  protocolFeeBps: 0,
                  relayerAddress: account.address,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  ok: false,
                  error: err?.shortMessage || err?.message || 'Relayer execution failed',
                })
              );
            }
          });
        });

        // 2. On-Chain 0% Fee Token Launch Relayer
        server.middlewares.use('/api/relayer-launch', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { name, symbol, metadataUri, initialBuyEth } = JSON.parse(body);
              const deployerFile = path.resolve('.deployer.json');
              const contractsFile = path.resolve('src/lib/contracts.json');

              const deployer = JSON.parse(fs.readFileSync(deployerFile, 'utf8'));
              const contracts = JSON.parse(fs.readFileSync(contractsFile, 'utf8'));
              const account = privateKeyToAccount(deployer.privateKey);

              const publicClient = createPublicClient({
                chain: robinhoodTestnet,
                transport: http('https://rpc.testnet.chain.robinhood.com'),
              });

              const walletClient = createWalletClient({
                account,
                chain: robinhoodTestnet,
                transport: http('https://rpc.testnet.chain.robinhood.com'),
              });

              const safeBuy = Math.min(Number(initialBuyEth) || 0.0001, 0.0003).toFixed(6);
              const txHash = await walletClient.writeContract({
                address: contracts.routerAddress as `0x${string}`,
                abi: contracts.RobinhoodTerminalRouter.abi,
                functionName: 'launchZeroFeeToken',
                args: [name, symbol.toUpperCase(), metadataUri || `robinhood://${symbol.toLowerCase()}`],
                value: parseEther(safeBuy),
              });

              await publicClient.waitForTransactionReceipt({ hash: txHash });

              const allMarkets: any = await publicClient.readContract({
                address: contracts.routerAddress as `0x${string}`,
                abi: contracts.RobinhoodTerminalRouter.abi,
                functionName: 'getAllMarkets',
              });

              const latest = allMarkets[allMarkets.length - 1];

              res.end(
                JSON.stringify({
                  ok: true,
                  txHash,
                  tokenAddress: latest?.tokenAddress,
                  symbol: latest?.symbol,
                  name: latest?.name,
                  securityScore: 99,
                  protocolFeeBps: 0,
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  ok: false,
                  error: err?.shortMessage || err?.message || 'Relayer launch failed',
                })
              );
            }
          });
        });
      },
    },
  ],
  server: {
    port: 3000,
    host: true,
  },
});
