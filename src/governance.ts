import type { Address } from 'viem'
import type { NetworkAddresses } from './types.js'

export class GovernanceModule {
  /** GovernanceDAO contract address. */
  public readonly daoAddress: Address

  constructor(addresses: NetworkAddresses) {
    this.daoAddress = addresses.governanceDAO
  }
}
