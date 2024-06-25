import { OrderLogType, OrderWithInfo } from "@abstract/model/order"
import { BlockChainTransactionLogDTO, OrderInfoDTO, OrderRequestDTO, OrderResponseDTO, OrderShortResponseDTO } from "@abstract/dto/order"
import { typed_payment_instrument_mapper_dto } from "./payment_instrument"
import { typed_payment_instrument_entity_mapper } from "@abstract/mapper/model/payment_instrument"
import { IMapFrom, IMapTo } from "@abstract/mapping"
import { BlockChainTransactionLog, typed_entity_mapper } from "../../model/entity"

export const order_dto_response_mapper: IMapFrom<OrderWithInfo, OrderResponseDTO> = {
    from: (entity: OrderWithInfo) => {
        let dto = new OrderResponseDTO()
        dto.id = entity.id
        dto.order_number = entity.order_number
        dto.amount_out = entity.amount_out
        dto.amount = entity.amount
        dto.info = {
            address: entity.info.address || undefined,
            email: entity.info.email || undefined,
            phone: entity.info.phone || undefined,
            supposed_visit_date: entity.info.supposed_visit_date || undefined,
            name: entity.info.name || undefined
        } as OrderInfoDTO
        dto.status = entity.status
        dto.type = entity.type
        dto.recepient_address = entity.recepient_address!
        dto.created_at = entity.created_at
        dto.expired_at = entity.expired_at
        
        if(entity.destination)
            dto.destination = typed_payment_instrument_mapper_dto[entity.destination.type].from(typed_payment_instrument_entity_mapper[entity.destination.type].to(entity.destination))
        
        if (entity.source)
            dto.source = typed_payment_instrument_mapper_dto[entity.source.type].from(typed_payment_instrument_entity_mapper[entity.source.type].to(entity.source));
        
        if (entity.logs)
            dto.logs = entity.logs.map(x=>typed_log_mapper[x.type].from(typed_entity_mapper[x.type].from_mapping(x)))

        return dto  
    },
}

export const order_dto_response_client_mapper: IMapFrom<OrderWithInfo, OrderShortResponseDTO> = {
    from: (entity: OrderWithInfo) => {
        let dto = new OrderShortResponseDTO()
        dto.id = entity.id
        dto.order_number = entity.order_number
        dto.amount = entity.amount
        dto.info = {
            address: entity.info.address || undefined,
            email: entity.info.email || undefined,
            phone: entity.info.phone || undefined,
            supposed_visit_date: entity.info.supposed_visit_date || undefined,
            name: entity.info.name || undefined
        } as OrderInfoDTO,
        dto.status = entity.status
        dto.type = entity.type
        dto.recepient_address = entity.recepient_address
        dto.expired_at = entity.expired_at
        dto.amount_out = entity.amount_out
        
        if(entity.destination)
            dto.destination = typed_payment_instrument_mapper_dto[entity.destination.type].from(typed_payment_instrument_entity_mapper[entity.destination.type].to(entity.destination))
        
        if (entity.source)
            dto.source = typed_payment_instrument_mapper_dto[entity.source.type].from(typed_payment_instrument_entity_mapper[entity.source.type].to(entity.source));
        
        return dto
    },
}

export const order_dto_request_mapper: IMapTo<OrderWithInfo, OrderRequestDTO> = {
    to: (data: OrderRequestDTO) => {
        return {
            id: "",
            order_number: -1,
            info_id:-1,
            created_at: new Date(),
            destination_id: data.destination_id!,
            source_id: data.source_id!,
            status: data.status!,
            type: data.type,
            user_id: null,
            recepient_address: data.recepient_address || null,
            expired_at: data.expired_at,
            amount_out: data.amount_out,
            amount: data.amount!,
            info:{
                name: data.info.name || null,
                address: data.info.address || null,
                email: data.info.email || null,
                phone: data.info.phone || null,
                supposed_visit_date: data.info.supposed_visit_date || null,
                id: -1
            }
        }
    },
}



export const order_log_dto_response_mapper: IMapFrom<BlockChainTransactionLog, BlockChainTransactionLogDTO> = {
    from: (entity: BlockChainTransactionLog) => {
        return {
            id: entity.id,
            amount: entity.amount,
            order_id: entity.order_id,
            created_at: entity.created_at,
            tx_hash: entity.tx_hash,
            type: entity.type
        }
    },
}

export const typed_log_mapper = {
    [OrderLogType.CRYPTO.valueOf()]: order_log_dto_response_mapper
}
