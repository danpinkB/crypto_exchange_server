import { ChainType } from "@abstract/model/chain";
import { extend } from "@helper/storage/extended_storage";
import { PrismaClient } from "@prisma/client";


export function make_chain_sync_facade(db_connection: PrismaClient){
    let extended_storage = extend(db_connection)

    return ({
        find_first,
        upsert
    })

    async function find_first(chain: ChainType){
        return db_connection.chainSync.findFirst({
            where:{chain: chain}
        })
    }

    async function upsert(chain: ChainType, block: number) {
        await db_connection.chainSync.upsert({ 
            where:{ chain: chain }, create:{ chain: chain, block: block }, update:{ block: block }
        })
    }
}