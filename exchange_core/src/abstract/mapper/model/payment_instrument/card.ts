import { CardInstrument, FiatInstrument } from "@abstract/model/entity";
import { PaymentInstrumentQueryArgs } from "@abstract/model/payment_instrument";
import { PaymentType } from "@prisma/client";
import { IMap } from "@abstract/mapping";

export const card_entity_mapper: IMap<CardInstrument, PaymentInstrumentQueryArgs> = {
    from: function (entity: CardInstrument): PaymentInstrumentQueryArgs {
        return {
            id: entity.id,
            type: PaymentType.card,
            icon: entity.icon,
            symbol: entity.symbol,
            name: entity.name,
            precision:  entity.precision,
            mappings:[]
        }
    }, 
    to: function (data: PaymentInstrumentQueryArgs): CardInstrument {
        return {
            id:         data.id,
            type:       PaymentType.card,
            name:       data.name,
            icon:       data.icon || "",
            symbol:     data.symbol,
            precision:  data.precision,
        }
    }
}