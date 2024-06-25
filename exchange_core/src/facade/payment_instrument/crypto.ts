import { PrismaClient } from '@prisma/client'
import { CryptoInstrumentDTO } from '@abstract/dto/payment_instrument';
import createHttpError from 'http-errors';
import { crypto_dto_mapper } from '@abstract/mapper/dto/payment_instrument';
import { make_crypto_currency_service } from '@service/payment_instrument';
import { chain_provider } from '@helper/chain_provider';
import { PaginationParams, PaginationResponseWrapper } from '@abstract/pagination';

export function make_crypto_currency_facade(db_connection: PrismaClient){
    
    let crypto_instrument_service = make_crypto_currency_service(db_connection)

    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get_total,
        get
    })

    async function create(dto: CryptoInstrumentDTO): Promise<CryptoInstrumentDTO>{
        let exists = await crypto_instrument_service.get_by_address_and_chain(dto.address!, dto.chain!)
        if (exists!=null) throw createHttpError(417,"crypto currency already exist", exists)
        let token_info = await chain_provider[dto.chain]!.get_token_info(dto.address)
        dto.decimals = token_info.decimals
        dto.name = dto.name || token_info.name
        dto.symbol = token_info.symbol
        
        return crypto_dto_mapper.from(
            await crypto_instrument_service.create(
                crypto_dto_mapper.to(dto)   
            )
        )
    }

    async function remove(id:number): Promise<CryptoInstrumentDTO>{
        return crypto_dto_mapper.from(
            await crypto_instrument_service.remove(id)
        )
    }

    async function update(id:number, dto: CryptoInstrumentDTO): Promise<CryptoInstrumentDTO>{
        let currency = await crypto_instrument_service.get(id)
        if (currency==null) throw createHttpError(417, "crypto currency with this id not found")
        if (currency.address!=dto.address! && await crypto_instrument_service.get_by_address_and_chain(dto.address!, dto.chain!)!=null) throw createHttpError(417,"crypto currency with this address and chain already exist")
        
        let token_info = await chain_provider[dto.chain]!.get_token_info(dto.address)
        dto.decimals = token_info.decimals
        dto.name = dto.name || token_info.name
        dto.symbol = token_info.symbol
        
        return crypto_dto_mapper.from(
            await crypto_instrument_service.update(
                id,
                crypto_dto_mapper.to(dto)
            )
        )    
    }

    async function get(id:number): Promise<CryptoInstrumentDTO>{
        return crypto_dto_mapper.from(
            await crypto_instrument_service.get(id)
        )
    }
    
    async function get_all(pagination_params: PaginationParams): Promise<PaginationResponseWrapper>{
        return new PaginationResponseWrapper(
            pagination_params.require_total?await get_total().then(res=>res._count):0,
            (await crypto_instrument_service.get_all(pagination_params))
            .map(x=>crypto_dto_mapper.from(x))
        )
    }
    
    async function get_total(){
        return await crypto_instrument_service.get_total()
    }
}