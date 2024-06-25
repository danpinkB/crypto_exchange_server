import { ChainType } from "@abstract/model/chain";;
import { EthProvider } from './eth';
import { TronChainProvider } from './tron';
import { ChainProvider } from './base';

export const chain_provider:{[chain:number]:ChainProvider} = {
    [ChainType.TRON]: new TronChainProvider(),
    [ChainType.ETH]: new EthProvider(ChainType.ETH),
    [ChainType.BSC]: new EthProvider(ChainType.BSC),
    [ChainType.POLYGON]: new EthProvider(ChainType.POLYGON),
    [ChainType.ARBITRUM]: new EthProvider(ChainType.ARBITRUM),
    [ChainType.OPTIMISM]: new EthProvider(ChainType.OPTIMISM),
}