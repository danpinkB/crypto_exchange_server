import { PaymentInstrumentQueryArgs, PaymentInstrumentQueryArgsWithDestinations } from "@abstract/model/payment_instrument"
import { PaginationParams } from "@abstract/pagination"
import { PaymentInstrumentMapping, PaymentType, PrismaClient } from "@prisma/client"

export function make_payment_instrument_service(db_connection: PrismaClient){
    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get_total,
        get_all_with_destinations,
        get,
        get_by_mapping,
        get_by_symbol,
        get_all_instruments
    })

    async function create(entity: PaymentInstrumentQueryArgs): Promise<PaymentInstrumentQueryArgs>{
        let instrument = await db_connection.paymentInstrument.create({
            data:{
                name: entity.name,
                symbol: entity.symbol,
                icon: entity.icon,
                type: entity.type,
                mappings: {
                    createMany:{
                        data: entity.mappings
                    }
                }
            }
        })
        entity.id = instrument.id
        return entity
    }

    async function remove(id:number): Promise<PaymentInstrumentQueryArgs>{
        let raw_entity = await db_connection.paymentInstrument.delete({
            where:{id: id},
            include: {
                mappings: true
            }
        })
        return raw_entity
    }

    async function update(id:number, entity: PaymentInstrumentQueryArgs): Promise<PaymentInstrumentQueryArgs>{
        await db_connection.paymentInstrument.update({
            where:{ id:id},
            data: {
                name: entity.name,
                symbol: entity.symbol,
                icon: entity.icon,
                mappings: {
                    deleteMany: {instrument_id: id},
                    createMany: {data: entity.mappings}
                }
            }
        })
        return entity
    }

    async function get(id:number): Promise<PaymentInstrumentQueryArgs>{
        return await db_connection.paymentInstrument.findFirstOrThrow({
            where:{ id:id },
            include: {
                mappings: true
            }
        })
    }
    
    async function get_all(pagination_params: PaginationParams, types: PaymentType[]): Promise<PaymentInstrumentQueryArgs[]>{
        return await db_connection.paymentInstrument.findMany({
            where:{ type:{in:types} },
            skip: pagination_params.skip,
            take: pagination_params.take,
            include: {mappings: true}
        })
        
    }

    async function get_all_instruments(types: PaymentType[]): Promise<PaymentInstrumentQueryArgs[]>{
        return await db_connection.paymentInstrument.findMany({
            where:{ type:{in:types} },
            include: {mappings: true}
        })
    }

    async function get_all_with_destinations(types: PaymentType[]): Promise<PaymentInstrumentQueryArgsWithDestinations[]>{
        return await db_connection.paymentInstrument.findMany({
            where:{ type:{in:types} },
            include: {
                mappings: true, 
                source_operations: {
                    where: { is_active: true },
                    select: { destination_id: true }
                }
            }
        })
    }
    
    async function get_total(types: PaymentType[]){
        return await db_connection.paymentInstrument.aggregate({where:{ type:{in:types} }, _count:true})
    }

    async function get_by_symbol(symbol: string, type_: PaymentType): Promise<PaymentInstrumentQueryArgs|null> {
        return await db_connection.paymentInstrument.findFirst({
            where:{
                type:type_,
                symbol: symbol
            },
            include:{mappings:true}
        })
    }

    async function get_by_mapping(mappings:PaymentInstrumentMapping[]): Promise<PaymentInstrumentQueryArgsWithDestinations|null>{
        // let and_cause = mappings.map(x=>{
        //     return {
        //         mappings:{
        //             some:{
        //                 label: x.label,
        //                 value: x.value
        //             }
        //         }
        //     }
        // })
        return await db_connection.paymentInstrument.findFirst({
            where:{
                AND:mappings.map(x=>{
                    return {
                        mappings:{
                            some:{
                                label: x.label,
                                value: x.value
                            }
                        }
                    }
                })
                // mappings:{
                //     some:{
                //         label:{in:mappings.map(x=>x.label)},
                //         value:{in:mappings.map(x=>x.value)}
                //     }
                // }, 
            },
            include: {
                mappings: true
            }
        })
    }
}