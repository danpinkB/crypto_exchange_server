import { ENV } from '@abstract/env';
import Decimal from 'decimal.js';
import Redis from 'ioredis';

export class PriceStorage {
  private storage_client: Redis;

  constructor(dsn: string) {
    this.storage_client = new Redis(dsn);
  }

  async get(key: string): Promise<Decimal | null> {
    const data = await this.storage_client.get(key);
    return data ? new Decimal(data) : null;
  }

  async get_all(keys: string[]): Promise<(Decimal | null)[]> {
    return (await this.storage_client.mget(keys)).map(x=>x?new Decimal(x):null)
  }
}

export function price_storage(){
  return new PriceStorage(ENV.get("KV_STORAGE__DSN"))
}