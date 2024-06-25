import {crypto_dto_mapper} from './crypto'
import {card_dto_mapper} from './card'
import {fiat_dto_mapper} from './fiat'
import { PaymentType } from "@prisma/client"

const typed_payment_instrument_mapper_dto = {
    [PaymentType.crypto]: crypto_dto_mapper,
    [PaymentType.fiat]: fiat_dto_mapper,
    [PaymentType.card]: card_dto_mapper,
}

export {typed_payment_instrument_mapper_dto}

export * from './card'
export * from './crypto'
export * from './fiat'
