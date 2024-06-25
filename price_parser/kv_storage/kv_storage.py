from decimal import Decimal
from typing import Optional, Any

import redis

from kv_storage.env import KV_STORAGE__DSN


class KVStorage:
    def __init__(self, dsn: str):
        self._conn = redis.asyncio.from_url(dsn)

    async def set(self, key: str, value: Any) -> None:
        return await self._conn.set(key, str(value))

    async def get(self, key: str) -> Optional[Decimal]:
        price: str = await self._conn.get(key)
        return Decimal(price) if price else None


def kv_storage() -> KVStorage:
    return KVStorage(KV_STORAGE__DSN)
