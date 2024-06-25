import { ChainType } from "@abstract/model/chain";
import { CHAIN_PROVIDER } from "@abstract/env";
import { DexTokenInfo } from "@abstract/token";
import { WalletEntity } from "@abstract/wallet";

export abstract class ChainProvider{
    protected dsn: string;
    constructor(chain: ChainType){
        this.dsn = CHAIN_PROVIDER.get_provider(chain)
    }
    abstract random_wallet(): WalletEntity;
    abstract get_token_info(address: string): Promise<DexTokenInfo>;
}