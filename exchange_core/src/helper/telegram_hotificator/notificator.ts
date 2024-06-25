import { Telegraf } from "telegraf";

export class TGHotificator{
    protected bot_instance: Telegraf;

    constructor(secret: string){
        this.bot_instance = new Telegraf(secret)
    }

    async send_text_message(chat_id: string, message:string){
        this.bot_instance.telegram.sendMessage(chat_id, message);
    }
}