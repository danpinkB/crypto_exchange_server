import * as amqp from 'amqplib';
import { ConsumeMessage, Options } from 'amqplib';
import { MESSAGE_BROKER__DSN } from './env';

export class MessageBroker{
    protected dsn;
    protected conn: amqp.Connection | null = null;
    protected channel: amqp.Channel| null = null;
    
    constructor(dsn:string){
        this.dsn = dsn
    }

    async connect(){
        this.conn = await amqp.connect(this.dsn, {})
        this.channel = await this.conn.createChannel();
        return this
    }

    async send_message(que_name: string, message: Buffer, options: Options.Publish | undefined = undefined): Promise<boolean>{
        await this.channel!.assertQueue(que_name, {durable:true, })
        return this.channel!.sendToQueue(que_name, message, options)
    }

    async receive_messages(que_name: string, call_back: (msg: ConsumeMessage | null) => void, options?: Options.Consume): Promise<amqp.Replies.Consume>{
        await this.channel!.assertQueue(que_name, {durable:true})
        return await this.channel!.consume(que_name, call_back)
    }
    
    async ack(message: amqp.Message){
        this.channel?.ack(message)
    }
}

export async function message_broker(): Promise<MessageBroker>{
    return new MessageBroker(MESSAGE_BROKER__DSN).connect()
}