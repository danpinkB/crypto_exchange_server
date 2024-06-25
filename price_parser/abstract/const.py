from enum import Enum
from types import MappingProxyType

from abstract.exchange import ExchangeKind, Exchange, ExchangeParams
from abstract.instrument import Instrument, CEXExchangeInstrumentParams, ExchangeInstrumentParams, ExchangeInstrument
from abstract.token import CEXToken

EXCHANGES = {
    Exchange.BINANCE: ExchangeParams(
        kind=ExchangeKind.CEX,
        icon='🔶',
        name="BIN"
    )
}

NON_REQUIRED_CHECK_TOKENS = ["1INCH"]


class BinanceTokens(Enum):
    ETH = CEXToken(symbol="ETH")
    ARB = CEXToken(symbol="ARB")
    BTC = CEXToken(symbol="BTC")
    SOL = CEXToken(symbol="SOL")
    TON = CEXToken(symbol="TON")
    SUSHI = CEXToken(symbol="SUSHI")
    TRX = CEXToken(symbol="TRX")
    XRP = CEXToken(symbol="XRP")
    UNI = CEXToken(symbol="UNI")
    INCH = CEXToken(symbol="1INCH")
    USDT = CEXToken(symbol="USDT")


BINANCE_STABLES = ("USDT")

for e in BinanceTokens:
    if e.value.symbol not in NON_REQUIRED_CHECK_TOKENS:
        assert e.name == e.value.symbol

INSTRUMENTS = MappingProxyType({
    ExchangeInstrument(Exchange.BINANCE, Instrument.ETH__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.ETH.value, BinanceTokens.USDT.value)),
    ExchangeInstrument(Exchange.BINANCE, Instrument.ARB__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.ARB.value, BinanceTokens.USDT.value)),
    ExchangeInstrument(Exchange.BINANCE, Instrument.BTC__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.BTC.value, BinanceTokens.USDT.value)),
    ExchangeInstrument(Exchange.BINANCE, Instrument.SOL__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.SOL.value, BinanceTokens.USDT.value)),
    # ExchangeInstrument(Exchange.BINANCE, Instrument.TON__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.TON.value, BinanceTokens.USDT.value)),
    ExchangeInstrument(Exchange.BINANCE, Instrument.TRX__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.TRX.value, BinanceTokens.USDT.value)),
    ExchangeInstrument(Exchange.BINANCE, Instrument.XRP__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.XRP.value, BinanceTokens.USDT.value)),
    ExchangeInstrument(Exchange.BINANCE, Instrument.UNI__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.UNI.value, BinanceTokens.USDT.value)),
    ExchangeInstrument(Exchange.BINANCE, Instrument.INCH__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.INCH.value, BinanceTokens.USDT.value)),
    ExchangeInstrument(Exchange.BINANCE, Instrument.SUSHI__USDT): ExchangeInstrumentParams(cex=CEXExchangeInstrumentParams(BinanceTokens.SUSHI.value, BinanceTokens.USDT.value)),
})

