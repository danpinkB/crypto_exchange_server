import asyncio
import functools
from decimal import Decimal

from abstract.const import INSTRUMENTS, BinanceTokens
from binance_stream_event_handler.binance_stream_event_handler import event_handler, BinanceInstrumentPriceMessage
from kv_storage.kv_storage import kv_storage, KVStorage
from pln_price_observer.pln_price_observer import PLNPriceObserver, pln_price_observer

SYMBOL_INSTRUMENT = {
    instrument.cex.base.symbol+instrument.cex.quote.symbol for instrument in INSTRUMENTS.values()
}


async def simple_handler(msg: BinanceInstrumentPriceMessage, storage: KVStorage) -> None:
    await storage.set(msg.instrument.base.symbol + msg.instrument.quote.symbol, msg.ask)
    await storage.set(msg.instrument.quote.symbol + msg.instrument.base.symbol, msg.bid)


async def usd_handler(msg: BinanceInstrumentPriceMessage, storage: KVStorage) -> None:
    if msg.instrument.quote == BinanceTokens.USDT.value:
        await storage.set(msg.instrument.base.symbol + "USD", msg.ask)
        await storage.set("USD" + msg.instrument.base.symbol, msg.bid)


async def usdt_pln_handler(msg: BinanceInstrumentPriceMessage, storage: KVStorage, price_observer: PLNPriceObserver) -> None:
    if msg.instrument.quote == BinanceTokens.USDT.value:
        pln_price = price_observer.get_usd_price()
        if pln_price:
            await storage.set(msg.instrument.base.symbol + "PLN", msg.ask / pln_price.ask)
            await storage.set("PLN" + msg.instrument.base.symbol, msg.bid / pln_price.bid)
            await storage.set("USDPLN", pln_price.bid)
            await storage.set("PLNUSD", pln_price.ask)


async def main():
    storage = kv_storage()
    
    await storage.set("USDTUSD", Decimal(1))
    await storage.set("USDUSDT", Decimal(1))

    price_observer = pln_price_observer()
    await event_handler([
        functools.partial(simple_handler, storage=storage),
        functools.partial(usd_handler, storage=storage),
        functools.partial(usdt_pln_handler, storage=storage, price_observer=price_observer)
    ]).listen(SYMBOL_INSTRUMENT)


if __name__ == "__main__":
    from abstract.logger_wrapper import wrap_logger

    wrap_logger()
    asyncio.run(main())
