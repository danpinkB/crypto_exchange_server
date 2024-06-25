import express, { Request,Response, Router } from'express'
import {StatusCodes} from 'http-status-codes'
import {Keycloak} from 'keycloak-connect'
import { ComissionDTO } from '@abstract/dto/comission'
import { HttpResponse } from '@abstract/common'
import { storage } from '@helper/storage'
import { plainToClass } from 'class-transformer'
import createError from 'http-errors'
import { make_comission_facade } from '@facade/comission'
import { make_operation_chain_facade } from '@facade/operation_chain'
import { ChainCompositeKey } from '@abstract/model/chain'
import { PaginationParams } from '@abstract/pagination'

export function make_comission_router(keycloak: Keycloak): Router {
    let comission_facade = make_comission_facade(storage())
    let operation_chain_facade = make_operation_chain_facade(storage())
    let _router = express.Router();
    
    _router.post("/", keycloak.protect("realm:admin"), async (req: Request, res: Response)=> {
        let dto:ComissionDTO = await plainToClass(ComissionDTO, req.body).validate()
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await comission_facade.create(dto)
            )
        )
    })

    _router.put("/:id", keycloak.protect("realm:admin"), async (req: Request, res: Response)=> {
        let dto:ComissionDTO = await plainToClass(ComissionDTO, req.body).validate()
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await comission_facade.update(Number(req.params['id']), dto)
            )
        )
    })

    _router.put("/:id/pairs", keycloak.protect("realm:admin"), async (req: Request, res: Response) => {
        if (req.query['ids'] == null) throw createError(417, "ids param required")
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await operation_chain_facade.update_comissions(req.query['ids']!.toString().split(",").map(x=>ChainCompositeKey.parse(x)), Number(req.params['id']))
            )
        )
    })

    _router.get("/:id", async (req: Request, res: Response)=> {
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await comission_facade.get(Number(req.params['id']))
            )
        )
    })

    _router.delete("/:id", keycloak.protect("realm:admin"), async (req: Request, res: Response)=> {
        
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await comission_facade.remove(Number(req.params['id']))
            )
        )
    })

    _router.get("/", keycloak.protect("realm:admin"), async (req: Request, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await comission_facade.get_all(pagination_params)
            )
        )
    })
    return _router
};
