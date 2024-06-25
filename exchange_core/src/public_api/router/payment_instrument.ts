import express, { Request,Response, Router } from'express'
import {StatusCodes} from 'http-status-codes'
import {Keycloak} from 'keycloak-connect'
import { HttpResponse } from '@abstract/common'
import { storage } from '@helper/storage'
import { PaymentType } from '@prisma/client'
import { make_payment_instrument_facade } from '@facade/payment_instrument'

export function make_payment_instrument_router(keycloak: Keycloak): Router {

    let payment_instrument_facade = make_payment_instrument_facade(storage())
    let _router = express.Router();
    
    _router.get("/", async (req: Request, res: Response)=> {
        let require_dest = Boolean(req.query['require_dest'])
        
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                require_dest?
                await payment_instrument_facade.get_all_with_destinations([PaymentType.crypto, PaymentType.card, PaymentType.fiat])
                :
                await payment_instrument_facade.get_all([PaymentType.crypto, PaymentType.card, PaymentType.fiat])
            )
        )
    })


    return _router
};
