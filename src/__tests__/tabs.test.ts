import { describe, expect, it } from 'vitest';
import { pathForTab, tabForPath, PRIMARY_TABS } from '../routes/tabs';

describe('route <-> tab mapping', () => {
  it('round-trips every primary tab', () => {
    for (const t of PRIMARY_TABS) expect(tabForPath(pathForTab(t))).toBe(t);
  });
  it('maps token routes to the terminal', () => {
    expect(pathForTab('terminal', '0xabc')).toBe('/token/0xabc');
    expect(tabForPath('/token/0xabc')).toBe('terminal');
  });
  it('rejects unknown and landing paths', () => {
    expect(tabForPath('/')).toBeNull();
    expect(tabForPath('/nope')).toBeNull();
  });
});
