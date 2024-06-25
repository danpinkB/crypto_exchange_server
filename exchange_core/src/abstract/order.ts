import {OrderStatus, OrderType} from '@prisma/client'
import Decimal from 'decimal.js'
import { PaymentInstrument } from './model/entity'
import { ORDER_STATUSES } from './const'

export type OrderMessageContactInfo = {
    email: string | null
    phone: string | null
    supposed_visit_date: Date | null
    address: string | null
    name: string | null
}

export class OrderMessage{
    id!: string
    order_number!: number
    info!: OrderMessageContactInfo | null
    source!: PaymentInstrument
    destination!: PaymentInstrument
    status!: OrderStatus
    type!: OrderType
    amount!: Decimal
    amount_out!: Decimal
    expired_at!: Date | null
    recipient_address!: string | null

    constructor(
        id: string,
        order_number: number,
        info: OrderMessageContactInfo | null,
        source: PaymentInstrument,
        destination: PaymentInstrument,
        status: OrderStatus,
        type: OrderType,
        amount: Decimal,
        amount_out: Decimal,
        expired_at: Date | null,
        recipient_address: string | null
        ) {
        this.id = id;
        this.order_number = order_number;
        this.info = info;
        this.source = source;
        this.destination = destination;
        this.status = status;
        this.type = type;
        this.amount = amount;
        this.amount_out = amount_out;
        this.expired_at = expired_at;
        this.recipient_address = recipient_address;
    }
    
    to_buffer(){
        return Buffer.from(JSON.stringify(this), 'utf-8')
    }

    static from_buffer(buff: Buffer): OrderMessage{
        return JSON.parse(buff.toString("utf-8"))
    }
}

export class OrderFilterParams{
    statuses: OrderStatus[]
    constructor(statuses: OrderStatus[]){
        this.statuses = statuses
    }
    static parse(source: any):OrderFilterParams{
        return new OrderFilterParams(
            source['statuses']?source['statuses'].toString().split(',').filter((x:string)=>ORDER_STATUSES.includes(x)).map((x:string)=>x as OrderStatus): ORDER_STATUSES
        )
    }
}

