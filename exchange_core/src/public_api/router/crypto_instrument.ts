import express, { Request,Response, Router } from'express'
import {StatusCodes} from 'http-status-codes'
import {Keycloak} from 'keycloak-connect'
import multer from 'multer'
import {CryptoInstrumentDTO} from '@abstract/dto/payment_instrument'
import {storage, file_uploader} from '@helper/index'
import { HttpResponse } from '@abstract/common'
import { plainToClass} from 'class-transformer';
import { make_crypto_currency_facade } from '@facade/payment_instrument'
import { PaginationParams } from '@abstract/pagination'


export function make_crypto_currency_router(keycloak: Keycloak): Router {
    let uploads = multer({})
    let _router = express.Router();
    let crypto_instrument_facade = make_crypto_currency_facade(storage())
    let file_uploader_service = file_uploader()
    
    _router.post("/", keycloak.protect("realm:admin"), uploads.single('icon'), async (req: Request, res: Response)=> {
        let dto:CryptoInstrumentDTO = await plainToClass(CryptoInstrumentDTO, req.body).validate()
        if (req.file) dto.icon = await file_uploader_service.upload_image(req.file)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await crypto_instrument_facade.create(dto)
            )
        )
    })

    _router.put("/:id", keycloak.protect("realm:admin"), uploads.single('icon'), async (req: Request, res: Response)=> {
        let dto:CryptoInstrumentDTO = await plainToClass(CryptoInstrumentDTO, req.body).validate()
        if (req.file)dto.icon = await file_uploader_service.upload_image(req.file)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await crypto_instrument_facade.update(Number(req.params['id']), dto)
            )
        )
    })
    
    _router.delete("/:id", keycloak.protect("realm:admin"), async (req: Request, res: Response)=> {
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await crypto_instrument_facade.remove(Number(req.params['id']))
            )
        )
    })
    
    
    _router.get("/", keycloak.protect("realm:admin"), async (req: Request, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await crypto_instrument_facade.get_all(pagination_params)
            )
        )
    })

    
    _router.get("/:id", async (req: Request, res: Response)=> {
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await crypto_instrument_facade.get(Number(req.params['id']))
            )
        )
    })
    

    return _router
};
