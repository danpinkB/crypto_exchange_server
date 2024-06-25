require("express-async-errors");
import 'reflect-metadata';
import express, {Express, Request, Response, NextFunction} from "express";
import {asyncMiddleware} from 'middleware-async'
import {StatusCodes} from 'http-status-codes'
import Keycloak from 'keycloak-connect'
import {Prisma} from '@prisma/client'
import {config} from 'dotenv'
import cors from 'cors'
import {HttpError} from 'http-errors'

import {make_crypto_currency_router, make_operation_chain_router, 
  make_comission_router, make_order_router,
  make_fiat_currency_router, make_payment_instrument_router, 
  make_account_router, make_user_router} from './router'
import KcAdminClient from 'keycloak-admin';
import { ENV } from '@abstract/env';
import { Credentials } from 'keycloak-admin/lib/utils/auth';
import { HttpValidationException } from '@abstract/error';

// import { blockchain_provider } from './utils';
// import { ChainType } from '@abstract/types';

// console.log(blockchain_provider[ChainType.POLYGON].get_token_info("0x7FFB3d637014488b63fb9858E279385685AFc1e2"));

let app:Express = express();
config()
// const memoryStore = new session.MemoryStore()
const whitelist = ["howchange.pl", "howchange.eu", "localhost:3001", "localhost:3000", "localhost:3001"]

app.use(cors({
  origin(requestOrigin:any, callback:any) {
    callback(null, true)
  //  if (requestOrigin&&requestOrigin in whitelist) {
  //     callback(null, true)
  //  } else {
  //     callback(null, false)
  //     // callback(new Error('Not allowed by CORS'))
  //  }
  }, 
}))
// app.use(session({
//   secret: 'mySecret',
//   resave: false,
//   saveUninitialized: true,
//   store: memoryStore
// }))


const keycloak = new Keycloak({
  // store: memoryStore
}, {
  "auth-server-url": ENV.get("AUTH_SERVER_URL"),
  "ssl-required": ENV.get("AUTH_SSL_REQUIRED"),
  realm: ENV.get("TARGET_REALM"),
  resource: ENV.get("AUTH_RESOURCE"),
  "bearer-only":true,
  "confidential-port":0
})

const keycloak_client = new KcAdminClient({
  baseUrl: ENV.get("AUTH_SERVER_URL"),
  // realmName: ENV.get("TARGET_REALM")
});


const credentials:Credentials = {
  username: ENV.get("AUTH_ADMIN_USERNAME"),
  password: ENV.get("AUTH_ADMIN_PASSWORD"),
  grantType: 'password',
  clientId: "admin-cli",
  // totp: '123456',
};

keycloak_client.auth(credentials).then(()=>{
  console.log("authorized");
}).catch((err)=>{
  // console.log(err);
  console.log("authorization error");
  
})

setInterval(async () => keycloak_client.auth(credentials).catch((err)=>{}), 58 * 1000);

app.use(keycloak.middleware());
app.use(express.json())
app.use(asyncMiddleware((req,res,next)=>{
  next()
}))

app.use("/instrument/fiat", make_fiat_currency_router(keycloak))
app.use("/instrument/crypto", make_crypto_currency_router(keycloak))
app.use("/instrument", make_payment_instrument_router(keycloak))
app.use("/pair", make_operation_chain_router(keycloak))
app.use("/comission", make_comission_router(keycloak))
app.use("/order", make_order_router(keycloak))
app.use("/account", make_account_router(keycloak, keycloak_client))
app.use("/user", make_user_router(keycloak, keycloak_client))


app.use(function onError(err:Error, req:Request, res:Response, next:NextFunction) {
  console.log(err);
  
  if (err instanceof Prisma.PrismaClientKnownRequestError){
    let message = err.message.split("\n");
    return res.status(StatusCodes.BAD_REQUEST).send({status:StatusCodes.BAD_REQUEST, message:message[message.length-1],data:err.meta})
  }
  // if (Array.isArray(err)){
  //   return res.status(StatusCodes.EXPECTATION_FAILED).send({
  //     status: StatusCodes.EXPECTATION_FAILED, 
  //     message: "EXPECTATION_FAILED", 
  //     data: err.reduce((errors:Array<string>, x: ValidationError)=>errors.concat(Object.values(x.constraints!)),[])
  //   })
  // }
  if (err instanceof HttpValidationException){
    return res.status(err.status).send(err)
  }
  if (err instanceof HttpError){
    return res.status(err.status).send({status:err.status, message:err.message})
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({status:StatusCodes.INTERNAL_SERVER_ERROR, message:err.message})
})

app.listen(ENV.get("EXCHANGE_API_PORT"))



