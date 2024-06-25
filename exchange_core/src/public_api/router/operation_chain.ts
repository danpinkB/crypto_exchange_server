import express, {NextFunction, Request, Response, Router} from'express'
import {StatusCodes} from 'http-status-codes'
import {Keycloak} from 'keycloak-connect'

import { ChainCompositeKey } from '@abstract/model/chain'
import { HttpResponse } from '@abstract/common'
import { plainToClass } from 'class-transformer'
import { storage } from '@helper/storage'
import createError from 'http-errors'
import { OrderRequestDTO } from '@abstract/dto/order'
import { make_operation_chain_facade } from '@facade/operation_chain'
import { make_order_facade } from '@facade/order'
import { OperationMethodChainDTO } from '@abstract/dto/operation_chain'
import { PaginationParams } from '@abstract/pagination'

export function make_operation_chain_router(keycloak: Keycloak) : Router {
    let operation_chain_facade = make_operation_chain_facade(storage())
    let order_facade = make_order_facade(storage())
    let _router = express.Router();
    
    _router.post("/", keycloak.protect("realm:admin"), async (req: Request, res: Response) => {
        let dto:OperationMethodChainDTO = await plainToClass(OperationMethodChainDTO, req.body).validate()
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await operation_chain_facade.create(dto)
            )
        )
    })

    _router.put("/:id", keycloak.protect("realm:admin"), async (req: Request, res: Response) => {
        let id = ChainCompositeKey.parse(req.params['id'])
        let dto:OperationMethodChainDTO = {...req.body} as OperationMethodChainDTO
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await operation_chain_facade.update(id, dto)
            )
        )
    })

    _router.post("/:id/reverse", keycloak.protect("realm:admin"), async (req: Request, res: Response) => {
        let id = ChainCompositeKey.parse(req.params['id'])
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await operation_chain_facade.reverse(id)
            )
        )
    })

    _router.post("/:id/order", async (req: Request, res: Response) => {
        let id = ChainCompositeKey.parse(req.params['id'])
        let dto:OrderRequestDTO = await plainToClass(OrderRequestDTO, req.body).validate()
        let user_id = null;
        
        try{
            let grant = await keycloak.getGrant(req, res) as any
            
            user_id = grant.access_token.content.sub
        }
        catch {}

        // console.log(grant.access_token.content);
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await order_facade.create(id, dto, user_id)
            )
        )
    })

    _router.delete("/:id", keycloak.protect("realm:admin"), async (req: Request, res: Response) => {
        let id = ChainCompositeKey.parse(req.params['id'])
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await operation_chain_facade.remove(id)
            )
        )
    })

    _router.get("/", async (req: Request, res: Response, next: NextFunction)=> {
        let pagination_params = PaginationParams.parse(req.query)
        let only_active =  Boolean(req.query['only_active'])
        if (only_active)
            keycloak.protect("realm:admin")(req, res, next)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await operation_chain_facade.get_all(pagination_params, only_active)
            )
        )
    })

    _router.get("/prices", async (req: Request, res: Response)=> {
        if (req.query['ids'] == null) throw createError(417, "ids param required")
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await operation_chain_facade.get_prices(req.query['ids']!.toString().split(",").map(x=>ChainCompositeKey.parse(x)))
            )
        )
    })

    _router.get("/:id", async (req: Request, res: Response)=> {
        let id = ChainCompositeKey.parse(req.params['id'])
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await operation_chain_facade.get(id)
            )
        )
    })

    _router.get("/:id/price", async (req: Request, res: Response)=> {
        //price is opposite for client side
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await operation_chain_facade.get_price(ChainCompositeKey.parse(req.params['id']), true)
            )
        )
    })
   

    return _router
};
