import type { Address, Hash, PublicClient, WalletClient, Chain } from 'viem'
import type { NetworkAddresses, VaultBalance, WithdrawalInfo, DepositWithApprovalResult } from './types.js'
import { SDKError, SDKErrorCode } from './errors.js'
import { formatUSDC, parseUSDC, formatShares, parseShares } from './utils.js'
import TradingVaultABI from './abis/TradingVault.json'
import ERC20ABI from './abis/ERC20.json'

export class VaultModule {
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

  /** Get vault share balance and equivalent USDC value for an address. */
  async getBalance(address: Address): Promise<VaultBalance> {
    const shares = (await this.publicClient.readContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'balanceOf',
      args: [address],
    })) as bigint

    const assets = (await this.publicClient.readContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'convertToAssets',
      args: [shares],
    })) as bigint

    return {
      shares,
      sharesFormatted: formatShares(shares),
      assets,
      assetsFormatted: formatUSDC(assets),
    }
  }

  /** Get current price of one vault share in USDC. */
  async getSharePrice(): Promise<string> {
    const oneShare = parseShares('1')
    const assets = (await this.publicClient.readContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'convertToAssets',
      args: [oneShare],
    })) as bigint
    return formatUSDC(assets)
  }

  /** Get total value locked in the vault (USDC). */
  async getTVL(): Promise<string> {
    const totalAssets = (await this.publicClient.readContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'totalAssets',
    })) as bigint
    return formatUSDC(totalAssets)
  }

  /** Preview how many shares you'd receive for a USDC deposit. */
  async estimateDeposit(amount: string): Promise<string> {
    const assets = parseUSDC(amount)
    const shares = (await this.publicClient.readContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'previewDeposit',
      args: [assets],
    })) as bigint
    return formatShares(shares)
  }

  /** Check USDC allowance for the vault. */
  async getAllowance(address: Address): Promise<string> {
    const allowance = (await this.publicClient.readContract({
      address: this.addresses.usdc,
      abi: ERC20ABI,
      functionName: 'allowance',
      args: [address, this.addresses.tradingVault],
    })) as bigint
    return formatUSDC(allowance)
  }

  /** Approve the vault to spend USDC. Amount in human-readable USDC (e.g. "100"). */
  async approve(amount: string): Promise<Hash> {
    const { walletClient, account } = this.requireWallet()
    const assets = parseUSDC(amount)
    return walletClient.writeContract({
      address: this.addresses.usdc,
      abi: ERC20ABI,
      functionName: 'approve',
      args: [this.addresses.tradingVault, assets],
      account,
      chain: this.chain,
    })
  }

  /** Deposit USDC into the vault. Amount in human-readable USDC (e.g. "100"). Requires prior approval. */
  async deposit(amount: string): Promise<Hash> {
    const { walletClient, account } = this.requireWallet()
    const assets = parseUSDC(amount)
    return walletClient.writeContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'deposit',
      args: [assets, account],
      account,
      chain: this.chain,
    })
  }

  /** Approve USDC and deposit in one call. Waits for approval tx before depositing. */
  async depositWithApproval(amount: string): Promise<DepositWithApprovalResult> {
    const approveHash = await this.approve(amount)
    await this.publicClient.waitForTransactionReceipt({ hash: approveHash })
    const depositHash = await this.deposit(amount)
    return { approveHash, depositHash }
  }

  /** Request a withdrawal. Shares in human-readable format (e.g. "1.5"). Subject to lock period. */
  async withdraw(shares: string): Promise<Hash> {
    const { walletClient, account } = this.requireWallet()
    const sharesAmount = parseShares(shares)
    return walletClient.writeContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'requestWithdrawal',
      args: [sharesAmount],
      account,
      chain: this.chain,
    })
  }

  /** Process a pending withdrawal after the lock period has elapsed. */
  async processWithdrawal(): Promise<Hash> {
    const { walletClient, account } = this.requireWallet()
    return walletClient.writeContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'processWithdrawal',
      account,
      chain: this.chain,
    })
  }

  /** Cancel a pending withdrawal request. */
  async cancelWithdrawal(): Promise<Hash> {
    const { walletClient, account } = this.requireWallet()
    return walletClient.writeContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'cancelWithdrawal',
      account,
      chain: this.chain,
    })
  }

  /** Get pending withdrawal info for an address. */
  async getWithdrawalInfo(address: Address): Promise<WithdrawalInfo> {
    const result = (await this.publicClient.readContract({
      address: this.addresses.tradingVault,
      abi: TradingVaultABI,
      functionName: 'getPendingWithdrawalInfo',
      args: [address],
    })) as [bigint, bigint, bigint, boolean]

    return {
      shares: result[0],
      assets: result[1],
      unlockTime: result[2],
      isReady: result[3],
    }
  }
}
