import { describe, it, expect } from 'vitest'
import { SevenNSevenD } from '../src/client'
import { getAddresses, TESTNET_ADDRESSES, MAINNET_ADDRESSES } from '../src/addresses'
import { formatUSDC, parseUSDC, formatShares, parseShares, formatTokens, parseTokens } from '../src/utils'
import { SDKError, SDKErrorCode } from '../src/errors'

describe('SevenNSevenD Client', () => {
  const rpcUrl = 'https://rpc.sepolia.org'

  it('should initialize with testnet config', () => {
    const sdk = new SevenNSevenD({ rpcUrl, network: 'testnet' })
    expect(sdk.network).toBe('testnet')
    expect(sdk.addresses).toEqual(TESTNET_ADDRESSES)
    expect(sdk.address).toBeUndefined()
    expect(sdk.walletClient).toBeUndefined()
  })

  it('should default to testnet', () => {
    const sdk = new SevenNSevenD({ rpcUrl })
    expect(sdk.network).toBe('testnet')
    expect(sdk.addresses).toEqual(TESTNET_ADDRESSES)
  })

  it('should initialize with mainnet config', () => {
    const sdk = new SevenNSevenD({ rpcUrl, network: 'mainnet' })
    expect(sdk.network).toBe('mainnet')
    expect(sdk.addresses).toEqual(MAINNET_ADDRESSES)
  })

  it('should initialize with private key', () => {
    const sdk = new SevenNSevenD({
      rpcUrl,
      privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      network: 'testnet',
    })
    expect(sdk.address).toBeDefined()
    expect(sdk.walletClient).toBeDefined()
    expect(sdk.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')
  })

  it('should expose vault, token, and governance modules', () => {
    const sdk = new SevenNSevenD({ rpcUrl })
    expect(sdk.vault).toBeDefined()
    expect(sdk.token).toBeDefined()
    expect(sdk.governance).toBeDefined()
  })

  it('should expose public client', () => {
    const sdk = new SevenNSevenD({ rpcUrl })
    expect(sdk.publicClient).toBeDefined()
  })

  it('governance module should have DAO address', () => {
    const sdk = new SevenNSevenD({ rpcUrl, network: 'testnet' })
    expect(sdk.governance.daoAddress).toBe(TESTNET_ADDRESSES.governanceDAO)
  })
})

describe('Write operations require wallet', () => {
  const sdk = new SevenNSevenD({ rpcUrl: 'https://rpc.sepolia.org' })

  it('vault.deposit should throw without wallet', async () => {
    await expect(sdk.vault.deposit('100')).rejects.toThrow(SDKError)
    await expect(sdk.vault.deposit('100')).rejects.toThrow('Wallet required')
  })

  it('vault.approve should throw without wallet', async () => {
    await expect(sdk.vault.approve('100')).rejects.toThrow(SDKError)
  })

  it('vault.withdraw should throw without wallet', async () => {
    await expect(sdk.vault.withdraw('1')).rejects.toThrow(SDKError)
  })

  it('token.transfer should throw without wallet', async () => {
    await expect(
      sdk.token.transfer('0x0000000000000000000000000000000000000001', '100'),
    ).rejects.toThrow(SDKError)
  })

  it('SDKError should have correct code', async () => {
    try {
      await sdk.vault.deposit('100')
    } catch (e) {
      expect(e).toBeInstanceOf(SDKError)
      expect((e as SDKError).code).toBe(SDKErrorCode.NO_WALLET)
    }
  })
})

describe('Address Configuration', () => {
  it('should return testnet addresses', () => {
    const addresses = getAddresses('testnet')
    expect(addresses.tradingVault).toBe('0x3728F306Bc29d2A702cDb7919495E54F809405F8')
    expect(addresses.sevenN7DToken).toBe('0x8D8572E3bBC1F813997b9C4503c2243CcF3f2D72')
    expect(addresses.usdc).toBe('0x10297B02cFBe672267903E92deEc36Cff24C5D77')
    expect(addresses.profitDistributor).toBe('0xA9dBEBd6898961cB5B3DA7BeeA9b3A1974956771')
    expect(addresses.governanceDAO).toBe('0x3DE4AB52e6Aaba118aa681eC83fb7c1bC176f664')
  })

  it('should return mainnet addresses', () => {
    const addresses = getAddresses('mainnet')
    expect(addresses).toEqual(MAINNET_ADDRESSES)
  })
})

describe('Utilities', () => {
  it('formatUSDC should format with 6 decimals', () => {
    expect(formatUSDC(1_000_000n)).toBe('1')
    expect(formatUSDC(1_500_000n)).toBe('1.5')
    expect(formatUSDC(100n)).toBe('0.0001')
    expect(formatUSDC(0n)).toBe('0')
  })

  it('parseUSDC should parse to 6 decimals', () => {
    expect(parseUSDC('1')).toBe(1_000_000n)
    expect(parseUSDC('1.5')).toBe(1_500_000n)
    expect(parseUSDC('0.01')).toBe(10_000n)
    expect(parseUSDC('1000')).toBe(1_000_000_000n)
  })

  it('formatShares should format with 18 decimals', () => {
    expect(formatShares(1_000_000_000_000_000_000n)).toBe('1')
    expect(formatShares(500_000_000_000_000_000n)).toBe('0.5')
  })

  it('parseShares should parse to 18 decimals', () => {
    expect(parseShares('1')).toBe(1_000_000_000_000_000_000n)
    expect(parseShares('0.5')).toBe(500_000_000_000_000_000n)
  })

  it('formatTokens should format with 18 decimals', () => {
    expect(formatTokens(1_000_000_000_000_000_000n)).toBe('1')
  })

  it('parseTokens should parse to 18 decimals', () => {
    expect(parseTokens('1')).toBe(1_000_000_000_000_000_000n)
  })
})
