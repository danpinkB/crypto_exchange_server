import { ChainType } from "@abstract/model/chain";
import { InternalBlockChainTx } from "@abstract/model/tx";
import { GasSuggestor } from "@helper/gas_suggessor/gas_suggestor";
import { NumericExecutionStateStorage } from "@helper/kv_storage/execution_state";
import { PrismaClient, Tx } from "@prisma/client";
import { TransactionResponse, Contract, AbstractProvider, TransactionRequest, HDNodeWallet } from "ethers";

export interface ExecutionAction<A>{
    comment: string;
    do(args: A): Promise<TransactionResponse>;
}

export type TransferRuntimeArgs = {
    to:string, 
    value: bigint, 
    wallet_from: HDNodeWallet
    contract: Contract | undefined
}


export class NativeTransfer implements ExecutionAction<TransferRuntimeArgs>{
    private gas_suggestor: GasSuggestor
    comment: string;

    constructor(gas_suggestor: GasSuggestor, comment: string){
        this.comment = comment;
        this.gas_suggestor = gas_suggestor
    }

    async do(params: TransferRuntimeArgs): Promise<TransactionResponse> {
        return await params.wallet_from.sendTransaction({
            to: params.to,
            value: params.value,
            gasPrice: await this.gas_suggestor.get_avarage_gas_price(),
            gasLimit: 32000
        })
    }
}


export class TokenTransfer implements ExecutionAction<TransferRuntimeArgs>{ 
    private gas_suggestor: GasSuggestor
    comment: string;
    // private contract: Contract
    private provider: AbstractProvider


    constructor(gas_suggestor: GasSuggestor, comment: string, provider: AbstractProvider){
        this.comment = comment;
        this.gas_suggestor = gas_suggestor
        this.provider = provider;
        // this.contract = contract
    }

    async do(params: TransferRuntimeArgs): Promise<TransactionResponse> {
        let data = params.contract!.interface.encodeFunctionData("transfer", [params.to, params.value])
        let tx: TransactionRequest = {
            from: params.wallet_from.address,
            to: await params.contract?.getAddress(),
            value: 0,
            data: data,
            gasPrice: await this.gas_suggestor.get_avarage_gas_price(),
        }
        tx.gasLimit = await this.provider.estimateGas(tx)
        return await params.wallet_from.sendTransaction(tx)
    }
}

export class TxExecution{
    name: string
    db_client: PrismaClient
    state_storage: NumericExecutionStateStorage
    actions: ExecutionAction<TransferRuntimeArgs>[]
    chain: ChainType

    constructor(name: string, chain: ChainType, db_client: PrismaClient, state_storage: NumericExecutionStateStorage, actions: ExecutionAction<TransferRuntimeArgs>[]){
        this.name = name
        this.db_client = db_client
        this.actions = actions
        this.chain = chain
        this.state_storage = state_storage
    }

    async execute(identifier: string, runtime_args: TransferRuntimeArgs[]){
        console.log(runtime_args);
        
        if (runtime_args.length != this.actions.length) throw new Error("invalid runtime args length")
        
        let execution_state = await this.state_storage.get_execution(identifier) || await this.state_storage.add_execution({
            identifier: identifier,
            data: -1
        }) 
        console.log(execution_state);
        
        let tx_entity: Tx = await this.db_client.tx.upsert({where:{id: identifier}, create:{id: identifier, name: this.name}, update:{}})

        let action: ExecutionAction<TransferRuntimeArgs>;
        let args: TransferRuntimeArgs
        for (let i = execution_state.data+1; i < this.actions.length; i++) {
            action = this.actions[i];
            args = runtime_args[i];
            await this.db_client.$transaction(async()=>{
                
                let tx_res = await action.do(args)
                let tx_ = new InternalBlockChainTx(-1, tx_entity.id, new Date(), this.chain, tx_res.hash, action.comment).to_mapping()
                
                let receipt = await tx_res.wait()
                
                if (receipt!.status == 1){
                    await this.db_client.txLog.create({
                        data:{
                            type: tx_.type,
                            tx_id: tx_.tx_id,
                            created_at: tx_.created_at,
                            mappings:{ createMany: { data: tx_.mappings.map(x=>({label:x.label, value: x.value})) } }
                        }
                    })    
                    execution_state.data = i
                    await this.state_storage.update_execution(execution_state)
                }
            }, {timeout: 20000})
        }

        await this.db_client.tx.update({where:{id:tx_entity.id},data:{status:"COMPLETED"}})
        await this.state_storage.remove_execution(identifier)
    }
}