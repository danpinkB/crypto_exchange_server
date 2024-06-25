from decimal import Decimal
from enum import unique, Enum
from typing import Set, NamedTuple, Optional

from abstract.exchange import Exchange
from abstract.token import CEXToken


@unique
class Instrument(Enum):
    ETH__USDT = 1
    ARB__USDT = 2
    BTC__USDT = 3
    XRP__USDT = 4
    SOL__USDT = 5
    TON__USDT = 6
    TRX__USDT = 7
    UNI__USDT = 8
    SUSHI__USDT = 9
    INCH__USDT = 10


class CEXExchangeInstrumentParams(NamedTuple):
    base: CEXToken
    quote: CEXToken


class ExchangeInstrumentParams(NamedTuple):
    cex: Optional[CEXExchangeInstrumentParams] = None


class ExchangeInstrument(NamedTuple):
    exchange: Exchange
    instrument: Instrument


class InstrumentPrice(NamedTuple):
    bid: Decimal
    ask: Decimal

