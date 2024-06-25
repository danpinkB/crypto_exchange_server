import { TG_SECRET } from './env'
import { TGHotificator } from './notificator'


export function telegram_notificator(){
    return new TGHotificator(TG_SECRET)
}