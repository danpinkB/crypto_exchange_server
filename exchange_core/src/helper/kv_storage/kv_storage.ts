import { ENV } from "@abstract/env";
import Redis from "ioredis";

export class KVStorage {
    protected kv_client: Redis;
  
    constructor(dsn: string) {
      this.kv_client = new Redis(dsn);
    }
  
    async get(key: string): Promise<string | null> {
      return await this.kv_client.get(key);
    }

    async exists(key: string): Promise<boolean>{
      return await this.kv_client.exists(key).then(value=>value===1)
    }

    async set(key: string, value: string): Promise<void>{
      await this.kv_client.set(key, value)
    }

    async set_all(map: Map<string, string>): Promise<void>{
      console.log(map);
      
      await this.kv_client.mset(map)
    }

    async remove(key:string): Promise<void>{
      await this.kv_client.del(key)
    }
    
    async remove_all(keys:string[]) : Promise<void>{
      await this.kv_client.del(keys)
    }

    async get_all(keys: string[]): Promise<(string | null)[]> {
      return await this.kv_client.mget(keys)
    }
}

export function execution_storage(){
  return new KVStorage(ENV.get("KV_STORAGE__DSN"))
}
