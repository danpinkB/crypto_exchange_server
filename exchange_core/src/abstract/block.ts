import { ETHTransaction } from "./transaction"

export type ETHBlock = {
    baseFeePerGas: string,
    blobGasUsed: string,
    difficulty: string,
    excessBlobGas: string,
    extraData: string,
    gasLimit: string,
    gasUsed: string,
    hash: string,
    logsBloom: string,
    miner: string,
    mixHash: string,
    nonce: string,
    number: string,
    parentBeaconBlockRoot: string,
    parentHash: string, 
    receiptsRoot: string,
    sha3Uncles: string,
    size: string,
    stateRoot: string,
    timestamp: string,
    totalDifficulty: string,
    transactions: ETHTransaction[]
    transactionsRoot: string,
    withdrawals: BlockWithdrawals[]
}

export type BlockWithdrawals = {
    address: string,
    amount: string,
    index: string,
    validatorIndex: string,
    withdrawalsRoot: string,
}
