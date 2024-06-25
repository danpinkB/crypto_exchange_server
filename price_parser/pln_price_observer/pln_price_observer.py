import logging
import time
from decimal import Decimal
from typing import Optional, Any, Dict

import requests
from abstract.instrument import InstrumentPrice
from pln_price_observer.const import NBP_PL_URI


class PLNPriceObserver:
    __slots__ = ("_last_checked_time", "_last_price", "_headers")

    def __init__(self, headers: Optional[Dict[str, str]] = None) -> None:
        headers = dict((k.strip().lower(), v) for k, v in (headers or dict()).items())
        if 'user-agent' not in headers:
            headers['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0'
            # headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
            # headers['Accept-Encoding'] = 'gzip, deflate, br'
            # headers['Accept-Language'] = 'en,en-US;q=0.9,ru;q=0.8'
            # headers['Cache-Control'] = 'max-age=0'
            # headers['Connection'] = 'keep-alive'
            # headers['Cookie'] = 'ee3la5eizeiY4Eix=jei1Xah3; _ga=GA1.1.2037895545.1705000406; _ga_36F93VBHPB=GS1.1.1705000406.1.1.1705002213.0.0.0'
            # headers['Host'] = 'api.nbp.pl'
            # headers['If-None-Match'] = '"ywJDlmDHYKrPWuN7QAmqPTXo+r/M/DOLpdz8b+cM7OA="'
            # headers['Sec-Fetch-Dest'] = 'document'
            # headers['Sec-Fetch-Mode'] = 'navigate'
            # headers['Sec-Fetch-Site'] = 'none'
            # headers['Sec-Fetch-User'] = '?1'
            # headers['Upgrade-Insecure-Requests'] = '1'
            # headers['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
            # headers['sec-ch-ua'] = '"Chromium";v="116", "Not)A;Brand";v="24", "Google Chrome";v="116"'
            # headers['sec-ch-ua-mobile'] = '?0'
            # headers['sec-ch-ua-platform'] = '"Linux"'
        self._headers = headers
        self._last_checked_time: Optional[float] = None
        self._last_price: Optional[InstrumentPrice] = None

    def _parse_price(self, data: Dict[str, Any]) -> InstrumentPrice:
        price_rate = data.get("rates")
        if price_rate and len(price_rate) > 0:
            return InstrumentPrice(
                ask=Decimal(price_rate[0]["ask"]),
                bid=Decimal(price_rate[0]["bid"])
            )

    def get_usd_price(self) -> Optional[InstrumentPrice]:
        current = time.time()
        if not self._last_checked_time or current - self._last_checked_time > 60*60:
            res = requests.get(f'{NBP_PL_URI}/api/exchangerates/rates/c/usd/today', headers=self._headers)
            if 400 > res.status_code > 199:
                print(res)
                self._last_price = self._parse_price(res.json())
            else:
                logging.error(f"ERROR while trying to get USD PLN price {res.status_code} {res.text} URL {f'{NBP_PL_URI}/api/exchangerates/rates/c/usd/today'}")
            self._last_checked_time = current

        return self._last_price


def pln_price_observer() -> PLNPriceObserver:
    return PLNPriceObserver()
