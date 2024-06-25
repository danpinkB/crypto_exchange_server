import { HttpValidationException } from "@abstract/error"
import { Type } from "class-transformer"
import { IsNotEmpty, validate } from "class-validator"
import Decimal from "decimal.js"

export class ComissionDTO{
    id?: number
    title?: string
    @IsNotEmpty()
    @Type(() => Decimal)
    amount?: Decimal

    async validate(): Promise<ComissionDTO>{
        return validate(this).then((err)=>{
            if (err.length>0) throw new HttpValidationException(err)
            return this
        })
    }
}