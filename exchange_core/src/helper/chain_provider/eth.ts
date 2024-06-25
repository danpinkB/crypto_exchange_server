import { ChainType } from "@abstract/model/chain";
import { ChainProvider } from "./base";
import { DexTokenInfo } from "@abstract/token";
import { WalletEntity } from "@abstract/wallet";
import { ERC_20_ABI } from "@static/index";
import axios from "axios";
import Decimal from "decimal.js";
import { AbstractProvider, Contract, Wallet, ethers } from "ethers";
import Handlebars, { Exception } from 'handlebars'

const JSONRPC_REQUEST_TEMPLATE = Handlebars.compile(`{
    "jsonrpc": "2.0",
    "method": "{{method}}",
    "params": [{{{params}}}],
    "id": {{id}}
}`)


export class EthProvider extends ChainProvider{
    private provider: AbstractProvider
    constructor(chain: ChainType){
        super(chain);
        this.provider = ethers.getDefaultProvider(this.dsn);
    }

    async get_token_info(address: string): Promise<DexTokenInfo>{
        let contract = new Contract(address, ERC_20_ABI, this.provider)
        let token_name: string = await contract.name()
        let token_symbol: string = await contract.symbol()
        
        return {
            decimals: new Decimal(10).pow(Number(await contract.decimals())),
            name: token_name,
            symbol: token_name.toLowerCase().includes("wrapped")?token_symbol.slice(1):token_symbol
        }
    }

    random_wallet(): WalletEntity {        
        let wallet = Wallet.createRandom()
        return {
            address: wallet.address,
            phrase: wallet.mnemonic!.phrase
        }
    }

    async get_block_by_number(number: string = "latest", include_transactions:boolean = false){
        return await axios({
            method:"POST",
            url: this.dsn, 
            headers:{ 'Content-Type': 'application/json', },
            data:include_transactions?
            JSONRPC_REQUEST_TEMPLATE({
                method: "eth_getBlockByNumber",
                params: `"${number}", true`,
                id: 1
            }):
            JSONRPC_REQUEST_TEMPLATE({
                method: "eth_getBlockByNumber",
                params: `"${number}", false`,
                id: 1
            })
        }).then(res=>res.data["result"])
    }

    async get_curr_block_height():Promise<number>{
        return await axios({
            method:"POST",
            url: this.dsn, 
            headers:{ 'Content-Type': 'application/json', },
            data: JSONRPC_REQUEST_TEMPLATE({
                method: "eth_blockNumber",
                // params: "",
                id: 2
            }), 
        }).then(res=>parseInt(res.data["result"], 16)).catch((err)=>{
            console.log(this.dsn);
            throw Error("ERRRRRR")
        })
    }

    get_provider(){
        return this.provider;
    }
}