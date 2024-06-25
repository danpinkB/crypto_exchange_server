import dotenv from 'dotenv'
dotenv.config()
import { ChainType } from './model/chain';
import Handlebars from 'handlebars'

export class ENV{
    static get(name:string):string{
        if(!process.env[name])
            throw new Error(`${name} variable is not set`);
        return process.env[name]!
    }
}

const PROVIDER_TEMPLATE = Handlebars.compile(`{{chain_type}}_CHAIN_PROVIDER__DSN`)

export class CHAIN_PROVIDER extends ENV {
    static get_provider(chain: ChainType):string{
        return this.get(
            PROVIDER_TEMPLATE({
                chain_type: ChainType[chain]
            })
        )
    }
}
