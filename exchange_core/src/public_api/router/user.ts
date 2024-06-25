import express, { Response, Router } from'express'
import {StatusCodes} from 'http-status-codes'
import {Keycloak} from 'keycloak-connect'
import { HttpResponse } from '@abstract/common'
import { storage } from '@helper/storage'
import createHttpError from 'http-errors'
import { PaginationParams } from '@abstract/pagination'
import multer from 'multer'
import { file_uploader } from '@helper/file_uploader'
import KcAdminClient from 'keycloak-admin';
import { make_order_facade } from '@facade/order'
import { make_user_facade } from '@facade/user'
import { TARGET_REALM } from '@facade/env'


export function make_user_router(keycloak: Keycloak, keycloak_client: KcAdminClient): Router {
    let uploads = multer({})
    let order_service = make_order_facade(storage())
    let user_service = make_user_facade(keycloak_client)
    let file_uploader_service = file_uploader()
    let _router = express.Router();

    _router.get("/", keycloak.protect('realm:admin'), async (req: any, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await user_service.get_all(pagination_params)
            )
        )
    })

    _router.get("/:uuid", keycloak.protect('realm:admin'), async (req: any, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        let user_id = req.params["uuid"] || ""
        let user = await user_service.get(req.kauth.grant.access_token.content.sub)
        if (!user) throw createHttpError(417, "user not found")
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                {
                    orders: await order_service.get_user_orders(user_id, pagination_params,true),
                    completed_orders: await order_service.get_user_completed_orders(user_id, pagination_params, true),
                    documents:  await file_uploader_service.get_images_by_path(`documents/${user_id}/`),
                    ...user, 
                }
            )
        )
    })

    _router.get("/:uuid/verification", keycloak.protect('realm:admin'), async (req: any, res: Response)=> {
        let user = await keycloak_client.users.findOne({id: req.params["uuid"]||"", realm: TARGET_REALM})
        if (!user) throw createHttpError(404, "user not found")
        let documents = await file_uploader_service.get_images_by_path(`documents/${user.id!}/`)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                documents
            )
        )
    })

    _router.get("/:uuid/order", keycloak.protect('realm:admin'), async (req: any, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        let user = await keycloak_client.users.findOne({id: req.params["uuid"]||"", realm: TARGET_REALM})
        if (!user) throw createHttpError(404, "user not found")
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await order_service.get_user_orders(user.id!, pagination_params, true)
            )
        )
    })

    _router.get("/:uuid/order/completed", keycloak.protect('realm:admin'), async (req: any, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        let user = await keycloak_client.users.findOne({id: req.params["uuid"]||"", realm: TARGET_REALM})
        if (!user) throw createHttpError(404, "user not found")
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await order_service.get_user_completed_orders(user.id!, pagination_params, true)
            )
        )
    })

    return _router
};
