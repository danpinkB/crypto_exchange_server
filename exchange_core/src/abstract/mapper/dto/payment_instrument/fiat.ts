import { IMap } from "@abstract/mapping";
import { FiatInstrumentDTO } from "@abstract/dto/payment_instrument";
import { FiatInstrument } from "@abstract/model/entity";

export const fiat_dto_mapper: IMap<FiatInstrument, FiatInstrumentDTO> = {
    from: (entity: FiatInstrument) => Object.assign(new FiatInstrumentDTO(), entity),
    to: (data: FiatInstrumentDTO) => {
        return {
            icon: data.icon,
            id: data.id,
            name: data.name,
            symbol: data.symbol,
            type: data.type,
            precision: data.precision
        } as FiatInstrument
    }
}