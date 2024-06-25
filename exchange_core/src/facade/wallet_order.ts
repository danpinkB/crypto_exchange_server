import { TransferExecutionActionMessage } from "@abstract/execution";
import { crypto_entity_mapper } from "@abstract/mapper/model";
import { BlockChainTransactionLog, CryptoInstrument } from "@abstract/model/entity";
import { OrderLogWithMapping } from "@abstract/model/order";
import { hasher } from "@helper/hash_provider";
import { publish_execution_topic } from "@helper/message_broker/topics/execution";
// import { message_broker } from "@helper/message_broker";
// import { publish_orders_topic } from "@helper/message_broker/topics/order";
import { extend } from "@helper/storage/extended_storage";
import { OrderStatus, PrismaClient } from "@prisma/client";
import Decimal from "decimal.js";
import { get_public_address } from "./recepient_address_factory";
import { message_broker } from "@helper/message_broker/message_broker";

type T = {created_at: Date, type: string,mappings:{createMany:{data:{label:string, value:string}[]}}}

export function make_wallet_order_facade(db_connection: PrismaClient){
    let extended_storage = extend(db_connection)
    
    return ({
        process_block_transfers
    })
    
    async function process_block_transfers(chain: number, tx_transfers: {[key:string]: [string,bigint][]}){
        // let message_broker_service = await message_broker()
        // console.log(tx_transfers);
        let token: CryptoInstrument, received_amount: Decimal, txs_to_save:T[] = []
    
        for(let wallet_order of await extended_storage.order.get_all_by_crypto_recepient_token_chain(Object.keys(tx_transfers), chain)){
            // console.log(wallet_order);
            
            let order = wallet_order.order, current_amount = new Decimal(0)
    
            let order_calculated_transactions = order.logs.map((x:OrderLogWithMapping)=>BlockChainTransactionLog.from_mapping(x)).reduce((map_: Set<string>, log: BlockChainTransactionLog)=>{
                map_.add(log.tx_hash)
                current_amount=current_amount.add(new Decimal(log.amount))
                return map_
            }, new Set<string>())
    
            token = crypto_entity_mapper.to(order.source), received_amount = new Decimal(0)
            let tx_amount: Decimal
    
            for (let transfer of tx_transfers[wallet_order.id.toLowerCase()]){
                if (order_calculated_transactions.has(transfer[0])) continue;
                tx_amount = new Decimal(transfer[1].toString()).div(token.decimals)
                received_amount = received_amount.add(tx_amount)
                txs_to_save.push({
                    type: chain.toString(), 
                    created_at:new Date(),
                    mappings:{
                        createMany:{
                            data:[ {label: "tx_hash", value: transfer[0]}, {label: "amount", value: tx_amount.toString()},]
                        }
                    }
                })
            }
            
            await extended_storage.$transaction(async ()=>{
                let status = order.status
                
                if(current_amount.add(received_amount)>=order.amount){
                    // await extended_storage.walletOrder.delete({ where: { id_chain:{ chain:chain, id:wallet_order.id } } })
                    status = OrderStatus.received
                    console.log(message_broker);
                    
                    await publish_execution_topic<TransferExecutionActionMessage>(chain.toString(), await message_broker(), {
                        identifier: order.id,
                        data:{
                            amount: BigInt(order.amount.mul(token.decimals).toNumber()),
                            token: token,
                            wallet: {
                                address: get_public_address(hasher.decode(wallet_order.wallet.phrase), chain),
                                phrase: wallet_order.wallet.phrase
                            }
                        }
                    })
                } 

                // let order_entity = await extended_storage.order.update({
                //     where:{id: order.id},
                //     data:{status: status}
                // })
    
                // for (let tx_entity of txs_to_save){
                //     await extended_storage.orderLog.create({
                //         data:{ order_id: order_entity.id, ...tx_entity }
                //     })     
                // }
                
            })
        }
    }
}