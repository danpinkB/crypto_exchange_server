import { OrderRequestDTO, OrderResponseDTO, OrderShortResponseDTO } from '@abstract/dto/order'
import { PrismaClient, OrderStatus } from '@prisma/client'
import createError from 'http-errors'
import { payment_instrument_validator } from './validator'
import { ValidationError } from 'class-validator'
import { order_dto_request_mapper, order_dto_response_client_mapper, order_dto_response_mapper, } from '@abstract/mapper/dto/order'
import { recepient_address_from_source_factory_method } from './recepient_address_factory'
import { price_storage } from '@helper/price_storage'
import Decimal from 'decimal.js'
import { make_operation_chain_service, make_order_service } from '@service/index'
import { make_wallet_order_service } from '@service/wallet_order'
import { typed_payment_instrument_entity_mapper } from '@abstract/mapper/model/payment_instrument'
import { CryptoInstrument } from '@abstract/model/entity'
import { publish_orders_topic } from '@helper/message_broker/topics/order'
import { message_broker } from '@helper/message_broker/message_broker'
import { OrderFilterParams, OrderMessage } from '@abstract/order'
import { ChainCompositeKey } from '@abstract/model/chain'
import { PaginationParams, PaginationResponseWrapper, PaginationResponseWrapperWithExtraInfo } from '@abstract/pagination'

export function make_order_facade(db_connection: PrismaClient){
    let operation_chain_service = make_operation_chain_service(db_connection)
    let order_service = make_order_service(db_connection)
    let kv_price_storage = price_storage()
    let wallet_order_service = make_wallet_order_service(db_connection)
    
    return Object.freeze({
        get_user_orders,
        get_all,
        create,
        update,
        get,
        get_user_completed_orders,
    })
    
    async function create(chain_id: ChainCompositeKey, order: OrderRequestDTO, user_id: string | null, is_admin: boolean = false): Promise<OrderShortResponseDTO|OrderResponseDTO>{
        
        let chain = await operation_chain_service.get_active_or_throw(chain_id.flip())
        
        let errors: ValidationError[] = []
        
        await payment_instrument_validator[chain.source.type].validate_to(order, errors)
        await payment_instrument_validator[chain.destination.type].validate_from_or_reject(order, errors)
        
        if (chain.min_amount > order.amount || order.amount > chain.max_amount) 
            throw createError(417, `available amount range ${chain.min_amount} - ${chain.max_amount}`)

        let price = await kv_price_storage.get(`${chain.source.symbol}${chain.destination.symbol}`)
        if (!price) throw createError(500,"couldn't get pair price")
        
    
        let order_entity = await db_connection.$transaction(async()=>{
            let now = new Date()
            let date = null;
            if(chain.destination.type != "fiat")
                date = new Date(now.getTime()+15*60*1000)
            let [wid, waddr] = await recepient_address_from_source_factory_method[chain.destination.type](chain.destination, order)
            let order_entity = await order_service.create({
                id: "",
                info_id: -1,
                order_number: -1,
                created_at: now,
                expired_at: date,
                amount_out: order.amount.mul(price!.mul(new Decimal(1).plus(chain.comission.amount))),
                destination_id: chain.source_id,
                source_id: chain.destination_id,
                status: OrderStatus.placed,
                user_id: user_id,
                type:order.type,
                amount: order.amount,
                recepient_address: waddr,
                info:{
                    id: -1,
                    name: order.info.name || null,
                    address: order.info.address || null,
                    email: order.info.email || null,
                    phone: order.info.phone || null,
                    supposed_visit_date: order.info.supposed_visit_date || null,
                }
            })

            if (chain.destination.type === "crypto"){
                let payment_instrument: CryptoInstrument = typed_payment_instrument_entity_mapper[chain.destination.type].to(chain.destination)
                await wallet_order_service.create({
                    wallet_id: wid!,
                    id:`${waddr}_${payment_instrument.address}`,
                    chain: payment_instrument.chain,
                    order_id: order_entity.id,
                    type: "crypto"
                })
            }

            await publish_orders_topic(await message_broker(), new OrderMessage(
                order_entity.id,
                order_entity.order_number,
                order_entity.info,
                order_entity.source!,
                order_entity.destination!,
                order_entity.status,
                order_entity.type,
                order_entity.amount,
                order_entity.amount_out,
                order_entity.expired_at,
                order_entity.recepient_address,
            ))
            
            return order_entity
        })
        
        return is_admin?order_dto_response_mapper.from(order_entity):order_dto_response_client_mapper.from(order_entity)
    }

    
    async function get(id:string, include_logs: boolean = false): Promise<OrderResponseDTO> {
        return order_dto_response_mapper.from(
            await order_service.get(id, include_logs)
        )
    }

    async function get_user_orders(user_id:string, pagination_params:PaginationParams, include_logs: boolean = false): Promise<PaginationResponseWrapper> {
        return new PaginationResponseWrapper(
            pagination_params.require_total?await order_service.get_user_orders_total(user_id).then(res=>res._count):0,
            await order_service.get_user_orders(user_id,pagination_params, include_logs).then(
                orders=>orders.map(x=>order_dto_response_mapper.from(x))
            )
        )
    }

    async function get_user_completed_orders(user_id:string, pagination_params:PaginationParams, include_logs: boolean = false): Promise<PaginationResponseWrapperWithExtraInfo> {
        let user_orders_info = await order_service.get_user_completed_orders_total(user_id)
        let response = new PaginationResponseWrapperWithExtraInfo(
            pagination_params.require_total?user_orders_info._count:0,
            await order_service.get_user_completed_orders(user_id,pagination_params, include_logs).then(
                orders=>orders.map(x=>order_dto_response_mapper.from(x))
            )
        )
        response.total_amount = user_orders_info._sum.amount?.toFixed(2) || '0'
        return response
    }

    async function get_all(pagination_params:PaginationParams, tx_filters: OrderFilterParams, include_logs: boolean = false): Promise<PaginationResponseWrapper> {
        return new PaginationResponseWrapper(
            pagination_params.require_total?await get_total(tx_filters).then(res=>res._count):0, 
            await order_service.get_all(pagination_params, tx_filters, include_logs).then(
                (orders)=>orders.map(
                    x=>order_dto_response_mapper.from(x)
                )
            )
        ) 
    }

    async function update(id:string, order: OrderRequestDTO): Promise<OrderResponseDTO>{
        let order_entity = await order_service.get(id)
        let errors: ValidationError[] = []
        
        await payment_instrument_validator[order_entity.source!.type].validate_from(order, errors)
        await payment_instrument_validator[order_entity.destination!.type].validate_from_or_reject(order, errors)

        let update_order_entity = order_dto_request_mapper.to(order)
        update_order_entity.info_id = order_entity.info_id
        
        return order_dto_response_mapper.from(
            await order_service.update(id, update_order_entity)
        )
    }
    
    async function get_total(tx_filters: OrderFilterParams) {
        return await order_service.get_total(tx_filters)
    }
}