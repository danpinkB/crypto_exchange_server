import { IMapFrom } from "@abstract/mapping";
import { UserInfoDTO } from "@abstract/dto/user";
import UserRepresentation from "keycloak-admin/lib/defs/userRepresentation";

export const user_dto_response_mapper: IMapFrom<UserRepresentation, UserInfoDTO> = {
    from: function (entity: UserRepresentation): UserInfoDTO {
        let dto = new UserInfoDTO()
        dto.sub = entity.id!
        dto.family_name = entity.firstName!
        dto.given_name = entity.lastName!
        dto.email = entity.email!
        
        if (entity.attributes){
            dto.citizenship = entity.attributes.citizenship?.[0]
            dto.date_of_birth = entity.attributes.date_of_birth?.[0]
            dto.document_number = entity.attributes.document_number?.[0]
            dto.pesel = entity.attributes.pesel?.[0]
            dto.place_of_birth = entity.attributes.place_of_birth?.[0]
            dto.residental_address = entity.attributes.residental_address?.[0]
            dto.verification_status = entity.attributes.verification_status?.[0]
        }
        return dto
    }
}