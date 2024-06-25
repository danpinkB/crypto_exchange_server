import { PrismaClient } from "@prisma/client"
export function extend(conn: PrismaClient){
    
    return conn.$extends({
        model:{
            order:{
                async get_all_by_crypto_recepient_token_chain(recepient_token_indexes:string[], chain: number) {
                    return await conn.walletOrder.findMany({
                        where: {
                            id: { in: recepient_token_indexes, mode:"insensitive" },
                            chain: chain
                        },
                        select:{
                            order:{
                                include:{
                                    source: {
                                        include:{
                                            mappings:true
                                        },
                                    },
                                    destination: true,
                                    info: true,
                                    logs: { include: {mappings:true} }
                                }
                            },
                            id: true,
                            wallet: true
                        },
                    })
                }
            }
        }
    })
}
export function extended_storage(){
    return extend(new PrismaClient())
}