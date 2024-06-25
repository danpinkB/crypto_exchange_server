import datetime
from typing import Optional

from sqlalchemy import MetaData, Table, Column, String, select, insert, update, TIMESTAMP
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from abstract.types import WalletRaw
from wallet_storage.env import WALLET_STORAGE__DSN

metadata = MetaData()

WALLET_TABLE_SCHEMA = Table(
    'wallet', metadata,
    Column('address', String, primary_key=True),
    Column('private_key', String),
    Column('status', String),
    Column('updated_at', TIMESTAMP),
)


Base = declarative_base()


class Wallet(Base):
    __tablename__ = "wallet"

    address = Column(String, primary_key=True)
    private_key = Column(String)
    status = Column(String)
    updated_at = Column(TIMESTAMP)


class AsyncDataStorage:
    __slots__ = (
        "_engine",
        "_session_factory",
        "_session"
    )

    def __init__(self, storage_dsn: str):
        self._session: Optional[AsyncSession]
        self._engine: AsyncEngine = create_async_engine(storage_dsn)
        self._session_factory = async_sessionmaker(self._engine, autoflush=False, expire_on_commit=True)

    async def __aenter__(self) -> AsyncSession:
        self._session = self._session_factory()
        return self._session

    # @asy
    # async def session(self) -> AsyncSession:
    #     async with self._session_factory() as session:
    #         self._session = session
    #         yield session
    #         self._session = None

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if self._session:
            await self._session.commit()
            self._session = None

    async def execute_query(self, query, parameters=None):
        async with self._session_factory() as conn:
            result = await conn.execute(query, parameters)
            return result.fetchall()

    async def save(self, wallet: Wallet) -> Wallet:
        await self._session.execute(insert(Wallet).values(
                address=wallet.address,
                private_key=wallet.private_key,
                status=wallet.status,
                updated_at=wallet.updated_at
            )
        )
        return wallet

    async def get(self, address: str) -> Optional[Wallet]:
        addresses = await self._session.execute(select(Wallet).where(Wallet.address == address))
        return addresses.fetchone()

    async def update(self, address: str, new_address: str, new_private: str, status: str) -> Optional[WalletRaw]:
        result = await self._session.execute(
            update(WALLET_TABLE_SCHEMA)
            .where(address=address)
            .values(
                address=new_address,
                private_key=new_private,
                status=status,
                updated_at=datetime.datetime.now(datetime.timezone.utc).timestamp()
            )
        )
        fetched = await result.fetchone()
        return WalletRaw.from_raw(fetched) if fetched else None

    async def update_status(self, entity: WalletRaw) -> Optional[Wallet]:
        result = await self._session.execute(
            update(WALLET_TABLE_SCHEMA)
            .where(address=entity.address)
            .values(
                status=entity.status,
                updated_at=datetime.datetime.now(datetime.timezone.utc).timestamp()
            )
        )
        return result.fetchone()

    async def get_free_wallet(self) -> Optional[Wallet]:
        result = await self._session.execute(
            select(Wallet).where(Wallet.status == "free")
        )
        return result.fetchone()

    async def get_busy_wallet(self) -> Optional[Wallet]:
        result = await self._session.execute(
            select(Wallet).where(Wallet.status == "busy")
        )
        return result.fetchone()


def wallet_storage() -> AsyncDataStorage:
    return AsyncDataStorage(WALLET_STORAGE__DSN)
