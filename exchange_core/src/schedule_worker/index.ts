import { crypto_entity_mapper } from "@abstract/mapper/model/payment_instrument";
import { storage } from "@helper/storage";
import { OrderStatus, PrismaClient } from "@prisma/client";

const CHECK_TIME_INTERVAL = 15*1000

function process_expired_orders(db: PrismaClient){
    let target_date = new Date(new Date().getTime()-15*60*1000)

    db.order.findMany({
        where:{
            status:"placed",
            expired_at:{ lte: target_date },
            source:{ type:{ not:"fiat" } }
        },
        include:{
            source: {
                include:{ mappings: true }
            }
        }
    }).then(async (orders)=>{
        console.log(`process expired orders`);
        let source;
        let id;
        for(let order of orders){
            await db.$transaction(async()=>{
                await db.order.update({
                    where:{id:order.id},
                    data:{status: OrderStatus.expired}
                })

                if(order.source.type=="crypto"){
                    source = crypto_entity_mapper.to(order.source)
                    id = `${order.recepient_address}_${source.address}`
                    await db.walletOrder.delete({
                        where:{
                            id_chain:{ chain:source.chain, id:id }
                        }
                    })
                }
            })
            
        }
        // setTimeout(()=>{
        //     process_unpayed_orders(db_connection)
        // }, CHECK_TIME_INTERVAL)
    })
    
}
async function main(){
    let db_connection = storage()
    
    async function check_orders(){
        await process_expired_orders(db_connection)
        setTimeout(check_orders, CHECK_TIME_INTERVAL)
    }
    await check_orders()
}

main()