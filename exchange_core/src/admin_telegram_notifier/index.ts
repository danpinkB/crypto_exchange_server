import { OrderMessage } from "@abstract/order";
import { message_broker } from "@helper/message_broker/message_broker";
import { subscribe_orders_topic } from "@helper/message_broker/topics/order";
import { telegram_notificator } from "@helper/telegram_hotificator";
import { ADMIN_CHAT_ID } from "./env";

async function main(){
    let message_broker_service = await message_broker()   
    let telegram_notifier = telegram_notificator()
    console.info("START CONSUMING MESSAGES");
    
    subscribe_orders_topic(message_broker_service, async (order: OrderMessage) =>{
        console.debug("NEW MESSAGE");
        console.debug(order);

        await telegram_notifier.send_text_message(ADMIN_CHAT_ID, `order ${order.order_number} with status - ${order.status} \n ${order.source.name} -> ${order.destination.name} \n amount: ${order.amount} \n amount_to_pay: ${order.amount_out}`)
    }, {
        noAck: false
    })
}

main()