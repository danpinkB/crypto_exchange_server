import { ENV } from "@abstract/env";
import {AES, enc} from "crypto-js";
const HASH_SECRET = ENV.get("HASH_SECRET")
const HASH_SECRET_NONCE = ENV.get("HASH_SECRET_NONCE")

const hasher = {
    encode:(message:string)=>{return AES.encrypt(message.toString(), enc.Base64.parse(HASH_SECRET), {iv:enc.Base64.parse(HASH_SECRET_NONCE)}).toString()},
    decode:(message:string)=>{return AES.decrypt(message.toString(), enc.Base64.parse(HASH_SECRET), {iv:enc.Base64.parse(HASH_SECRET_NONCE)}).toString(enc.Utf8)}
}
export {hasher}