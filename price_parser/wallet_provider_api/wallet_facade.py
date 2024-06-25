import datetime
import logging
from typing import Tuple

from cryptography.fernet import Fernet
from eth_account.signers.local import LocalAccount
from eth_typing import ChecksumAddress

from abstract.chain import Chains, CHAINS_CONFIGS
from abstract.env import ENV
from abstract.types import WalletRaw
from wallet_storage.wallet_storage import wallet_storage, Wallet
from web3 import Web3


class WalletFacade:
    def __init__(self):
        self._hasher = Fernet(ENV["HASH_SECRET"])
        self._wallet_storage = wallet_storage()

    async def get_free_wallet(self) -> WalletRaw | None:
        return await self._wallet_storage.get_free_wallet()

    async def create_wallet(self, chain: Chains, token: str) -> str:

        async with self._wallet_storage:
            wallet = await self._wallet_storage.get_free_wallet()
            if not wallet:
                account: LocalAccount =
                wallet = await self._wallet_storage.save(Wallet(
                    address=self._hasher.encrypt(bytes(account.address, "utf-8")).decode(),
                    private_key=self._hasher.encrypt(account.key).decode(),
                    updated_at=datetime.datetime.utcnow(),
                    status="busy"
                ))

            return self._hasher.decrypt(wallet.address).decode()


def wallet_facade() -> WalletFacade:
    return WalletFacade()
