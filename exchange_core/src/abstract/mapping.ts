export interface IMapFrom<T, R>{
    from(entity: T): R
}

export interface IMapTo<T, R>{
    to(data: R) : T
}

export interface IMap<T, R> extends IMapFrom<T,R>, IMapTo<T,R> { }
