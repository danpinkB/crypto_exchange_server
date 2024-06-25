import { CardInstrumentDTO, CryptoInstrumentDTO, FiatInstrumentDTO } from "@abstract/dto/payment_instrument";
import { typed_payment_instrument_mapper_dto } from "@abstract/mapper/dto/payment_instrument";
import { typed_payment_instrument_entity_mapper } from "@abstract/mapper/model/payment_instrument";
import { PaymentType, PrismaClient } from "@prisma/client";
import { make_payment_instrument_service } from "@service/index";

export function make_payment_instrument_facade(db_connection: PrismaClient){
    
    let payment_instrument_service = make_payment_instrument_service(db_connection)

    return Object.freeze({
        get_all_with_destinations,
        get_all
    })

    async function get_all_with_destinations(types:PaymentType[]): Promise<(CryptoInstrumentDTO | FiatInstrumentDTO | CardInstrumentDTO)[]>{
        return await payment_instrument_service.get_all_with_destinations(types).then(
            (instuments)=>instuments.reduce((mappings:any[], x)=>{
                if (!x.source_operations||x.source_operations.length==0) return mappings
                
                let dto = typed_payment_instrument_mapper_dto[x.type].from(typed_payment_instrument_entity_mapper[x.type].to(x))
                dto.destinations = x.source_operations?.map(x=>x.destination_id)
                mappings.push(dto)

                return mappings
            }, [])
        )
        // return (await payment_instrument_service.get_all_with_destinations(types)).map((x)=>{
        //     let dto = typed_payment_instrument_mapper_dto[x.type].from(typed_payment_instrument_entity_mapper[x.type].to(x))
            
        //     dto.destinations = x.source_operations?.map(x=>x.destination_id)
        //     return dto
        // })
    }

    async function get_all(types:PaymentType[]): Promise<(CryptoInstrumentDTO | FiatInstrumentDTO | CardInstrumentDTO)[]>{
        return (
            await payment_instrument_service.get_all_instruments(types)
        )
        .map(
            (x)=>typed_payment_instrument_mapper_dto[x.type].from(
                typed_payment_instrument_entity_mapper[x.type].to(x)
            )
        )
    }
}   