import { describe, expect, it } from 'vitest';
import { executeZeroFeeSwap } from '../lib/robinhoodChain';

const base = {
  tokenSymbol: 'T',
  tokenAddress: '0x0000000000000000000000000000000000000001',
  side: 'BUY' as const,
  amountEth: '0.01',
  expectedTokens: 1,
  slippageBps: 100,
};

describe('executeZeroFeeSwap safety', () => {
  it('paper mode returns no fabricated tx hash', async () => {
    const res = await executeZeroFeeSwap({ ...base, walletAddress: null, forcePaperMode: true });
    expect(res).toEqual({ txHash: null, mode: 'PAPER' });
  });
  it('aborts without a connected wallet (no shared-relayer fallback)', async () => {
    await expect(executeZeroFeeSwap({ ...base, walletAddress: null })).rejects.toThrow(/Connect a wallet/);
  });
  it('propagates wallet rejection instead of faking success', async () => {
    (window as unknown as { ethereum: unknown }).ethereum = {
      request: async () => {
        throw Object.assign(new Error('User rejected the request.'), { code: 4001 });
      },
    };
    await expect(executeZeroFeeSwap({ ...base, walletAddress: '0x1' })).rejects.toThrow();
  });
});
