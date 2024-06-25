import express, { Response, Router } from'express'
import {StatusCodes} from 'http-status-codes'
import {Keycloak} from 'keycloak-connect'
import { HttpResponse } from '@abstract/common'
import { storage } from '@helper/storage'
import createHttpError from 'http-errors'
import multer from 'multer'
import { plainToClass } from 'class-transformer'
import { UserVerificationRequestDto } from '@abstract/dto/user'
import KcAdminClient from 'keycloak-admin';
import { make_order_facade } from '@facade/order'
import { make_user_facade } from '@facade/user'
import { file_uploader } from '@helper/file_uploader'
import { UserVerificationStatus } from '@abstract/model/user'
import { PaginationParams } from '@abstract/pagination'

const PROCEESSABLE_STATUSES = [UserVerificationStatus.UNVERIFIED, UserVerificationStatus.VERIFICATION_FAILED]

export function make_account_router(keycloak: Keycloak, keycloak_client: KcAdminClient): Router {
    let uploads = multer({})
    let order_service = make_order_facade(storage())
    let _router = express.Router();
    let user_facade = make_user_facade(keycloak_client)
    let file_uploader_service = file_uploader() 

    _router.get("/info", keycloak.protect('realm:user'), async (req: any, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        let user_id = req.kauth.grant.access_token.content.sub
        let user = await user_facade.get(req.kauth.grant.access_token.content.sub)

        if (!user) throw createHttpError(417, "user not found")
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                {
                    orders: await order_service.get_user_orders(
                        user_id,
                        pagination_params
                    ),
                    completed_orders: await order_service.get_user_completed_orders(
                        user_id,
                        pagination_params
                    ),
                    documents:  await file_uploader_service.get_images_by_path(`documents/${user_id}/`),
                    ...user, 
                }
            )
        )
    })

    _router.get("/order",keycloak.protect('realm:user'), async (req: any, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await order_service.get_user_orders(
                    req.kauth.grant.access_token.content.sub,
                    pagination_params
                )
            )
        )
    })

    _router.get("/order/completed",keycloak.protect('realm:user'), async (req: any, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await order_service.get_user_completed_orders(
                    req.kauth.grant.access_token.content.sub,
                    pagination_params
                )
            )
        )
    })

    _router.post("/verification", keycloak.protect('realm:user'), uploads.array('files'), async (req: any, res: Response)=> {
        let user_info = await user_facade.get(req.kauth.grant.access_token.content.sub)
        if (!user_info) throw createHttpError(404, "user not found")
        if (PROCEESSABLE_STATUSES.includes(user_info.verification_status)) throw createHttpError(417, "you can't start verification process")
        if (!req.files) createHttpError(417, "file expected")
        
        let verification_reuqest = await plainToClass(UserVerificationRequestDto, req.body).validate()
        
        
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await user_facade.process_verification_request(user_info.sub, verification_reuqest, req.files)
            )
        )
    })


    return _router
};
