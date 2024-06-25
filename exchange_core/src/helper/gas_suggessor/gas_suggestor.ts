import { ETHBlock } from "@abstract/block";
import { OrderedStorage } from "../kv_storage/ordered_storage";

export class GasSuggestor{
    o_storage: OrderedStorage
    constructor(o_storage: OrderedStorage){
        this.o_storage = o_storage
    }

    async process_block(block: ETHBlock){
        await this.o_storage.push(
            block.transactions.reduce(
                (avarage, tx)=>avarage+parseInt(tx.gasPrice, 16), 1
            ) / block.transactions.length
        )
    }

    async get_avarage_gas_price(){
        return await this.o_storage.avarage()
    }
}