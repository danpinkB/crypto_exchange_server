import { PaginationParams } from '@abstract/pagination'
import {PrismaClient, WalletOrder} from '@prisma/client'

export function make_wallet_order_service(db_connection: PrismaClient){
    return Object.freeze({
        create,
        remove,
        update,
        get_all,
        get,
        get_total
    })

    async function create(entity:WalletOrder): Promise<WalletOrder>{
        return await db_connection.walletOrder.create({
            data:entity
        })
    }
    
    async function remove(id:string, chain: number): Promise<WalletOrder>{
        return await db_connection.walletOrder.delete({
            where: { id_chain:{ chain: chain, id: id } }
        })
    }

    async function update(id:string, entity:WalletOrder): Promise<WalletOrder>{
        return await db_connection.walletOrder.update({
            where:{ id_chain: { id:id, chain: entity.chain } },
            data:entity
        })
    }

    async function get(id:string, chain: number): Promise<WalletOrder>{
        return await db_connection.walletOrder.findFirstOrThrow({
            where:{ id: id, chain: chain }
        })
    }

    async function get_all(pagination_params: PaginationParams): Promise<WalletOrder[]>{
        return db_connection.walletOrder.findMany({
            skip: pagination_params.skip,
            take: pagination_params.take
        })
    }
    async function get_total(){
        return await db_connection.walletOrder.aggregate({_count:true})
    }
}