import logging
from typing import Dict, Optional

from keycloak import KeycloakOpenID
from keycloak_provider.env import AUTH_SERVER_URL, AUTH_CLIENT_ID, TARGET_REALM, AUTH_PUBLIC_KEY


class KeycloakProvider:
    def __init__(self):
        self._open_id = KeycloakOpenID(
            server_url=AUTH_SERVER_URL,
            client_id=AUTH_CLIENT_ID,
            realm_name=TARGET_REALM,
        )
        self._public = (
            "-----BEGIN PUBLIC KEY-----\n"
            f"{AUTH_PUBLIC_KEY}"
            "\n-----END PUBLIC KEY-----"
        )

    def decode_token(self, token: str) -> Optional[Dict]:
        try:
            return self._open_id.decode_token(
                token,
                key=self._public,
                options={
                    "verify_signature": True,
                    "verify_aud": True,
                    "exp": True
                }
            )
        except Exception as e:
            logging.error(e)
            return None


def keycloak_provider() -> KeycloakProvider:
    return KeycloakProvider()