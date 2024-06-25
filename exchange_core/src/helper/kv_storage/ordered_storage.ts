import { ENV } from "@abstract/env";
import { KVStorage } from "./kv_storage";
import { ChainType } from "@abstract/model/chain";

export class OrderedStorage extends KVStorage{
  length: number
  prefix: string;

  constructor (dsn: string, prefix:string="", length:number=10) {
    //   this.kv_client = new Redis(dsn);
    super(dsn);
    this.prefix = "ORDERED_QUQUE_"+prefix
    this.length = length || 10
  }

  async push(val: number){
    await this.kv_client.lpush(this.prefix, val).then(
      async() => await this.kv_client.ltrim(this.prefix, 0, this.length-1)
    )
  }

  async list(){
    return await this.kv_client.lrange(this.prefix, 0, -1).then(range=>(range.map(x=>parseFloat(x))))
  }

  async avarage(){
    return await this.list().then(range=>BigInt(Math.trunc(range.reduce((avarage, val)=>avarage+val,0)/range.length)))
  }
}

export function ordered_storage(chain: ChainType, ){
  return new OrderedStorage(ENV.get("ORDERED_STORAGE__DSN"), chain.toString(), 10)
}