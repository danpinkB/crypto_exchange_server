export interface TriggerSmartContract {
    owner_address: string;
    contract_address: string;
    parameter?: string;
    function_selector?: string;
    call_value?: number;
    call_token_value?: number;
    token_id?: number;
    data?: string;
    fee_limit?: number;
    Permission_id?: number;
}

export interface TransferContract {
    to_address: string;
    owner_address: string;
    amount: number;
}

export enum ContractType {
    AccountCreateContract = "AccountCreateContract",
    TransferContract = "TransferContract",
    TransferAssetContract = "TransferAssetContract",
    VoteAssetContract = "VoteAssetContract",
    VoteWitnessContract = "VoteWitnessContract",
    WitnessCreateContract = "WitnessCreateContract",
    AssetIssueContract = "AssetIssueContract",
    WitnessUpdateContract = "WitnessUpdateContract",
    ParticipateAssetIssueContract = "ParticipateAssetIssueContract",
    AccountUpdateContract = "AccountUpdateContract",
    FreezeBalanceContract = "FreezeBalanceContract",
    UnfreezeBalanceContract = "UnfreezeBalanceContract",
    CancelAllUnfreezeV2Contract = "CancelAllUnfreezeV2Contract",
    WithdrawBalanceContract = "WithdrawBalanceContract",
    UnfreezeAssetContract = "UnfreezeAssetContract",
    UpdateAssetContract = "UpdateAssetContract",
    ProposalCreateContract = "ProposalCreateContract",
    ProposalApproveContract = "ProposalApproveContract",
    ProposalDeleteContract = "ProposalDeleteContract",
    SetAccountIdContract = "SetAccountIdContract",
    CustomContract = "CustomContract",
    CreateSmartContract = "CreateSmartContract",
    TriggerSmartContract = "TriggerSmartContract",
    GetContract = "GetContract",
    UpdateSettingContract = "UpdateSettingContract",
    ExchangeCreateContract = "ExchangeCreateContract",
    ExchangeInjectContract = "ExchangeInjectContract",
    ExchangeWithdrawContract = "ExchangeWithdrawContract",
    ExchangeTransactionContract = "ExchangeTransactionContract",
    UpdateEnergyLimitContract = "UpdateEnergyLimitContract",
    AccountPermissionUpdateContract = "AccountPermissionUpdateContract",
    ClearABIContract = "ClearABIContract",
    UpdateBrokerageContract = "UpdateBrokerageContract",
    ShieldedTransferContract = "ShieldedTransferContract",
    MarketSellAssetContract = "MarketSellAssetContract",
    MarketCancelOrderContract = "MarketCancelOrderContract",
    FreezeBalanceV2Contract = "FreezeBalanceV2Contract",
    UnfreezeBalanceV2Contract = "UnfreezeBalanceV2Contract",
    WithdrawExpireUnfreezeContract = "WithdrawExpireUnfreezeContract",
    DelegateResourceContract = "DelegateResourceContract",
    UnDelegateResourceContract = "UnDelegateResourceContract",
    UNRECOGNIZED = "UNRECOGNIZED"
}