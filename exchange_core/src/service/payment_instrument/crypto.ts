import { PaymentType, PrismaClient } from "@prisma/client"
import { make_payment_instrument_service } from "./p_instrument"
import { CryptoInstrument } from "@abstract/model/entity"
import { crypto_entity_mapper } from "@abstract/mapper/model"
import { PaginationParams } from "@abstract/pagination"

const TYPE = PaymentType.crypto

export function make_crypto_currency_service(db_connection: PrismaClient){
    
    let payment_instrument_service = make_payment_instrument_service(db_connection)

    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get_total,
        get,
        get_by_address_and_chain
    })

    async function create(entity: CryptoInstrument): Promise<CryptoInstrument>{
        return crypto_entity_mapper.to(
            await payment_instrument_service.create(
                crypto_entity_mapper.from(entity)
            )
        )
        
    }

    async function remove(id:number): Promise<CryptoInstrument>{
        return crypto_entity_mapper.to(
            await payment_instrument_service.remove(id)
        )
    }

    async function update(id:number, entity: CryptoInstrument): Promise<CryptoInstrument>{
        return crypto_entity_mapper.to(
            await payment_instrument_service.update(
                id,
                crypto_entity_mapper.from(entity)
            )
        )    
    }

    async function get(id:number): Promise<CryptoInstrument>{
        return crypto_entity_mapper.to(
            await payment_instrument_service.get(id)
        )
        
    }
    
    async function get_all(pagination_params: PaginationParams): Promise<CryptoInstrument[]>{
        return (await payment_instrument_service.get_all(pagination_params, [TYPE])).map(x=>crypto_entity_mapper.to(x))
    }
    
    async function get_total(){
        return await payment_instrument_service.get_total([TYPE])
    }

    async function get_by_address_and_chain(address: string, chain: number) {
        return await payment_instrument_service.get_by_mapping([
            {label:"address", value:address, instrument_id:-1},
            {label:"chain", value:chain.toString(), instrument_id:-1}
        ])
    }
}