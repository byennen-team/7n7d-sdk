import { formatUnits, parseUnits } from 'viem'

const USDC_DECIMALS = 6
const SHARES_DECIMALS = 18
const TOKEN_DECIMALS = 18

export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, USDC_DECIMALS)
}

export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, USDC_DECIMALS)
}

export function formatShares(shares: bigint): string {
  return formatUnits(shares, SHARES_DECIMALS)
}

export function parseShares(shares: string): bigint {
  return parseUnits(shares, SHARES_DECIMALS)
}

export function formatTokens(amount: bigint): string {
  return formatUnits(amount, TOKEN_DECIMALS)
}

export function parseTokens(amount: string): bigint {
  return parseUnits(amount, TOKEN_DECIMALS)
}
