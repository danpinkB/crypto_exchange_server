import { IMap } from "@abstract/mapping";
import { CryptoInstrumentDTO } from "@abstract/dto/payment_instrument"
import { CryptoInstrument } from "@abstract/model/entity"
import { PaymentType } from "@prisma/client"

export const crypto_dto_mapper: IMap<CryptoInstrument, CryptoInstrumentDTO> = {
    from: (entity: CryptoInstrument)=>Object.assign(new CryptoInstrumentDTO(), entity),
    to: (data: CryptoInstrumentDTO) => {
        return {
            address: data.address,
            chain: data.chain,
            decimals: data.decimals,
            icon: data.icon,
            id: data.id,
            name: data.name,
            symbol: data.symbol,
            type: data.type,
            precision: data.precision
        } as CryptoInstrument
    }
}