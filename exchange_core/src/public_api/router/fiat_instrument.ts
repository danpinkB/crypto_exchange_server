import express, { Request,Response, Router } from'express'
import {StatusCodes} from 'http-status-codes'
import {Keycloak} from 'keycloak-connect'
import multer from 'multer'
import {FiatInstrumentDTO} from '@abstract/dto/payment_instrument'
import {file_uploader, storage} from '@helper/index'
import { HttpResponse } from '@abstract/common'
import { plainToClass} from 'class-transformer';
import { make_fiat_currency_facade } from '@facade/payment_instrument'
import { PaginationParams } from '@abstract/pagination'


export function make_fiat_currency_router(keycloak: Keycloak): Router {
    let uploads = multer({})
    let _router = express.Router();
    let fiat_currency_facade = make_fiat_currency_facade(storage())
    let file_uploader_service = file_uploader()

    _router.post("/", keycloak.protect("realm:admin"), uploads.single('icon'), async (req: Request, res: Response)=> {
        let dto:FiatInstrumentDTO = await plainToClass(FiatInstrumentDTO, req.body).validate()
        if (req.file) dto.icon = await file_uploader_service.upload_image(req.file)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await fiat_currency_facade.create(dto)
            )
        )
    })

    _router.put("/:id", keycloak.protect("realm:admin"), keycloak.protect("realm:admin"),uploads.single('icon'), async (req: Request, res: Response)=> {
        let instrument_id =  Number(req.params['id'])
        let dto:FiatInstrumentDTO = await plainToClass(FiatInstrumentDTO, req.body).validate()
        if (req.file)dto.icon = await file_uploader_service.upload_image(req.file)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                await fiat_currency_facade.update(instrument_id, dto)
            )
        )
    })
    
    _router.delete("/:id", keycloak.protect("realm:admin"), async (req: Request, res: Response)=> {
        let instrument_id =  Number(req.params['id'])
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success", 
                fiat_currency_facade.remove(instrument_id)
            )
        )
    })
    
    _router.get("/:id", async (req: Request, res: Response)=> {
        let instrument_id =  Number(req.params['id'])
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await fiat_currency_facade.get(instrument_id)
            )
        )
    })


    _router.get("/", async (req: Request, res: Response)=> {
        let pagination_params = PaginationParams.parse(req.query)
        return res.status(StatusCodes.OK).send(
            new HttpResponse(
                StatusCodes.OK,
                "success",
                await fiat_currency_facade.get_all(pagination_params)
            )
        )
    })

    return _router
};
