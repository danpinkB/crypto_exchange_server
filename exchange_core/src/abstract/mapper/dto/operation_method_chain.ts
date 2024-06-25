import { OperationChainQueryArgs } from "@abstract/model/operation_chain"
import { OperationMethodChainDTO } from "@abstract/dto/operation_chain"
import { typed_payment_instrument_entity_mapper } from "@abstract/mapper/model/payment_instrument"
import { OperationMethodChain } from "@prisma/client"
import { typed_payment_instrument_mapper_dto } from "./payment_instrument"
import { IMap } from "@abstract/mapping"


export const operation_chain_mapper: IMap<OperationMethodChain, OperationMethodChainDTO> = {
    from: function (entity: OperationChainQueryArgs): OperationMethodChainDTO {
        let dto = new OperationMethodChainDTO()
        dto.source_id = entity.source_id
        dto.destination_id = entity.destination_id
        dto.comission_id = entity.comission_id
        dto.is_active = entity.is_active
        dto.max_amount = entity.max_amount
        dto.min_amount = entity.min_amount
        dto.comission = entity.comission.amount

        if(entity.destination)
            dto.destination = typed_payment_instrument_mapper_dto[entity.destination.type].from(typed_payment_instrument_entity_mapper[entity.destination.type].to(entity.destination))
        if (entity.source)
            dto.source = typed_payment_instrument_mapper_dto[entity.source.type].from(typed_payment_instrument_entity_mapper[entity.source.type].to(entity.source));
        
        return dto
    },
    
    to: function (data: OperationMethodChainDTO): OperationMethodChain {
        return {
            source_id: data.source_id!,
            destination_id: data.destination_id!,
            comission_id: data.comission_id!,
            is_active: data.is_active!,
            max_amount: data.max_amount!,
            min_amount: data.min_amount!,
            // type: data.type
        }
    }
}