# @7n7d/sdk

TypeScript SDK for the 7N7D AI-powered DeFi trading vault protocol. Built with [viem](https://viem.sh).

## Install

```bash
npm install @7n7d/sdk viem
```

## Quick Start

### Read-only (no wallet)

```typescript
import { SevenNSevenD } from '@7n7d/sdk'

const sdk = new SevenNSevenD({
  rpcUrl: 'https://rpc.sepolia.org',
  network: 'testnet',
})

const tvl = await sdk.vault.getTVL()
console.log(`TVL: $${tvl} USDC`)

const price = await sdk.vault.getSharePrice()
console.log(`Share price: $${price}`)
```

### With wallet

```typescript
import { SevenNSevenD } from '@7n7d/sdk'

const sdk = new SevenNSevenD({
  rpcUrl: 'https://rpc.sepolia.org',
  privateKey: '0x...',
  network: 'testnet',
})

// Approve + deposit 100 USDC in one call
const { approveHash, depositHash } = await sdk.vault.depositWithApproval('100')

// Check your balance
const balance = await sdk.vault.getBalance(sdk.address!)
console.log(`Shares: ${balance.sharesFormatted}`)
console.log(`Value: $${balance.assetsFormatted} USDC`)
```

## API

### `new SevenNSevenD(config)`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `rpcUrl` | `string` | Yes | Ethereum RPC URL |
| `privateKey` | `` `0x${string}` `` | No | Private key for write operations |
| `network` | `'mainnet' \| 'testnet'` | No | Network (default: `'testnet'`) |

### Vault (`sdk.vault`)

#### Read

| Method | Returns | Description |
|--------|---------|-------------|
| `getBalance(address)` | `VaultBalance` | Share balance + USDC value |
| `getSharePrice()` | `string` | Price of one share in USDC |
| `getTVL()` | `string` | Total value locked (USDC) |
| `estimateDeposit(amount)` | `string` | Preview shares for a USDC amount |
| `getAllowance(address)` | `string` | USDC allowance for the vault |
| `getWithdrawalInfo(address)` | `WithdrawalInfo` | Pending withdrawal details |

#### Write (requires `privateKey`)

| Method | Returns | Description |
|--------|---------|-------------|
| `approve(amount)` | `Hash` | Approve USDC for the vault |
| `deposit(amount)` | `Hash` | Deposit USDC (requires prior approval) |
| `depositWithApproval(amount)` | `DepositWithApprovalResult` | Approve + deposit in one call |
| `withdraw(shares)` | `Hash` | Request withdrawal (lock period applies) |
| `processWithdrawal()` | `Hash` | Process after lock period |
| `cancelWithdrawal()` | `Hash` | Cancel pending withdrawal |

All amounts are human-readable strings (e.g. `"100"` for 100 USDC, `"1.5"` for 1.5 shares).

### Token (`sdk.token`)

| Method | Returns | Description |
|--------|---------|-------------|
| `getBalance(address)` | `string` | 7N7D token balance |
| `transfer(to, amount)` | `Hash` | Transfer 7N7D tokens |
| `getFeeTier(address)` | `FeeTierInfo` | Fee discount tier based on token holdings |

### Governance (`sdk.governance`)

| Property | Type | Description |
|----------|------|-------------|
| `daoAddress` | `Address` | GovernanceDAO contract address |

### Utilities

```typescript
import {
  formatUSDC,   // bigint -> human string (6 decimals)
  parseUSDC,    // human string -> bigint (6 decimals)
  formatShares, // bigint -> human string (18 decimals)
  parseShares,  // human string -> bigint (18 decimals)
  formatTokens, // bigint -> human string (18 decimals)
  parseTokens,  // human string -> bigint (18 decimals)
} from '@7n7d/sdk'
```

## Networks

| Network | Chain | Status |
|---------|-------|--------|
| `testnet` | Sepolia | Active |
| `mainnet` | Arbitrum | Planned |

## Contract Addresses (Sepolia)

| Contract | Address |
|----------|---------|
| TradingVault | `0x3728F306Bc29d2A702cDb7919495E54F809405F8` |
| 7N7D Token | `0x8D8572E3bBC1F813997b9C4503c2243CcF3f2D72` |
| USDC | `0x10297B02cFBe672267903E92deEc36Cff24C5D77` |
| ProfitDistributor | `0xA9dBEBd6898961cB5B3DA7BeeA9b3A1974956771` |
| GovernanceDAO | `0x3DE4AB52e6Aaba118aa681eC83fb7c1bC176f664` |

## License

MIT
