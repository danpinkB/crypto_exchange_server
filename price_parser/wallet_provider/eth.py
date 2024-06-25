from eth_account.signers.local import LocalAccount
from web3 import Web3
from tronpy import Tron
from tronpy.providers import HTTPProvider
from abstract.chain import CHAINS_CONFIGS, Chains
from abstract.types import Wallet


def create_eth_wallet() -> Wallet:
    web3_provider = Web3(Web3.HTTPProvider(CHAINS_CONFIGS[Chains.ETH]))
    wallet: LocalAccount = web3_provider.eth.account.create()
    return Wallet(
        address=wallet.address,
        private_key=wallet.key
    )


def create_tron_wallet():
    client = Tron(HTTPProvider(CHAINS_CONFIGS[Chains.TRON]))
    account = client.generate_address()
    return Wallet(
        address=account.get("public_key"),
        private_key=account.get("private_key")
    )
