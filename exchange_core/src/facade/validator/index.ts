import { PaymentType } from "@prisma/client";
import {crypto_order_validator} from './crypto'
import {fiat_order_validator} from './fiat'

const payment_instrument_validator = {
    [PaymentType.crypto]: crypto_order_validator,
    [PaymentType.fiat]: fiat_order_validator,
    [PaymentType.card]: fiat_order_validator
}

export {payment_instrument_validator}

export * from './crypto'
export * from './fiat'