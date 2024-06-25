import { UserVerificationStatus } from "@abstract/model/user"
import { HttpValidationException } from "@abstract/error"
import { Transform, Type } from "class-transformer"
import { IsDateString, IsIn, IsNotEmpty, Matches, MaxLength, validate } from "class-validator"


export class UserInfoDTO{
    sub!: string
    @IsIn(Object.values(UserVerificationStatus))
    verification_status!: UserVerificationStatus
    
    given_name!:string
    family_name!:string
    email!:string

    @Transform(({ value }) => new Date(value), { toClassOnly: true })
    date_of_birth?: Date
    place_of_birth?: string
    pesel?: string
    residental_address?: string
    citizenship?: string
    document_number?: string    
}

export class UserVerificationRequestDto{
    @MaxLength(10)
    @IsDateString()
    @IsNotEmpty()
    // @Transform(({ value }) => new Date(value), { toClassOnly: true })
    date_of_birth!: Date
    @IsNotEmpty()
    place_of_birth!: string
    // @IsNotEmpty()
    pesel!: string
    // @IsNotEmpty()
    residental_address!: string
    // @IsNotEmpty()
    citizenship!: string
    // @IsNotEmpty()
    document_number!: string

    async validate(): Promise<UserVerificationRequestDto>{

        return validate(this).then((err)=>{
            if (err.length>0) throw new HttpValidationException(err)
            return this
        })
    }
}