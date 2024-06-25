import { PaginationParams } from '@abstract/pagination'
import {PrismaClient, Comission} from '@prisma/client'

export function make_comission_service(db_connection: PrismaClient){
    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get,
        get_total
    })

    async function create(entity:Comission): Promise<Comission>{
        return await db_connection.comission.create({
            data:entity
        })
    }
    
    async function remove(id:number): Promise<Comission>{
        return await db_connection.comission.delete({
            where:{id:id}
        })
    }

    async function update(id:number, entity:Comission): Promise<Comission>{
        return await db_connection.comission.update({
            where:{
                id:id
            },
            data:entity
        })
    }

    async function get(id:number): Promise<Comission>{
        return await db_connection.comission.findFirstOrThrow({
            where:{
                id:id
            }
        })
    }

    async function get_all(pagination_params: PaginationParams): Promise<Comission[]>{
        return db_connection.comission.findMany({
            skip: pagination_params.skip,
            take: pagination_params.take
        })
    }
    async function get_total(){
        return await db_connection.comission.aggregate({_count:true})
    }
}