import type { Address, Hash } from 'viem'

export type Network = 'mainnet' | 'testnet'

export interface SDKConfig {
  rpcUrl: string
  privateKey?: `0x${string}`
  network?: Network
}

export interface NetworkAddresses {
  tradingVault: Address
  sevenN7DToken: Address
  usdc: Address
  profitDistributor: Address
  governanceDAO: Address
}

export interface VaultBalance {
  shares: bigint
  sharesFormatted: string
  assets: bigint
  assetsFormatted: string
}

export interface WithdrawalInfo {
  shares: bigint
  assets: bigint
  unlockTime: bigint
  isReady: boolean
}

export interface FeeTierInfo {
  tokenBalance: bigint
  tokenBalanceFormatted: string
  discountPercent: bigint
  effectivePerformanceFee: bigint
  effectiveManagementFee: bigint
}

export interface DepositWithApprovalResult {
  approveHash: Hash
  depositHash: Hash
}
