import { DexTokenInfo } from "@abstract/token";
import Decimal from "decimal.js";
import { WalletEntity } from "@abstract/wallet";
import { TronWeb } from "tronweb";
import { AxiosHeaders } from "axios";
import { ENV } from "@abstract/env";
import { ChainType } from "@abstract/model/chain";
import { ChainProvider } from "./base";


export class TronChainProvider extends ChainProvider{
    private api_key: string;
    constructor(){
        super(ChainType.TRON)
        this.api_key = ENV.get("TRON_API_KEY")
    }
    async get_token_info(address: string): Promise<DexTokenInfo>{
        let headers = new AxiosHeaders()
        headers.set('TRON-PRO-API-KEY', this.api_key)

        let provider = new TronWeb({
            fullHost: this.dsn,
            headers: headers
        });
        provider.setAddress(address);

        let contract = await provider.contract().at(address); 

        let token_name = await contract.methods.name().call();
        let token_symbol = await contract.methods.symbol().call();
        let decimals = Number(await contract.methods.decimals().call());
        
        return {
            decimals: new Decimal(10).pow(decimals),
            name: token_name,
            symbol: token_name.toLowerCase().includes("wrapped")?token_symbol.slice(1):token_symbol
        }
    }
    random_wallet() : WalletEntity{
        let wallet = TronWeb.createRandom()
        return {
            address: wallet.address,
            phrase: wallet.mnemonic!.phrase
        }
    }
}
