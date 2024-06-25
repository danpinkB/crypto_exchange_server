import { CHAIN, TRON_CHAIN_PROVIDER__DSN, TRON_API_KEY, CHAIN_NATIVE_WRAPPED_ADDRESS } from "./env";
import { storage } from "@helper/storage";
import {AxiosHeaders} from 'axios'
import {TronWeb} from 'tronweb';
import {Transaction} from 'tronweb/lib/commonjs/types/Transaction'
import { Block } from "tronweb/lib/esm/types/APIResponse";
import { make_chain_sync_facade } from "@facade/chain_sync";
import { make_wallet_order_facade } from "@facade/wallet_order";
import { ContractType, TransferContract, TriggerSmartContract } from "@abstract/tron";

type T = {[key:string]: [string,bigint][]}

//recipe for parse tx log for transfer method
const ERC20_TRANSFER_PATTERN = /a9059cbb([a-fA-F\d]{24})([a-fA-F\d]{40})([a-fA-F\d]{64})/g;
const ADDRESS_PREFIX = "41";
function normalize_hex_address(hex: string){
    return hex.length==42?hex:ADDRESS_PREFIX.concat(hex)
}

function parse_erc20_transfers(data: string): [string,bigint][]{
    // console.log(data);
    return data.match(ERC20_TRANSFER_PATTERN)?.map(match=>[
            TronWeb.address.fromHex(normalize_hex_address(match.slice(8, 72).replace(/^0+/, ''))),
            BigInt(parseInt(match.slice(73),16))
        ]
    ) || []
}

function get_smart_contract_transafer_data(transaction:Transaction<TriggerSmartContract>):[string, [string,bigint][]] {
    let tvalue = transaction.raw_data.contract[0].parameter.value
    if (!tvalue.data) return [TronWeb.address.fromHex(tvalue.contract_address),[]]
    return [TronWeb.address.fromHex(tvalue.contract_address), parse_erc20_transfers(tvalue.data)];
}

function get_transfer_data(transaction:Transaction<TransferContract>):[string, [string,bigint][]] {
    let contract = transaction.raw_data.contract[0]
    return [CHAIN_NATIVE_WRAPPED_ADDRESS, 
        [[TronWeb.address.fromHex(contract.parameter.value.to_address), BigInt(contract.parameter.value.amount)]]
    ]
}

const transfer_handlers: {[type: string]:(transaction: Transaction<any>)=>{}} = {
    [ContractType.TransferContract]: get_transfer_data,
    [ContractType.TriggerSmartContract]: get_smart_contract_transafer_data
}

async function main() {
    const db = storage()
    let headers = new AxiosHeaders()
    headers.set('TRON-PRO-API-KEY', TRON_API_KEY)
    
    const chain_sync_facade = make_chain_sync_facade(db)
    const wallet_order_facade = make_wallet_order_facade(db)

    async function process_block(block: Block){
        console.log(block.block_header.raw_data.number);
        
        let ind, token:string, transfers: [string,bigint][]
        await wallet_order_facade.process_block_transfers(CHAIN, block.transactions.reduce((map_: T, tx: Transaction<any>)=>{
            if(transfer_handlers[tx.raw_data.contract[0].type]){ 
                [token, transfers] = tx.raw_data.contract[0].type===ContractType.TransferContract?get_transfer_data(tx):get_smart_contract_transafer_data(tx)
                if (transfers.length>0){
                    map_ = transfers.reduce((smap: T, transfer_data)=>{
                        ind = `${transfer_data[0]}_${token}`
                        smap[ind] = (smap[ind]||[]).concat([[tx.txID, transfer_data[1]]])
                        return smap
                    }, map_)
                }
            }
            return map_
        },{}))
    }

    let lc_block = await chain_sync_facade.find_first(CHAIN).then(x=>x?.block)
    let curr_block: number

    const provider = new TronWeb({ fullHost: TRON_CHAIN_PROVIDER__DSN, headers: headers });

    async function fetch_block() {
        let block = await provider.trx.getCurrentBlock()
        curr_block = block.block_header.raw_data.number

        if (!lc_block) lc_block = curr_block-1

        for (let nc_block = lc_block+1; nc_block <= curr_block-1; nc_block++){
            await process_block(await provider.trx.getBlock(nc_block))
        }

        if (curr_block!=lc_block) await process_block(block)
    
        lc_block = curr_block

        await chain_sync_facade.upsert(CHAIN, lc_block)
    }

    async function call_fetch_block(){
        await fetch_block()
        setTimeout(call_fetch_block, 1000)
    }
    await call_fetch_block()
}
// console.log(parse_erc20_transfers("a9059cbb000000000000000000000000415e0a64793bcb90a12112310fc653e71093e11b0000000000000000000000000000000000000000000000000000000208d34c80"));
// console.log(TronWeb.address.fromHex("415e0a64793bcb90a12112310fc653e71093e11b"));
// console.log(TronWeb.address.toHex("TFvqaamqDqBNEtR2992HS2aYVbpMr9B6tm"));

main()
