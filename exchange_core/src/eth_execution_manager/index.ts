// import { EthProvider } from "@abstract/chain_provider/eth";
import { CHAIN_PROVIDER, ENV } from "@abstract/env";
import { gas_suggessor } from "@helper/gas_suggessor";
import { message_broker } from "@helper/message_broker/message_broker";
import { ERC_20_ABI } from "@static/index";
import { Contract, ethers } from "ethers";
import { subscribe_execution_topic } from "@helper/message_broker/topics/execution";
import { TransferExecutionActionMessage } from "@abstract/execution";
import { EXECUTION_WALLET_PRIVATE_KEY } from "./env";
import { WRAPPED_NATIVE_ADDRESSES } from "@abstract/const";
import { CryptoInstrument } from "@abstract/model/entity";
import { WalletEntity } from "@abstract/wallet";
import { storage } from "@helper/storage";
import { NativeTransfer, TokenTransfer, TxExecution } from "./execution_action";
import { execution_state } from "@helper/kv_storage/execution_state";
import { hasher } from "@helper/hash_provider";


const CHAIN = Number(ENV.get("CHAIN"))
const provider = ethers.getDefaultProvider(CHAIN_PROVIDER.get_provider(CHAIN))
const execution_wallet = ethers.Wallet.fromPhrase(EXECUTION_WALLET_PRIVATE_KEY, provider)
const native_wrapped_address = WRAPPED_NATIVE_ADDRESSES[CHAIN]
const gas_suggestor_service = gas_suggessor(CHAIN)
const NATIVE_TRANSFER_GAS_LIMIT = 32000n
const db = storage()
const execution_state_service = execution_state<number>()

const TRANSFER_NATIVE_EXECUTION = new TxExecution(
  "TRANSFER_NATIVE_TX", CHAIN, db, execution_state_service, [
    new NativeTransfer(gas_suggestor_service, "transfer native token"),
  ]
)

const TRANSFER_TOKEN_EXECUTION = new TxExecution(
  "TRANSFER_TOKEN_TX", CHAIN, db, execution_state_service, [
    new NativeTransfer(gas_suggestor_service, "transfer native for fee"),
    new TokenTransfer(gas_suggestor_service, "transfer token to cold wallet", provider),
  ]
) 

async function main(){
  let message_broker_service = await message_broker()
  let token: CryptoInstrument
  let wallet_entity: WalletEntity
  let wallet: ethers.HDNodeWallet
  let contract: Contract 
  let gas_price: bigint
  let balance: bigint
  let native_balance: bigint

  subscribe_execution_topic<TransferExecutionActionMessage>(CHAIN.toString(), message_broker_service, async (msg)=>{
    if (msg.data.token.chain != CHAIN) throw new Error(`instrument chain ${msg.data.token.chain} invalid for executor chain ${CHAIN}`)

    token = msg.data.token
    // token.address = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"
    wallet_entity = msg.data.wallet
    wallet = ethers.Wallet.fromPhrase(hasher.decode(wallet_entity.phrase), provider)
    contract = new Contract(token.address, ERC_20_ABI, provider)
    balance = await contract.balanceOf(wallet_entity.address)
    gas_price = await gas_suggestor_service.get_avarage_gas_price()
    native_balance = await provider.getBalance(wallet_entity.address)
    
    console.log("BALANCE!");
    console.log(balance);
    
    if (token.address == native_wrapped_address && balance < msg.data.amount){
      await TRANSFER_NATIVE_EXECUTION.execute(msg.identifier, [
        {to: execution_wallet.address, value: native_balance-gas_price * NATIVE_TRANSFER_GAS_LIMIT, wallet_from: wallet, contract: undefined},
      ])
    }
    else{
      //calc gas limit for transfer first and then send
      await TRANSFER_TOKEN_EXECUTION.execute(msg.identifier, [
        {to: wallet.address, value: gas_price * NATIVE_TRANSFER_GAS_LIMIT, wallet_from: execution_wallet, contract: undefined},
        {to: execution_wallet.address, value: balance, wallet_from: wallet, contract: contract}
      ])
    }

  })
  // let wallet = new Wallet("some private key", provider_.get_provider())
  // let contract = new Contract("0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", ERC_20_ABI, provider_.get_provider())
  // let decimals = 18
  // let to_address = "0x3713083fc916879ddBdF864bB4bcC0815c2Af1f3"
  // let token_amount = ethers.parseUnits("0.01", decimals)
  
  // let tx: TransactionRequest = {
  //   to: await contract.getAddress(),
  //   value: 0,
  //   data: data,
  // }
  // // tx.gasPrice = await gas_suggestor.get_avarage_gas_price(),
  
  // tx.gasLimit = await provider.estimateGas(tx)
  // let fee = Number(tx.gasLimit)*Number(tx.gasPrice)
  // console.log(`suppose fee = ${ethers.formatEther(fee)}`);
  // console.log(tx);
  
  // let block = await provider_.get_block_by_number(true)

}

main()
