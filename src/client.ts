import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
  type Chain,
  type Address,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia, arbitrum } from 'viem/chains'
import type { SDKConfig, Network, NetworkAddresses } from './types.js'
import { getAddresses } from './addresses.js'
import { VaultModule } from './vault.js'
import { TokenModule } from './token.js'
import { GovernanceModule } from './governance.js'

function getChain(network: Network): Chain {
  return network === 'mainnet' ? arbitrum : sepolia
}

export class SevenNSevenD {
  public readonly vault: VaultModule
  public readonly token: TokenModule
  public readonly governance: GovernanceModule
  public readonly publicClient: PublicClient
  public readonly walletClient: WalletClient | undefined
  public readonly address: Address | undefined
  public readonly network: Network
  public readonly addresses: NetworkAddresses

  constructor(config: SDKConfig) {
    this.network = config.network ?? 'testnet'
    this.addresses = getAddresses(this.network)
    const chain = getChain(this.network)

    this.publicClient = createPublicClient({
      chain,
      transport: http(config.rpcUrl),
    })

    if (config.privateKey) {
      const account = privateKeyToAccount(config.privateKey)
      this.address = account.address
      this.walletClient = createWalletClient({
        account,
        chain,
        transport: http(config.rpcUrl),
      })
    }

    this.vault = new VaultModule(
      this.publicClient,
      this.walletClient,
      this.address,
      this.addresses,
      chain,
    )

    this.token = new TokenModule(
      this.publicClient,
      this.walletClient,
      this.address,
      this.addresses,
      chain,
    )

    this.governance = new GovernanceModule(this.addresses)
  }
}
