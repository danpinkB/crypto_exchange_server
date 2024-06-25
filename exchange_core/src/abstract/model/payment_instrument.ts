import { PaymentInstrument, PaymentInstrumentMapping } from "@prisma/client"

export type PaymentInstrumentQueryArgs = PaymentInstrument & {
    mappings: PaymentInstrumentMapping[]
}

export type PaymentInstrumentQueryArgsWithDestinations = PaymentInstrumentQueryArgs & {
    source_operations?: {
        destination_id: number
    }[]
}