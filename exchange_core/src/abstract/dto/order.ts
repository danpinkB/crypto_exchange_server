import { HttpValidationException } from "@abstract/error"
import { OrderStatus, OrderType } from "@prisma/client";
import { Exclude, Expose, Transform, Type } from "class-transformer";
import { IsDate, IsEmail, IsEmpty, IsIn, IsMobilePhone, IsNotEmpty, IsOptional, IsString, validate } from "class-validator";
import Decimal from "decimal.js";
import { CardInstrumentDTO, CryptoInstrumentDTO, FiatInstrumentDTO } from "./payment_instrument";

export class OrderInfoDTO{

    @IsOptional()
    @IsEmail()
    email?: string
    @IsOptional()
    phone?: string
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    supposed_visit_date?: Date
    @IsOptional()
    address?: string
    @IsOptional()
    name?: string

    async validate(): Promise<OrderInfoDTO>{
        return validate(this).then(async(err)=>{
            if (err.length>0) throw new HttpValidationException(err)
            return this
        })
    }
}

export class OrderRequestDTO{
    source_id?: number;
    destination_id?: number;
    status?: OrderStatus;
    @Type(() => OrderInfoDTO)
    info!:OrderInfoDTO
    @IsNotEmpty()
    @Type(() => Decimal)
    @Transform(({ value }) => new Decimal(value), { toClassOnly: true })
    amount!: Decimal
    @IsEmpty()
    recepient_address?: string
    @IsNotEmpty()
    @IsString()
    @IsIn(Object.values(OrderType))
    type!: OrderType

    amount_out!: Decimal
    
    expired_at!: Date
    
    async validate(): Promise<OrderRequestDTO>{
        await this.info.validate()
        return validate(this).then(async(err)=>{
            if (err.length>0) throw new HttpValidationException(err)
            return this
        })
    }
}

export class OrderResponseDTO{
    id!: string;
    source_id!: number;
    order_number!: number
    destination_id!: number;
    amount!: Decimal
    recepient_address?: string
    status!: OrderStatus;
    type!: OrderType
    created_at!: Date;
    info!:OrderInfoDTO
    
    expired_at!: Date | null

    source?: CryptoInstrumentDTO | FiatInstrumentDTO | CardInstrumentDTO | null;
    destination?: CryptoInstrumentDTO | FiatInstrumentDTO | CardInstrumentDTO | null;

    amount_out!: Decimal

    logs!: BlockChainTransactionLogDTO[]
}

export class OrderShortResponseDTO{
    id!: string;
    order_number!: number
    amount!: Decimal 
    recepient_address!: string | null
    status!: OrderStatus;
    type!: OrderType
    info!:OrderInfoDTO

    amount_out!: Decimal
    
    expired_at!: Date | null

    source?: CryptoInstrumentDTO | FiatInstrumentDTO | CardInstrumentDTO | null;
    destination?: CryptoInstrumentDTO | FiatInstrumentDTO | CardInstrumentDTO | null;
}


export class BlockChainTransactionLogDTO{
    created_at!: Date
    tx_hash!: string
    amount!: number
    order_id!: string | ""
    type!: string
    id!: number | -1
}