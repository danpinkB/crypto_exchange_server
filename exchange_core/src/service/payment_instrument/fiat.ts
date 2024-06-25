import { PaymentType, PrismaClient } from "@prisma/client"
import { make_payment_instrument_service } from "./p_instrument"
import { FiatInstrument } from "@abstract/model/entity"
import { fiat_entity_mapper } from "@abstract/mapper/model/payment_instrument"
import { PaginationParams } from "@abstract/pagination"

const TYPE = PaymentType.fiat

export function make_fiat_currency_service(db_connection: PrismaClient){
    
    let payment_instrument_service = make_payment_instrument_service(db_connection)

    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get_total,
        get,
        get_by_symbol
    })

    async function create(entity: FiatInstrument): Promise<FiatInstrument>{
        return fiat_entity_mapper.to(
            await payment_instrument_service.create(
                fiat_entity_mapper.from(entity)
            )
        )
        
    }
    async function get_by_symbol(symbol: string): Promise<FiatInstrument|null> {
        let instrument = await payment_instrument_service.get_by_symbol(symbol, TYPE)
        return instrument?fiat_entity_mapper.to(instrument):null
    }
    async function remove(id:number): Promise<FiatInstrument>{
        return fiat_entity_mapper.to(
            await payment_instrument_service.remove(id)
        )
    }

    async function update(id:number, entity: FiatInstrument): Promise<FiatInstrument>{
        return fiat_entity_mapper.to(
            await payment_instrument_service.update(
                id,
                fiat_entity_mapper.from(entity)
            )
        )    
    }

    async function get(id:number): Promise<FiatInstrument>{
        return fiat_entity_mapper.to(
            await payment_instrument_service.get(id)
        )
        
    }
    
    async function get_all(pagination_params: PaginationParams): Promise<FiatInstrument[]>{
        return (await payment_instrument_service.get_all(pagination_params, [TYPE])).map(x=>fiat_entity_mapper.to(x))
    }
    
    async function get_total(){
        return await payment_instrument_service.get_total([TYPE])
    }
}