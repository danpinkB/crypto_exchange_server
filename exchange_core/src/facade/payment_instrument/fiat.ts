import { PrismaClient } from '@prisma/client'
import { FiatInstrumentDTO } from '@abstract/dto/payment_instrument';
import { fiat_dto_mapper } from '@abstract/mapper/dto/payment_instrument';
import createHttpError from 'http-errors';
import { make_fiat_currency_service } from '@service/payment_instrument';
import { PaginationParams, PaginationResponseWrapper } from '@abstract/pagination';

export function make_fiat_currency_facade(db_connection: PrismaClient){
    let fiat_instrument_service = make_fiat_currency_service(db_connection)
    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get_total,
        get
    })

    async function create(dto: FiatInstrumentDTO): Promise<FiatInstrumentDTO>{
        if (await fiat_instrument_service.get_by_symbol(dto.symbol!)!=null) throw createHttpError(417,"fiat currency with symbol already exist")
        return fiat_dto_mapper.from(
            await fiat_instrument_service.create(
                fiat_dto_mapper.to(dto)
            )
        )
    }

    async function remove(id:number): Promise<FiatInstrumentDTO>{
        return fiat_dto_mapper.from(
            await fiat_instrument_service.remove(id) 
        )    
    }

    async function update(id:number, dto: FiatInstrumentDTO): Promise<FiatInstrumentDTO>{
        let instrument = await fiat_instrument_service.get(id)
        if (instrument.symbol!=dto.symbol! && fiat_instrument_service.get_by_symbol(dto.symbol!)!=null) throw createHttpError(417,"fiat currency with symbol already exist")
        return fiat_dto_mapper.from(
            await fiat_instrument_service.update(
                id,
                fiat_dto_mapper.to(dto)
            )
        )
    }

    async function get(id:number): Promise<FiatInstrumentDTO>{
        return fiat_dto_mapper.from(
            await fiat_instrument_service.get(id)  
        )
    }
    
    async function get_all(pagination_params: PaginationParams): Promise<PaginationResponseWrapper>{
        return new PaginationResponseWrapper(
            pagination_params.require_total?await fiat_instrument_service.get_total().then(res=>res._count):0, 
            (await fiat_instrument_service.get_all(pagination_params))
            .map(x=>
                fiat_dto_mapper.from(x)
            )
        )
    }
    
    async function get_total(){
        return await fiat_instrument_service.get_total()
    }
}