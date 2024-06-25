import { Decimal } from 'decimal.js';
import { Transform, Type } from 'class-transformer';
import { IsInt, Length, IsNotEmpty, validate, IsIn} from 'class-validator';
import { PaymentType } from '@prisma/client';
import { ChainType } from "@abstract/model/chain";;
import { HttpValidationException } from '@abstract/error';



export class CryptoInstrumentDTO{
    id?: number
    @IsNotEmpty()
    @Length(34,42)
    address!: string
    symbol?: string
    name?: string
    icon: string = ""
    @IsNotEmpty()
    @IsIn(Object.values(ChainType))
    @Type(() => Number)
    chain!: ChainType
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    precision!: number
    type: PaymentType = PaymentType.crypto
    decimals?: Decimal
    destinations?: number[]

    async validate(): Promise<CryptoInstrumentDTO>{
        return validate(this).then((err)=>{
            if (err.length>0) throw new HttpValidationException(err)
            return this
        })
    }
}


export class FiatInstrumentDTO{
    id?: number
    @IsNotEmpty()
    symbol?: string
    @IsNotEmpty()
    name?: string
    icon?: string
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    precision!: number
    type: PaymentType = PaymentType.fiat
    destinations?: number[]
    
    async validate(): Promise<FiatInstrumentDTO>{
        return validate(this).then((err)=>{
            if (err.length>0) throw new HttpValidationException(err)
            return this
        })
    }
}

export class CardInstrumentDTO{
    id?: number
    symbol?: string
    name?: string
    icon?: string
    type: PaymentType = PaymentType.card
    @IsNotEmpty()
    @IsInt()
    @Type(() => Number)
    precision!: number
    destinations?: number[]
}