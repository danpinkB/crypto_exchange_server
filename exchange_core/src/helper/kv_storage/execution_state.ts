import { ExecutionAction } from "@abstract/execution";
import { KVStorage } from "./kv_storage";
import Handlebars from 'handlebars'
import { ENV } from "@abstract/env";
import { CryptoInstrument } from "@abstract/model/entity";
import { WalletEntity } from "@abstract/wallet";


const EXECUTION_KEY = Handlebars.compile("execution_{{key}}")
const EXECUTION_LIST_KEY = "execution_list"

export class ExecutionStateStorage<T> extends KVStorage {
    constructor(dsn: string){
        super(dsn);
    }

    async get_executions(): Promise<ExecutionAction<T>[]>{
        let action_data;
        return Promise.all(
            await this.kv_client.smembers( EXECUTION_LIST_KEY ).then(
                (members)=>members.map(async (member)=>{
                    action_data = await this.kv_client.get( 
                        EXECUTION_KEY({ key: member }) 
                    )
                    return {
                        identifier: member,
                        data: JSON.parse(action_data!)
                    }
                })
            )
        )
    }

    async get_executions_keys(): Promise<string[]>{
        return await this.kv_client.smembers(EXECUTION_LIST_KEY)
    }

    async add_execution(execution: ExecutionAction<T>){
        await this.kv_client.multi()
        .sadd(EXECUTION_LIST_KEY, execution.identifier)
        .set(EXECUTION_KEY({ key:execution.identifier }), JSON.stringify(execution.data))
        .exec()
        return execution
    }

    async remove_execution(identifier: string): Promise<void>{
        console.log("REMOVING execution");
        
        await this.kv_client.multi()
        .srem(EXECUTION_LIST_KEY, identifier)
        .del(EXECUTION_KEY({ key: identifier }))
        .exec()
    }

    async get_execution(identifier: string): Promise<ExecutionAction<T> | null>{
        return await this.kv_client.get(identifier).then((action_data)=>(action_data?JSON.parse(action_data):action_data))
    }

    async update_execution(execution: ExecutionAction<T>): Promise<void>{
        console.log(await this.get_executions_keys());
        
        if (await this.kv_client.sismember(EXECUTION_LIST_KEY, execution.identifier))
            await this.kv_client.set(
                EXECUTION_KEY({ key: execution.identifier }),
                JSON.stringify(execution.data) 
            )
        else throw new Error("execution with this identifier not found")
    }
}

export class NumericExecutionStateStorage extends ExecutionStateStorage<number>{}

export function execution_state<T>(){
    return new ExecutionStateStorage<T>(ENV.get("EXECUTION_STATE_STORAGE__DSN"))
}

export function numeric_exectuion_state(){
    return execution_state<number>()
}