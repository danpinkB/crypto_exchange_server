import { CryptoInstrument } from "@abstract/model/entity";
import { PaymentInstrumentQueryArgs } from "@abstract/model/payment_instrument";
import { Decimal } from 'decimal.js';
import { IMap } from "@abstract/mapping";

export const crypto_entity_mapper: IMap<CryptoInstrument, PaymentInstrumentQueryArgs> = {
    from: function (entity: CryptoInstrument): PaymentInstrumentQueryArgs {
        return {
            id: entity.id,
            type: entity.type,
            icon: entity.icon,
            symbol: entity.symbol,
            name: entity.name,
            precision: entity.precision,
            mappings:[
                {instrument_id: entity.id, label: "address", value: entity.address},
                {instrument_id: entity.id, label: "chain", value: entity.chain.toString()},
                {instrument_id: entity.id, label: "decimals", value: entity.decimals.toString()}
            ]
        }
    }, 
    to: function (data: PaymentInstrumentQueryArgs): CryptoInstrument {
        let mapping = new Map<string, any>()
        for(let p_mapping of data.mappings) mapping.set(p_mapping.label, p_mapping.value)

        return {
            id:         data.id,
            type:       data.type,
            name:       data.name,
            icon:       data.icon || "",
            symbol:     data.symbol,
            precision:  data.precision,
            address:    mapping.get("address"),
            chain:      Number(mapping.get("chain")),
            decimals:   new Decimal(mapping.get("decimals"))
        }
    }
}