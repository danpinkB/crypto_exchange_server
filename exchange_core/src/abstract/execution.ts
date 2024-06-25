import { CryptoInstrument } from "./model/entity"
import { WalletEntity } from "./wallet"

export type ExecutionAction<T> = {
    identifier: string
    data: T
}

export type TransferExecutionData = {
    token: CryptoInstrument,
    wallet: WalletEntity,
    amount: bigint
}

export type TransferExecutionActionMessage = ExecutionAction<TransferExecutionData>