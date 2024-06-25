import { ConsumeMessage, Options, Replies } from "amqplib/properties";
import { MessageBroker } from "../message_broker";
import Handlebars from 'handlebars'
import { ExecutionAction } from "@abstract/execution";
import Validator from 'fastest-validator';

const EXECUTION_TOPIC = Handlebars.compile("execution_{{{postfix}}}")
const validator = new Validator()

// async function validate_schema_or_throw(obj: any, schema: object){
//     if (!await validator.validate(obj, schema)) throw new Error(`invalid generic type for object ${obj}`)
// }

export async function subscribe_execution_topic<T extends ExecutionAction<{}>>(
    postfix: string,
    broker: MessageBroker, 
    call_back: (msg: T) => Promise<void>, 
    options?: Options.Consume
): Promise<Replies.Consume>{
    return await broker.receive_messages(EXECUTION_TOPIC({postfix: postfix}), async(msg: ConsumeMessage|null)=>{
        if (msg) {
            let message = JSON.parse(msg.content.toString("utf-8"), (key, value) => {
                if (typeof value === "string" && value.startsWith('BIGINT::')) {
                  return BigInt(value.substr(8));
                }
                return value;
              })
            await call_back(message).then(
                async (val)=>options&&options.noAck==false?await broker.ack(msg):val
            )
        }
    }, options)
}

export async function publish_execution_topic<T extends ExecutionAction<{}>>(
    postfix: string, 
    broker: MessageBroker, 
    message: T, 
    options?: Options.Publish
){
    // await validate_schema_or_throw(message, schema<T>)
    console.log("SENDING MESSAGE");
    console.log(message);
    
    
    return await broker.send_message(EXECUTION_TOPIC({postfix: postfix}), Buffer.from(JSON.stringify(message, (key, value) =>
        (typeof value === "bigint" ? `BIGINT::${value}` : value)), 'utf-8'), options)
}