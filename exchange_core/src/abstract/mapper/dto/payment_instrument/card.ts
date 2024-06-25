import { IMap } from "@abstract/mapping";
import { CardInstrumentDTO } from "@abstract/dto/payment_instrument";
import { CardInstrument } from "@abstract/model/entity";

export const card_dto_mapper: IMap<CardInstrument, CardInstrumentDTO> = {
    from: (entity: CardInstrument) => Object.assign(new CardInstrumentDTO(), entity),
    to: (data: CardInstrumentDTO) => {
        return {
            icon: data.icon,
            id: data.id,
            name: data.name,
            symbol: data.symbol,
            type: data.type,
            precision: data.precision
        } as CardInstrument
    }
}   
