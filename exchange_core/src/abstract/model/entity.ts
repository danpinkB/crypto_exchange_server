import { OrderLogType } from "@abstract/model/order";
import { OrderLog, OrderLogMapping, PaymentType } from "@prisma/client"
import { Decimal } from 'decimal.js';

export interface PaymentInstrument{
    id: number
    symbol: string
    icon: string | null
    name: string
    type: PaymentType
    precision: number
}

export interface CryptoInstrument extends PaymentInstrument{
    address: string
    chain: number
    decimals: Decimal
}

export interface FiatInstrument extends PaymentInstrument{
}

export interface CardInstrument extends PaymentInstrument{
}

export class BlockChainTransactionLog{
    created_at!: Date
    tx_hash!: string
    amount!: number
    order_id!: string | ""
    type!: string
    id!: number | -1

    constructor(id: number, order_id:string, type: string, created_at: Date, tx_hash: string, amount: number){
        this.created_at = created_at
        this.type = type
        this.tx_hash = tx_hash
        this.amount = amount
        this.id = id
        this.order_id = order_id
    }

    static from_mapping(entity: OrderLog & {mappings: OrderLogMapping[]}) : BlockChainTransactionLog{        
        let mapping = new Map<string, any>()
        for(let p_mapping of entity.mappings) mapping.set(p_mapping.label, p_mapping.value)
        
        return new BlockChainTransactionLog(
            entity.id, 
            entity.order_id, 
            entity.type,
            entity.created_at, 
            mapping.get("tx_hash"), 
            mapping.get("amount")
        )
    }

    to_mapping(): OrderLog & {mappings: OrderLogMapping[]}{
        return {
            id: this.id,
            order_id: this.order_id,
            created_at: this.created_at,
            type: "",
            mappings:[
                {label: "tx_hash", value: this.tx_hash, log_id: this.id}
            ]
        }
    }
}

export const typed_entity_mapper = {
    [OrderLogType.CRYPTO.valueOf()]: BlockChainTransactionLog
}