import { Order, OrderInfo, OrderLog, OrderLogMapping } from "@prisma/client"
import { PaymentInstrumentQueryArgs } from "./payment_instrument"

export enum OrderLogType{
    CRYPTO = "crypto",
}

export type OrderLogWithMapping = OrderLog & {mappings: OrderLogMapping[]}

export type OrderWithInfo = Order & {
    info:OrderInfo, 
    source?: PaymentInstrumentQueryArgs, 
    destination?: PaymentInstrumentQueryArgs
    logs?: OrderLogWithMapping[]
}