
// import { wallet_order_storage } from "@helper/wallet_order";
import { getAddress, Transaction,  } from "ethers";
import _ from 'lodash'
import { ENV } from "@abstract/env";
import { WRAPPED_NATIVE_ADDRESSES } from "@abstract/const";
import { EthProvider } from "@helper/chain_provider/eth";
import { make_chain_sync_facade } from "@facade/chain_sync";
import { storage } from "@helper/storage";
import { make_wallet_order_facade } from "@facade/wallet_order";
import { gas_suggessor } from "@helper/gas_suggessor";
import { ETHTransaction } from "@abstract/transaction";
import { ETHBlock } from "@abstract/block";

const CHAIN = Number(ENV.get("CHAIN"))
const CHAIN_NATIVE_WRAPPED_ADDRESS = WRAPPED_NATIVE_ADDRESSES[CHAIN]

type T = {[key:string]: [string,bigint][]}

const ERC20_TRANSFER_PATTERN = /0xa9059cbb([a-fA-F\d]{64})([a-fA-F\d]{64})/g;
const ADDRESS_PREFIX = '0x'

function parse_erc20_transfers_from_data(data: string):[string, bigint][]{
    return data.match(ERC20_TRANSFER_PATTERN)?.map(match=>[
        getAddress(ADDRESS_PREFIX+match.slice(34, 74)),
        BigInt( parseInt(match.slice(75),16) )
    ]) || []
}

function get_native_transfer_data(tx: ETHTransaction):[string, bigint][]{
    return [[getAddress(tx.to!), BigInt(tx.value)]]
}

function get_contract_transfer_data(tx: ETHTransaction):[string, bigint][]{
    
    return tx.input?parse_erc20_transfers_from_data(tx.input):[["_",0n]]
    
}

async function main() {
    const provider = new EthProvider(CHAIN)
    const gas_suggestor_service = gas_suggessor(CHAIN)
    const chain_sync_facade = make_chain_sync_facade(storage())
    const wallet_order_facade = make_wallet_order_facade(storage())
    
    let curr_block: number, curr_block_raw: ETHBlock, tx: Transaction

    let lc_block = await chain_sync_facade.find_first(CHAIN).then(x=>x?.block)
    async function process_block(block: ETHBlock){
        console.log(`processing ${parseInt(block.number, 16)} block`);
        let ind:string, token:string, transfers: [string,bigint][]
        let mapping: T = {} 
        await wallet_order_facade.process_block_transfers(
            CHAIN, 
            block.transactions.reduce((map_: T, tx: ETHTransaction)=>{
                [token, transfers] = tx.input==="0x"?[CHAIN_NATIVE_WRAPPED_ADDRESS, get_native_transfer_data(tx)]:[tx.to!, get_contract_transfer_data(tx)]
                if (transfers.length>0){
                    map_ = transfers.reduce((smap: any, transfer_data)=>{
                        ind = `${transfer_data[0]}_${token}`.toLowerCase()
                        smap[ind] = (smap[ind]||[]).concat([[tx.hash!, transfer_data[1]]])
                        return smap
                    }, map_)
                }
                
                return map_
            }, 
            mapping)
        )
        
    }
    
    async function fetch_block() {
        curr_block_raw = await provider.get_block_by_number("latest", true)
        curr_block = parseInt(curr_block_raw.number, 16)
        if (curr_block != lc_block) await gas_suggestor_service.process_block(curr_block_raw)
        if (!lc_block) lc_block = curr_block-1
        // await process_block(await provider.get_block_by_number("0x55c0af", true))
        for (let nc_block = lc_block+1; nc_block < curr_block; nc_block++) {            
            let block: ETHBlock = await provider.get_block_by_number("0x"+nc_block.toString(16), true)
            // console.log(`processing ${parseInt(block.number, 16)} block`);
            //fill gas price
            if (block) {

                await process_block(block)
                lc_block = nc_block
                await chain_sync_facade.upsert(CHAIN, lc_block)
            }
        }
        await process_block(curr_block_raw)
        lc_block = curr_block
        await chain_sync_facade.upsert(CHAIN, curr_block) 
    }
    
    async function call_fetch_block(){
        await fetch_block()
        setTimeout(call_fetch_block, 6000)
    }
    await call_fetch_block()
}

main()