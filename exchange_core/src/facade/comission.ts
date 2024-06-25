import { PaginationResponseWrapper, PaginationParams } from '@abstract/pagination'
import { ComissionDTO } from '@abstract/dto/comission'
import { comission_mapper } from '@abstract/mapper/dto/comission'
import {PrismaClient, Comission} from '@prisma/client'
import { make_comission_service } from '../service'

export function make_comission_facade(db_connection: PrismaClient){
    let comission_service = make_comission_service(db_connection)
    
    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get,
        get_total
    })

    async function create(entity: ComissionDTO): Promise<ComissionDTO>{
        return comission_mapper.from(
            await comission_service.create(
                comission_mapper.to(entity)
            )
        )
    }

    async function remove(id: number): Promise<ComissionDTO>{
        return comission_mapper.from(
            await comission_service.remove(id)
        )
    }

    async function update(id:number, entity: ComissionDTO): Promise<ComissionDTO>{
        return comission_mapper.from(
            await comission_service.update(
                id,
                comission_mapper.to(entity)
            )
        )
    }

    async function get(id:number): Promise<ComissionDTO>{
        return comission_mapper.from(
            await comission_service.get(id)
        )
    }
    
    async function get_total(){
        return await db_connection.operationMethodChain.aggregate({_count:true})

    }

    async function get_all(pagination_params: PaginationParams): Promise<PaginationResponseWrapper>{
        return new PaginationResponseWrapper(
            pagination_params.require_total?await get_total().then(res=>res._count):0,
            await comission_service.get_all(pagination_params).then(
                orders=>orders.map(x=>comission_mapper.from(x))
            )
        ) 
    }
}