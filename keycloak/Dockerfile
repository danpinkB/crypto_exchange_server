FROM quay.io/keycloak/keycloak:21.0.1 as builder

WORKDIR /opt/keycloak
# for demonstration purposes only, please make sure to use proper certificates in production instead
# RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 -dname "CN=server" -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore
# RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:21.0.1
COPY --from=builder /opt/keycloak/ /opt/keycloak/

COPY ./theme/build/ /opt/keycloak/theme/
COPY ./theme/target/keycloakify-starter-keycloak-theme-4.6.6.jar /opt/keycloak/providers/
RUN /opt/keycloak/bin/kc.sh build

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]