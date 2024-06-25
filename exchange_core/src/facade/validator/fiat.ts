import { HttpValidationException, IValidate, ValidationErrorWithConstraints } from "@abstract/error";
import { OrderRequestDTO } from "@abstract/dto/order";
import { OrderType } from "@prisma/client";
import { ValidationError } from "class-validator";


let fiat_order_validator: IValidate<OrderRequestDTO> = {
    validate_from: async function (dto: OrderRequestDTO, errors: ValidationError[]): Promise<ValidationError[]> {
        if (dto.type==OrderType.online) errors.push(new ValidationErrorWithConstraints({ "type": "order type could not be online in operations with cash" }));
        if (dto.type==OrderType.delivery&&(!dto.info.phone || !dto.info.email)) errors.push(new ValidationErrorWithConstraints({ "contact_info": "contact inforamtion required" }));
        return await errors;
    },
    validate_to: async function (dto: OrderRequestDTO, errors: ValidationError[]): Promise<ValidationError[]> {
        if (dto.type==OrderType.online) errors.push(new ValidationErrorWithConstraints({ "type": "order type could not be online in operations with cash" }));
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

export {fiat_order_validator}