import express, {NextFunction, Request, Response, Router} from'express'
import {StatusCodes} from 'http-status-codes'
import {Keycloak, } from 'keycloak-connect'

import { storage } from '@helper/storage'
import { HttpResponse } from '@abstract/common'
import { ChainCompositeKey } from '@abstract/model/chain'
import { plainToClass } from 'class-transformer'
import { OrderRequestDTO } from '@abstract/dto/order'
import { make_order_facade } from '@facade/order'
import { PaginationParams } from '@abstract/pagination'
import { OrderFilterParams } from '@abstract/order'

export function make_order_router(keycloak: Keycloak): Router {
    let connection = storage()
    let order_facade = make_order_facade(connection)
    let _router = express.Router();
    
    
    _router.post("/", keycloak.protect("realm:admin"), async (req: Request, res: Response)=> {
        let id = ChainCompositeKey.parse(req.query['pair_id']!.toString())
        let dto: OrderRequestDTO = await plainToClass(OrderRequestDTO, req.body).validate()
        // let grant = await keycloak.getGrant(req, res) as any
        // console.log(grant.access_token.content);
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await order_facade.create(id, dto, null, true)
            )
        )
    })

    _router.put("/:id", keycloak.protect("realm:admin"), async (req: Request, res: Response, next: NextFunction)=> {
        let dto: OrderRequestDTO = await plainToClass(OrderRequestDTO, req.body).validate()
        let grant = await keycloak.getGrant(req, res) as any
        console.log(grant.access_token.content.uid);
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await order_facade.update(req.params['id'], dto)
            )
        )
    })

    _router.get("/", keycloak.protect("realm:admin"), async (req: Request, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        let order_filters_params = OrderFilterParams.parse(req.query)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await order_facade.get_all(pagination_params, order_filters_params, true)
            )
        )
    })

    _router.get("/:id", async (req: Request, res: Response)=> {
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await order_facade.get(req.params['id']!, true)
            )
        )
    })

    return _router
};
