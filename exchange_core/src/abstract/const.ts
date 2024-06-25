import { OrderStatus } from "@prisma/client";
import { ChainType } from "./model/chain";

export const STABLE_SYMBOLS = ["USD", "USDT", "USDC"]

export const ORDER_STATUSES = Object.values(OrderStatus).map(x=>x.toString())
//"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
export const WRAPPED_NATIVE_ADDRESSES:{[key:number]:string} = {
    [ChainType.TRON]:"TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR",
    [ChainType.ETH]:"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    [ChainType.BSC]:"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    [ChainType.POLYGON]:"0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97",
    [ChainType.ARBITRUM]:"0x912CE59144191C1204E64559FE8253a0e49E6548",
    [ChainType.OPTIMISM]:"0x4200000000000000000000000000000000000042"
}