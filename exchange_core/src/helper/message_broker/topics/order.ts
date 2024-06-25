import { ConsumeMessage, Options, Replies } from "amqplib/properties";
import { MessageBroker } from "../message_broker";
import { OrderMessage } from "@abstract/order";

const NOTIFICATION_TOPIC = "orders"

export async function subscribe_orders_topic(
        broker: MessageBroker, 
        call_back: (msg: OrderMessage) => void, options?: Options.Consume
    ): Promise<Replies.Consume>{
        
    return await broker.receive_messages(NOTIFICATION_TOPIC, (msg: ConsumeMessage|null)=>{
        if (msg) {
            call_back(OrderMessage.from_buffer(msg.content))
            if(options&&options.noAck==false)
                broker.ack(msg)
        }
    }, options)
}

export async function publish_orders_topic(broker: MessageBroker, message: OrderMessage, options?: Options.Publish){
    return await broker.send_message(NOTIFICATION_TOPIC, message.to_buffer(), options)
}