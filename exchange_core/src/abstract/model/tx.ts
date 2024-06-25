import { ChainType } from "@abstract/model/chain";
import { TxLog, TxLogMapping } from "@prisma/client";

export enum InternalTxType{
    BLOCKCHAIN = 1 
}

export class InternalBlockChainTx{
    //internal id
    id: number
    tx_id: string
    chain: ChainType
    type: InternalTxType
    tx_hash: string
    created_at: Date
    comment: string

    constructor(id: number, tx_id:string, created_at: Date, chain: ChainType, tx_hash: string, comment: string){
        this.id = id
        this.tx_id = tx_id
        this.chain = chain
        this.tx_hash = tx_hash
        this.created_at = created_at
        this.comment = comment
        this.type = InternalTxType.BLOCKCHAIN
    }

    static from_mapping(entity: TxLog & {mappings: TxLogMapping[]}) : InternalBlockChainTx{        
        let mapping = entity.mappings.reduce((mapping: Map<string, any>, map: TxLogMapping)=>mapping.set(map.label, map.value), new Map<string, any>())

        return new InternalBlockChainTx(
            entity.id, 
            entity.tx_id,
            entity.created_at,
            Number(mapping.get("chain")),
            mapping.get("tx_hash"),
            mapping.get("comment")
        )
    }

    to_mapping(): TxLog & {mappings: TxLogMapping[]}{
        return {
            id: this.id,
            tx_id: this.tx_id,
            created_at: this.created_at,
            type: InternalTxType.BLOCKCHAIN.valueOf().toString(),
            mappings: [
                {tx_log_id: this.id, label: "chain", value: this.chain.valueOf().toString()},
                {tx_log_id: this.id, label: "tx_hash", value: this.tx_hash },
                {tx_log_id: this.id, label: "comment", value: this.comment }
            ]
        }
    }
}