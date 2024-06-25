import abc
from datetime import datetime
from typing import Dict, NamedTuple, Any, Mapping


class MessageHandler(abc.ABC):
    @abc.abstractmethod
    async def handle(self, msg: Dict) -> None:
        pass


class Wallet(NamedTuple):
    address: str
    private_key: str


class WalletRaw(NamedTuple):
    address: str
    private_key: str
    status: str
    updated_at: datetime

    @staticmethod
    def from_raw(data: Dict[str, Any]) -> "WalletRaw":
        return WalletRaw(
            address=data['address'],
            private_key=data['private_key'],
            status=data['status'],
            updated_at=data['updated_at']
        )

    def to_raw(self) -> Mapping:
        return {
            "address": self.address,
            "private_key": self.private_key,
            "status": self.status,
            "updated_at": self.updated_at
        }
