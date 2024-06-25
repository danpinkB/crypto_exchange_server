import { PaymentInstrumentQueryArgs } from "@abstract/model/payment_instrument";
import { OrderRequestDTO } from "@abstract/dto/order";
import { crypto_entity_mapper } from "@abstract/mapper/model/payment_instrument";
import { PaymentType } from "@prisma/client";
import { storage } from "@helper/storage";
import { ethers } from "ethers";
import { hasher } from "@helper/hash_provider";
import { ChainType } from "@abstract/model/chain";
import { TronWeb } from "tronweb";

const db = storage()

export const get_public_address = (phrase: string, chain: Number) => {
    switch (chain) {
        case ChainType.TRON:{
            return TronWeb.fromMnemonic(phrase).address
        }
        default:{
            return ethers.Wallet.fromPhrase(phrase).address
        }
    }
}

const recepient_address_from_source_factory_method = {
    [PaymentType.crypto]: async (instrument: PaymentInstrumentQueryArgs, order: OrderRequestDTO):Promise<[number|null, string]> => {
        let crypto_chain = crypto_entity_mapper.to(instrument).chain
        let busy_chain_wallets = await db.walletOrder.findMany({
            where:{chain: crypto_chain},
            select:{wallet_id: true}
        })

        let wallet = await db.wallet.findFirst({
            where:{id:{notIn:busy_chain_wallets.map(x=>x.wallet_id)}}
        })

        if (!wallet)
            wallet = await db.wallet.create({
                data:{
                    phrase: hasher.encode(ethers.Wallet.createRandom().mnemonic!.phrase)
                }
            })
        return [wallet.id, get_public_address(hasher.decode(wallet.phrase), crypto_chain)]
    },
    [PaymentType.fiat]: async (instrument: PaymentInstrumentQueryArgs, order: OrderRequestDTO):Promise<[number|null, string]> => {
        return [null, "operator"]
    },
    [PaymentType.card]: async (instrument: PaymentInstrumentQueryArgs, order: OrderRequestDTO):Promise<[number|null, string]> => {
        return [null,"our card should be here"]
    }
}



export {recepient_address_from_source_factory_method}