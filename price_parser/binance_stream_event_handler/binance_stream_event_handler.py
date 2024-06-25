import asyncio
import logging
import traceback
from decimal import Decimal
from typing import List, Dict, Callable, NamedTuple, Set

from aio_binance.futures.usdt import WsClient

from abstract.const import INSTRUMENTS
from abstract.instrument import CEXExchangeInstrumentParams

SYMBOL_INSTRUMENT = {
    instrument.cex.base.symbol+instrument.cex.quote.symbol: instrument.cex for instrument in INSTRUMENTS.values()
}


class BinanceInstrumentPriceMessage(NamedTuple):
    instrument: CEXExchangeInstrumentParams
    ask: Decimal
    bid: Decimal


T = List[Callable[[BinanceInstrumentPriceMessage], None]]


class StreamEventHandler:
    def __init__(self, message_handlers: T) -> None:
        self._message_handlers = message_handlers

    async def handle_socket_message(self, msg: Dict) -> None:
        data = msg.get("data")
        if data is None:
            traceback.print_stack()
            logging.info(f"{msg}")
            return
        instrument = SYMBOL_INSTRUMENT.get(data['s'])
        if instrument:
            parsed_message = BinanceInstrumentPriceMessage(
                instrument=instrument,
                bid=Decimal(1)/Decimal(data['b']),
                ask=Decimal(data['a'])
            )
            await asyncio.gather(*[handler(parsed_message) for handler in self._message_handlers])
        # await self._storage.set_price(data['s'], data['b'])
        # await self._storage.set_price(data['s'][:-1], data['b'])

    async def listen(self, instruments: Set[str]) -> None:
        ws = WsClient()
        ws.stream_book_ticker().close()
        streams = [ws.stream_book_ticker(instrument_symbol) for instrument_symbol in instruments]
        res = await asyncio.gather(*streams)
        await ws.subscription_streams(res, self.handle_socket_message)


def event_handler(message_handlers: T) -> StreamEventHandler:
    return StreamEventHandler(message_handlers)
