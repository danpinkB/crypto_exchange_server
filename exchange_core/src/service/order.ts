import { OrderWithInfo } from '@abstract/model/order'
import { OrderFilterParams } from '@abstract/order'
import { PaginationParams } from '@abstract/pagination'
import { PrismaClient } from '@prisma/client'

const INCLUDE = {
    source:{
        include:{
            mappings: true
        }
    },
    destination: {
        include:{
            mappings: true
        }
    },
    info: true,
}

const INCLUDE_WITH_LOGS = {
    source:{
        include:{
            mappings: true
        }
    },
    destination: {
        include:{
            mappings: true
        }
    },
    info: true,
    logs:{
        include:{
            mappings: true
        }
    }
}


export function make_order_service(db_connection: PrismaClient){
    return Object.freeze({
        create,
        update,
        get_all,
        get,
        get_total,
        get_user_orders,
        get_all_with_filters,
        get_user_orders_total,
        get_user_completed_orders,
        get_user_completed_orders_total
    })

    async function create(entity: OrderWithInfo): Promise<OrderWithInfo> {
        return db_connection.$transaction(async()=>{
            let order_info = await db_connection.orderInfo.create({
                data:{
                    name: entity.info.name,
                    email: entity.info.email,
                    phone: entity.info.phone,
                    supposed_visit_date: entity.info.supposed_visit_date,
                    address: entity.info.address,
                }
            })
            
            return await db_connection.order.create({
                data:{
                    created_at: entity.created_at,
                    status: entity.status,
                    source_id: entity.source_id,
                    destination_id: entity.destination_id,
                    user_id: entity.user_id,
                    info_id: order_info.id,
                    type: entity.type,
                    amount: entity.amount,
                    recepient_address: entity.recepient_address,
                    expired_at: entity.expired_at,
                    amount_out: entity.amount_out,
                },
                include:INCLUDE
            })
        })
    }
    async function update(id: string, entity: OrderWithInfo): Promise<OrderWithInfo> {
        return db_connection.$transaction(async()=>{
            await db_connection.orderInfo.update({
                where:{
                    id: entity.info_id
                },
                data:{
                    name: entity.info.name,
                    email: entity.info.email,
                    phone: entity.info.phone,
                    supposed_visit_date: entity.info.supposed_visit_date,
                    address: entity.info.address,
                }
            })
            return await db_connection.order.update({
                where:{id:id},
                data:{
                    status: entity.status,
                    // source_id: entity.source_id,
                    // destination_id: entity.destination_id,
                    // user_id: entity.user_id,
                    type: entity.type,
                    amount: entity.amount,
                    // recepient_address: entity.recepient_address
                },    
                include:INCLUDE
            })
        })
    }

    async function get(id:string, include_logs: boolean = false): Promise<OrderWithInfo>{
        return db_connection.order.findFirstOrThrow({
            where:{id:id},
            include:include_logs?INCLUDE_WITH_LOGS:INCLUDE
        })
    }

    async function get_user_orders(user_id:string, pagination_params: PaginationParams, include_logs: boolean = false): Promise<OrderWithInfo[]>{
        return db_connection.order.findMany({
            where:{ user_id: user_id },
            orderBy: {created_at:"desc"},
            skip: pagination_params.skip,
            take: pagination_params.take,
            include:include_logs?INCLUDE_WITH_LOGS:INCLUDE
        })
    }

    async function get_user_orders_total(user_id:string){
        return await db_connection.order.aggregate({
            where:{
                user_id: user_id
            },
        _count:true})
    }

    async function get_all(pagination_params: PaginationParams, tx_filters: OrderFilterParams, include_logs: boolean = false): Promise<OrderWithInfo[]> {
        return await db_connection.order.findMany({
            skip:pagination_params.skip,
            take:pagination_params.take,
            orderBy: {created_at:"desc"},
            where:{status:{in:tx_filters.statuses}},
            include:include_logs?INCLUDE_WITH_LOGS:INCLUDE
        })
    }

    async function get_all_with_filters(pagination_params: PaginationParams, order_filter_params: OrderFilterParams, include_logs: boolean = false) : Promise<OrderWithInfo[]>{
        return await db_connection.order.findMany({
            skip:pagination_params.skip,
            take:pagination_params.take,
            where:{
                status:{
                    in: order_filter_params.statuses
                }
            },
            orderBy: {created_at:"desc"},
            include:include_logs?INCLUDE_WITH_LOGS:INCLUDE
        })
    }

    async function get_total(tx_filters: OrderFilterParams){
        return await db_connection.order.aggregate({where:{status:{in:tx_filters.statuses}},_count:true})
    }

    async function get_user_completed_orders(user_id:string, pagination_params: PaginationParams, include_logs: boolean = false): Promise<OrderWithInfo[]>{
        return db_connection.order.findMany({
            where:{ user_id: user_id, status: "completed"},
            orderBy: {created_at:"desc"},
            skip: pagination_params.skip,
            take: pagination_params.take,
            include:include_logs?INCLUDE_WITH_LOGS:INCLUDE
        })
    }
    async function get_user_completed_orders_total(user_id:string){
        return await db_connection.order.aggregate({
            where:{
                user_id: user_id, 
                status: "completed"
            },
        _count:true,
        _sum:{amount:true}})
    }
}