
import { ChainType } from "@abstract/model/chain";
import {GasSuggestor} from './gas_suggestor'
import { ordered_storage, OrderedStorage } from '../kv_storage/ordered_storage'

export function gas_suggessor(chain: ChainType){
  return new GasSuggestor(
    ordered_storage(chain)
  )
}