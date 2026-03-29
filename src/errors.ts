export enum SDKErrorCode {
  NO_WALLET = 'NO_WALLET',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_ALLOWANCE = 'INSUFFICIENT_ALLOWANCE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export class SDKError extends Error {
  public readonly code: SDKErrorCode

  constructor(message: string, code: SDKErrorCode, cause?: unknown) {
    super(message, { cause })
    this.name = 'SDKError'
    this.code = code
  }
}
