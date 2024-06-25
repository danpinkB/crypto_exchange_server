import { PaymentType } from '@prisma/client'
import { crypto_entity_mapper } from './crypto'
import { fiat_entity_mapper } from './fiat'
import { card_entity_mapper } from './card'
import { IMap } from "@abstract/mapping";


export const typed_payment_instrument_entity_mapper: {[type_: string]: IMap<any, any>}= {
    [PaymentType.crypto]: crypto_entity_mapper,
    [PaymentType.fiat]: fiat_entity_mapper,
    [PaymentType.card]: card_entity_mapper,
}

export * from './crypto'
export * from './fiat'
export * from './card'
