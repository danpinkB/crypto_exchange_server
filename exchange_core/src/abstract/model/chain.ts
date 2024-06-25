export enum ChainType {
    ETH = 5,
    TRON = 79,
    BSC = 56,
    OPTIMISM = 10,
    POLYGON = 80001,
    ARBITRUM = 42161
}

export class ChainCompositeKey{
    source_id: number
    destination_id: number
    
    constructor(source_id: number, destination_id: number){
        this.source_id = source_id
        this.destination_id = destination_id
    }

    static parse(id: string): ChainCompositeKey{
        let [source_id, destination_id] = id.split("_")
        if (!source_id || !destination_id) throw createError(417, "invalid combined id format")
        return new ChainCompositeKey(
            Number(source_id),
            Number(destination_id)
        )
    }

    flip(): ChainCompositeKey {
        return new ChainCompositeKey(
            this.destination_id,
            this.source_id
        )
    }
    
    build(): string {
        return `${this.source_id}_${this.destination_id}`
    } 
}

function createError(arg0: number, arg1: string) {
    throw new Error("Function not implemented.")
}
