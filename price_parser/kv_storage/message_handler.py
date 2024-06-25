import abc
from typing import Dict


class MessageHandler(metaclass=abc):
    @abc.abstractmethod
    async def handle(self, msg: Dict) -> None:
        pass
