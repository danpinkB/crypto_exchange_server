import { OperationMethodChain, PrismaClient } from '@prisma/client'
import { ChainCompositeKey } from '@abstract/model/chain';
import { OperationChainQueryArgs } from '@abstract/model/operation_chain';
import { PaginationParams } from '@abstract/pagination';

const INCLUDE = {
    source:{
        include:{
            mappings: true
        }
    },
    destination: {
        include:{
            mappings: true
        }
    },
    comission: true
}

export function make_operation_chain_service(db_connection: PrismaClient){
    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get_total,
        get_all_by_ids,
        get,
        get_active_or_throw,
        update_comissions
    })
    
    async function create(entity: OperationMethodChain): Promise<OperationChainQueryArgs>{
        return await db_connection.operationMethodChain.create({
            data:entity,
            include:INCLUDE
        })
    }

    async function remove(id: ChainCompositeKey): Promise<OperationChainQueryArgs>{
        return await db_connection.operationMethodChain.delete({
            where: {
                source_id_destination_id:{
                    destination_id: id.destination_id,
                    source_id: id.source_id
                }
            },
            include:INCLUDE
        })
    }

    async function update(id:ChainCompositeKey, entity: OperationMethodChain): Promise<OperationChainQueryArgs>{
        let updated = db_connection.operationMethodChain.update({
            where: {
                source_id_destination_id:{
                    destination_id: id.destination_id,
                    source_id: id.source_id
                }
            },
            data: entity,
            include:INCLUDE
        })
        return updated
    }

    async function get(id:ChainCompositeKey): Promise<OperationChainQueryArgs>{
        return await db_connection.operationMethodChain.findFirstOrThrow({
            where: {
                source_id: id.source_id,
                destination_id: id.destination_id
            },
            include:INCLUDE
        })
    }

    async function get_active_or_throw(id:ChainCompositeKey): Promise<OperationChainQueryArgs>{
        return await db_connection.operationMethodChain.findFirstOrThrow({
            where: {
                source_id: id.source_id,
                destination_id: id.destination_id,
                is_active: true
            },
            include:INCLUDE
        })
    }
    
    async function get_all_by_ids(ids:ChainCompositeKey[]): Promise<OperationChainQueryArgs[]>{
        let chains = []
        for (let id of ids){
            chains.push(await db_connection.operationMethodChain.findFirstOrThrow({
                where: {
                    source_id: id.source_id,
                    destination_id: id.destination_id
                },
                include:INCLUDE
            }))
        }
        return chains
    }

    async function update_comissions(ids:ChainCompositeKey[], comission_id: number): Promise<OperationChainQueryArgs[]>{
        await db_connection.$transaction(async()=>{
            let id:ChainCompositeKey;
            for(id of ids){
                await db_connection.operationMethodChain.update({
                    where: {source_id_destination_id:{source_id: id.source_id, destination_id: id.destination_id}},
                    data:{
                        comission_id: comission_id
                    }
                })
            }
        })
        
        return get_all_by_ids(ids) 
    }

    async function get_all(pagination_params: PaginationParams, only_active: boolean): Promise<OperationChainQueryArgs[]>{
        return await db_connection.operationMethodChain.findMany({
            skip: pagination_params.skip,
            take: pagination_params.take,
            where:only_active?{is_active: only_active}:{},
            include:INCLUDE
        })
    }

    async function get_total(){
        return await db_connection.operationMethodChain.aggregate({_count:true})
    }
}