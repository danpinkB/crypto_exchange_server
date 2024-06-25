export enum UserVerificationStatus{
    UNVERIFIED = "unverified",
    IN_PROGRESS = "in_progress",
    VERIFIED = "verified",
    VERIFICATION_FAILED = "verification_failed",
}

export type UserAttributes = {
    sub: string
    verification_status: UserVerificationStatus
    given_name:string
    family_name:string
    email:string
    date_of_birth: Date
    place_of_birth: string
    pesel: string
    residental_address: string
    citizenship: string
    document_number: string    
}