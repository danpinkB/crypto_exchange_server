import asyncio
import logging
import os
from http.client import HTTPException
from typing import Optional, Dict, Final

import uvicorn
from cryptography.fernet import Fernet
from fastapi import FastAPI, Depends, Security, Query
from fastapi.security import OAuth2AuthorizationCodeBearer

from abstract.chain import Chains
from abstract.env import ENV
from keycloak_provider.keycloak_provider import keycloak_provider
from keycloak_provider.env import AUTH_SERVER_URL, TARGET_REALM
from kv_storage.kv_storage import kv_storage
from wallet_provider_api.custom_oauth_provider import CustomOAuth2AuthorizationCodeBearer
from wallet_provider_api.env import WALLET_PROVIDER_PORT
from wallet_facade import wallet_facade


oauth2_scheme = CustomOAuth2AuthorizationCodeBearer(
    authorizationUrl=f"{AUTH_SERVER_URL}realms/{TARGET_REALM}/protocol/openid-connect/auth",
    tokenUrl=f"{AUTH_SERVER_URL}realms/{TARGET_REALM}/protocol/openid-connect/token",
)
wallet_facade_ins: Final = wallet_facade()
auth_provider: Final = keycloak_provider()
app = FastAPI()


async def get_current_user(token: str = Security(oauth2_scheme)) -> Dict:
    try:
        return auth_provider.decode_token(token)
    except Exception as e:
        logging.error(e)
        raise HTTPException()


@app.get("/wallet")
async def get_wallet(chain: Chains = Query(), token: str = Depends(oauth2_scheme)):
    logging.info(token)
    return await wallet_facade_ins.create_wallet(chain, token)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(WALLET_PROVIDER_PORT))
