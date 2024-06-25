
import { HttpValidationException, IValidate } from "@abstract/error";
import { OrderRequestDTO } from "@abstract/dto/order";
import { ValidationError } from "class-validator";

let crypto_order_validator: IValidate<OrderRequestDTO> = {
    validate_from: async function (dto: OrderRequestDTO, errors: ValidationError[]): Promise<ValidationError[]> {
       return await errors;
    },
    validate_to: async function (dto: OrderRequestDTO, errors: ValidationError[]): Promise<ValidationError[]> {
        return await errors;
    },
    validate_from_or_reject: async function (dto: OrderRequestDTO, errors: ValidationError[]): Promise<OrderRequestDTO> {
        return this.validate_from(dto, errors).then(err=>{
            if (err.length>0) throw new HttpValidationException(err)
            return dto
        })
    },
    validate_to_or_reject: function (dto: OrderRequestDTO, errors: ValidationError[]): Promise<OrderRequestDTO> {
        return this.validate_to(dto, errors).then(err=>{
            if (err.length>0) throw new HttpValidationException(err)
            return dto
        })
    }
}

export {crypto_order_validator}