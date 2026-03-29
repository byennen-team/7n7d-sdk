import type { Address, Hash, PublicClient, WalletClient, Chain } from 'viem'
import type { NetworkAddresses, FeeTierInfo } from './types.js'
import { SDKError, SDKErrorCode } from './errors.js'
import { formatTokens, parseTokens } from './utils.js'
import SevenN7DTokenABI from './abis/SevenN7DToken.json'
import TradingVaultABI from './abis/TradingVault.json'

export class TokenModule {
  constructor(
    private publicClient: PublicClient,
    private walletClient: WalletClient | undefined,
    private account: Address | undefined,
    private addresses: NetworkAddresses,
    private chain: Chain,
  ) {}

  private requireWallet(): { walletClient: WalletClient; account: Address } {
    if (!this.walletClient || !this.account) {
      throw new SDKError(
        'Wallet required for write operations. Provide a privateKey in the SDK config.',
        SDKErrorCode.NO_WALLET,
      )
    }
    return { walletClient: this.walletClient, account: this.account }
  }

  /** Get 7N7D token balance for an address. Returns human-readable string. */
  async getBalance(address: Address): Promise<string> {
    const balance = (await this.publicClient.readContract({
      address: this.addresses.sevenN7DToken,
      abi: SevenN7DTokenABI,
      functionName: 'balanceOf',
      args: [address],
    })) as bigint
    return formatTokens(balance)
  }

  /** Transfer 7N7D tokens. Amount in human-readable format (e.g. "100"). */
  async transfer(to: Address, amount: string): Promise<Hash> {
    const { walletClient, account } = this.requireWallet()
    const value = parseTokens(amount)
    return walletClient.writeContract({
      address: this.addresses.sevenN7DToken,
      abi: SevenN7DTokenABI,
      functionName: 'transfer',
      args: [to, value],
      account,
      chain: this.chain,
    })
  }

  /** Get fee discount tier info based on 7N7D token holdings. */
  async getFeeTier(address: Address): Promise<FeeTierInfo> {
    const result = (await this.publicClient.readContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'getUserFeeTier',
      args: [address],
    })) as [bigint, bigint, bigint, bigint]

    return {
      tokenBalance: result[0],
      tokenBalanceFormatted: formatTokens(result[0]),
      discountPercent: result[1],
      effectivePerformanceFee: result[2],
      effectiveManagementFee: result[3],
    }
  }
}
