import { FiatInstrument } from "@abstract/model/entity";
import { PaymentInstrumentQueryArgs } from "@abstract/model/payment_instrument";
import { PaymentType } from "@prisma/client";
import { IMap } from "@abstract/mapping";

export const fiat_entity_mapper: IMap<FiatInstrument, PaymentInstrumentQueryArgs> = {
    from: function (entity: FiatInstrument): PaymentInstrumentQueryArgs {
        return {
            id: entity.id,
            type: PaymentType.fiat,
            icon: entity.icon,
            symbol: entity.symbol,
            name: entity.name,
            mappings:[],
            precision:  entity.precision,
        }
    }, 
    to: function (data: PaymentInstrumentQueryArgs): FiatInstrument {
        return {
            id:         data.id,
            type:       PaymentType.fiat,
            name:       data.name,
            icon:       data.icon || "",
            symbol:     data.symbol,
            precision:  data.precision,
        }
    }
}