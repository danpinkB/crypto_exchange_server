from enum import unique, Enum
from typing import NamedTuple, Final

from abstract.env import ENV


@unique
class Chains(int, Enum):
    ETH = 5
    TRON = 79
    BSC = 97
    FANTOM = 4002
    AVALANCE = 43113
    POLYGON = 80001


CHAINS_CONFIGS: Final = {
    Chains.ETH: ENV['ETH_CHAIN_PROVIDER__DSN'],
    Chains.TRON: ENV['TRON_CHAIN_PROVIDER__DSN'],
    # Chains.BSC: ENV['BSC_CHAIN_PROVIDER__DSN'],
    # Chains.FANTOM: ENV['FANTOM_CHAIN_PROVIDER__DSN'],
    # Chains.AVALANCE: ENV['AVALANCE_CHAIN_PROVIDER__DSN'],
    Chains.POLYGON: ENV['POLYGON_CHAIN_PROVIDER__DSN'],
}
