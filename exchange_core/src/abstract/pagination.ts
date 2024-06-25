export class PaginationResponseWrapper{
    items: any[]
    total: number
    constructor(total:number, items:any[]){
        this.items = items
        this.total = total
    }
}

export class PaginationResponseWrapperWithExtraInfo{
    items: any[]
    total: number
    total_amount!: string
    [key:string]: any
    constructor(total:number, items:any[]){
        this.items = items
        this.total = total
    }
}

export class PaginationParams{
    take: number
    skip: number
    require_total: boolean
    constructor(take: number, skip: number, require_total: boolean){
        this.take = take
        this.skip = skip
        this.require_total = require_total
    }

    static parse(source: any): PaginationParams{
        return new PaginationParams(
            Number(source['take']||10),
            Number(source['skip']||0),
            Boolean(source['require_total'])
        )
    }
}