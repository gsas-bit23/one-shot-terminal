import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';
import {
  createPublicClient,
  createWalletClient,
  http,
  formatEther,
  parseEther,
  defineChain,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Testnet Explorer',
      url: 'https://explorer.testnet.chain.robinhood.com',
    },
  },
  testnet: true,
});

const contractPath = path.resolve('contracts/RobinhoodTerminalRouter.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'RobinhoodTerminalRouter.sol': {
      content: source,
    },
  },
  settings: {
    evmVersion: 'paris',
    viaIR: true,
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

console.log('Compiling RobinhoodTerminalRouter.sol with solc...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  for (const err of output.errors) {
    console.log(err.formattedMessage);
    if (err.severity === 'error') hasError = true;
  }
  if (hasError) process.exit(1);
}

const routerContract = output.contracts['RobinhoodTerminalRouter.sol']['RobinhoodTerminalRouter'];
const tokenContract = output.contracts['RobinhoodTerminalRouter.sol']['RobinhoodZeroFeeToken'];

async function main() {
  const deployerFile = path.resolve('.deployer.json');
  const deployerData = JSON.parse(fs.readFileSync(deployerFile, 'utf8'));
  const account = privateKeyToAccount(deployerData.privateKey);

  const publicClient = createPublicClient({
    chain: robinhoodTestnet,
    transport: http('https://rpc.testnet.chain.robinhood.com'),
  });

  const walletClient = createWalletClient({
    account,
    chain: robinhoodTestnet,
    transport: http('https://rpc.testnet.chain.robinhood.com'),
  });

  let routerAddress = '0xb1cf58ec71d4c363187d0406f2aa10499c279d02';
  let deployTxHash = '0xb2160aa892588139f858eeaeae1120d474fe05a16a01bdbb3d9b1b2d2ce8136b';
  let seededTokens = [];

  try {
    const blockNumber = await publicClient.getBlockNumber();
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`Connected to Robinhood Chain Testnet (Chain ID 46630) • Block #${blockNumber}`);
    console.log(`Deployer: ${account.address} • Balance: ${formatEther(balance)} ETH`);

    if (balance > parseEther('0.0008')) {
      console.log('Deploying Universal RobinhoodTerminalRouter V2 to Robinhood Chain Testnet...');
      const deployHash = await walletClient.deployContract({
        abi: routerContract.abi,
        bytecode: `0x${routerContract.evm.bytecode.object}`,
        args: [],
      });
      deployTxHash = deployHash;
      console.log(`Deploy Tx Hash: ${deployHash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: deployHash });
      routerAddress = receipt.contractAddress;
      console.log(`✅ RobinhoodTerminalRouter V2 deployed at: ${routerAddress}`);

      const initialSeeds = [
        {
          name: 'Robinhood Feather AI',
          symbol: 'FEATHER',
          uri: 'robinhood://feather-ai-zero-fee',
          buyEth: '0.0001',
        },
        {
          name: 'Sherwood Zero-Fee Index',
          symbol: 'SHERWOOD',
          uri: 'robinhood://sherwood-l2-vault',
          buyEth: '0.0001',
        },
        {
          name: 'Vlad Security Shield',
          symbol: 'SHIELD',
          uri: 'robinhood://vlad-mev-shield',
          buyEth: '0.0001',
        },
      ];

      for (const seed of initialSeeds) {
        try {
          console.log(`Launching & seeding ${seed.symbol} on-chain (0% Fee)...`);
          const tx = await walletClient.writeContract({
            address: routerAddress,
            abi: routerContract.abi,
            functionName: 'launchZeroFeeToken',
            args: [seed.name, seed.symbol, seed.uri],
            value: parseEther(seed.buyEth),
          });
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`  ✅ ${seed.symbol} launched (${tx})`);
        } catch (seedErr) {
          console.warn(`  ⚠️ Seed skipped for ${seed.symbol}:`, seedErr.shortMessage || seedErr.message);
        }
      }

      // Also initialize real Robinhood Chain Testnet Explorer tokens (TSLA & AMZN) in the router
      const externalL2Tokens = [
        '0xC9f9c86933092BbbfFF3CCb4b105A4A94bf3Bd4E', // TSLA on Robinhood Chain Testnet
        '0x5884aD2f920c162CFBbACc88C9C51AA75eC09E02', // AMZN on Robinhood Chain Testnet
      ];
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
      for (const extAddr of externalL2Tokens) {
        try {
          const tx = await walletClient.writeContract({
            address: routerAddress,
            abi: routerContract.abi,
            functionName: 'buyTokensZeroFee',
            args: [extAddr, 0n, deadline],
            value: parseEther('0.00005'),
          });
          await publicClient.waitForTransactionReceipt({ hash: tx });
          console.log(`  ✅ Initialized external Robinhood Testnet token ${extAddr} (${tx})`);
        } catch (extErr) {
          console.warn(`  ⚠️ External init skipped:`, extErr.shortMessage || extErr.message);
        }
      }

      try {
        const markets = await publicClient.readContract({
          address: routerAddress,
          abi: routerContract.abi,
          functionName: 'getAllMarkets',
        });
        seededTokens = markets.map((m) => ({
          tokenAddress: m.tokenAddress,
          name: m.name,
          symbol: m.symbol,
          metadataUri: m.metadataUri,
          creator: m.creator,
          securityScore: Number(m.securityScore),
        }));
      } catch (e) {
        // ignore
      }
    }
  } catch (rpcErr) {
    console.warn('RPC connection warning during deploy:', rpcErr.message || rpcErr);
  }

  const artifactData = {
    chainId: 46630,
    chainName: 'Robinhood Chain Testnet',
    rpcUrl: 'https://rpc.testnet.chain.robinhood.com',
    explorerUrl: 'https://explorer.testnet.chain.robinhood.com',
    routerAddress,
    deployTxHash,
    relayerAddress: account.address,
    seededTokens,
    RobinhoodTerminalRouter: {
      abi: routerContract.abi,
      bytecode: `0x${routerContract.evm.bytecode.object}`,
    },
    RobinhoodZeroFeeToken: {
      abi: tokenContract.abi,
      bytecode: `0x${tokenContract.evm.bytecode.object}`,
    },
  };

  fs.mkdirSync(path.resolve('src/lib'), { recursive: true });
  fs.writeFileSync(
    path.resolve('src/lib/contracts.json'),
    JSON.stringify(artifactData, null, 2)
  );
  console.log('✅ Wrote src/lib/contracts.json!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
