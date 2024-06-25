import { Comission, OperationMethodChain } from "@prisma/client"
import { PaymentInstrumentQueryArgs } from "./payment_instrument"

export type OperationChainQueryArgs = OperationMethodChain & {
    comission: Comission, 
    source: PaymentInstrumentQueryArgs, 
    destination: PaymentInstrumentQueryArgs
}