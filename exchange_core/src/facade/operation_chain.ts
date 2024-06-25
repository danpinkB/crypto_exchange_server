import { PaginationResponseWrapper, PaginationParams } from "@abstract/pagination"
import { ChainCompositeKey } from "@abstract/model/chain"

import { price_storage } from "@helper/price_storage"
import { OperationMethodChainDTO } from "@abstract/dto/operation_chain"
import { operation_chain_mapper } from "@abstract/mapper/dto/operation_method_chain"
import { PaymentInstrument, PrismaClient } from "@prisma/client"
import Decimal from "decimal.js"
import { make_operation_chain_service } from "../service"
import { STABLE_SYMBOLS } from "@abstract/const"

export function make_operation_chain_facade(db_connection: PrismaClient){

    let operation_chain_service = make_operation_chain_service(db_connection)
    let price_storage_ = price_storage()

    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get_total,
        get,
        get_price,
        get_prices,
        reverse,
        update_comissions
    })
    
    async function create(entity: OperationMethodChainDTO): Promise<OperationMethodChainDTO>{
        return operation_chain_mapper.from(
            await operation_chain_service.create(
                operation_chain_mapper.to(entity)
            )
        )
    }

    async function remove(id: ChainCompositeKey): Promise<OperationMethodChainDTO>{
        return operation_chain_mapper.from(
            await operation_chain_service.remove(id)
        )
    }

    async function reverse(id: ChainCompositeKey): Promise<OperationMethodChainDTO>{
        let chain = await operation_chain_service.get(id)
        return operation_chain_mapper.from(
            await operation_chain_service.create({
                comission_id: chain.comission_id,
                is_active: chain.is_active,
                destination_id: chain.source_id,
                source_id: chain.destination_id,
                max_amount: chain.max_amount,
                min_amount: chain.min_amount,
            })
        )
    }

    async function update(id:ChainCompositeKey, entity: OperationMethodChainDTO): Promise<OperationMethodChainDTO>{
        return operation_chain_mapper.from(
            await operation_chain_service.update(
                id,
                operation_chain_mapper.to(entity)
            )
        )
    }

    async function get(id:ChainCompositeKey): Promise<OperationMethodChainDTO>{
        return operation_chain_mapper.from(
            await operation_chain_service.get(id)
        )
    }
    
    async function get_total(only_active: boolean){
        return await db_connection.operationMethodChain.aggregate({where:only_active?{is_active:only_active}:{},_count:true})
    }

    async function update_comissions(ids:ChainCompositeKey[], comission_id: number): Promise<OperationMethodChainDTO[]> {
        return (
            await operation_chain_service.update_comissions(
                ids, comission_id
            )
        ).map(
            x=>operation_chain_mapper.from(x)
        )
    }
    
    async function get_all(pagination_params: PaginationParams, only_active: boolean = true): Promise<PaginationResponseWrapper>{
        return new PaginationResponseWrapper(
            pagination_params.require_total?await get_total(only_active).then(res=>res._count):0,
            await operation_chain_service.get_all(pagination_params, only_active).then(
                res=>res.map(x=>operation_chain_mapper.from(x))
            )
        ) 
    }

    async function get_price(id:ChainCompositeKey, is_opposite_comission = false): Promise<string|null>{
        let chain;
        let price: Decimal | null;
        let precision: number
        if (is_opposite_comission){
            chain = await operation_chain_service.get(id.flip())
            price = await price_storage_.get(`${chain.destination.symbol}${chain.source.symbol}`);
            precision = chain.source.precision
        }
        else{
            chain = await operation_chain_service.get(id)
            price = await price_storage_.get(`${chain.source.symbol}${chain.destination.symbol}`);
            precision = chain.destination.precision
        }
        return price?price.mul(new Decimal(1).plus(chain.comission.amount)).toFixed(precision):null
    }
    
    async function get_prices(ids:ChainCompositeKey[]):Promise<{[id:string]:string}> {
        let result: any = {};
        let chains = await operation_chain_service.get_all_by_ids(ids)
       
        for (let chain of chains){
            let price: Decimal | null = await price_storage_.get(`${chain.source.symbol}${chain.destination.symbol}`);
            if (price!=null) result[chain.source_id+'_'+chain.destination_id] = price.mul(new Decimal(1).plus(chain.comission.amount)).toFixed(chain.destination.precision)
        }
        return result
    }
    function get_pair_index(source: PaymentInstrument, destination: PaymentInstrument): Number {
        return Number(STABLE_SYMBOLS.includes(source.symbol))*10+Number(STABLE_SYMBOLS.includes(destination.symbol))
    }
}