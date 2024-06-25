import { HttpValidationException } from "@abstract/error"
import { Type } from "class-transformer";
import { IsInt,IsDecimal, validate, IsNotEmpty, IsString } from "class-validator";
import Decimal from "decimal.js";

export class OperationMethodChainDTO{
    @IsInt()
    @Type(() => Number)
    source_id?: number;
    @IsInt()
    @Type(() => Number)
    destination_id?: number
    @IsInt()
    @Type(() => Number)
    comission_id?: number
    is_active?: boolean
    @IsDecimal()
    @Type(() => Decimal)
    min_amount?: Decimal
    @IsDecimal()
    @Type(() => Decimal)
    max_amount?: Decimal
    source?: any
    destination?: any
    comission?: Decimal
    
    async validate(): Promise<OperationMethodChainDTO>{
        return validate(this).then((err)=>{
            if (err.length>0) throw new HttpValidationException(err)
            return this
        })
    }
}