import { PaginationResponseWrapper, PaginationParams } from '@abstract/pagination';;
import KcAdminClient from 'keycloak-admin';
import { UserInfoDTO, UserVerificationRequestDto } from '@abstract/dto/user';
import { file_uploader } from '@helper/file_uploader';
import { user_dto_response_mapper } from '@abstract/mapper/dto/user';
import { TARGET_REALM } from './env';
import { UserVerificationStatus } from '@abstract/model/user';

export function make_user_facade(keycloak_client: KcAdminClient){
    let file_uploader_service = file_uploader()
    return Object.freeze({
        get_all,
        process_verification_request,
        get
    })

    
    async function process_verification_request(
        id:string, 
        verification_reuqest: UserVerificationRequestDto, 
        files: Express.Multer.File[]
    ): Promise<{
        verification_status: UserVerificationStatus,
        date_of_birth: Date,
        place_of_birth: string,
        pesel: string,
        residental_address: string,
        citizenship: string,
        document_number: string,
        documents: string[]
    }>{
        let docs_path = `documents/${id}`
        let preveous_docs = await file_uploader_service.get_images_by_path(docs_path)
        let documents = await Promise.all(files.map(async(x: Express.Multer.File)=>await file_uploader_service.upload_image_with_path(x, docs_path)))
        let user_attrs = {
            verification_status: UserVerificationStatus.IN_PROGRESS,
            date_of_birth: verification_reuqest.date_of_birth,
            place_of_birth: verification_reuqest.place_of_birth,
            pesel: verification_reuqest.pesel,
            residental_address: verification_reuqest.residental_address,
            citizenship: verification_reuqest.citizenship,
            document_number: verification_reuqest.document_number
        }
        await keycloak_client.users.update({id: id, realm: TARGET_REALM}, {attributes: user_attrs })
        if(preveous_docs.length>0) await file_uploader_service.delete_objects(preveous_docs.map(x=>({Key: x})))
        return {documents:documents, ...user_attrs}
    }

    async function get(id:string): Promise<UserInfoDTO|null>{
        let user = await keycloak_client.users.findOne({id: id, realm: TARGET_REALM})
        return user?user_dto_response_mapper.from(user):null
    }
    
    async function get_all(pagination_params: PaginationParams): Promise<PaginationResponseWrapper>{
        return new PaginationResponseWrapper(
            0,
            ((await keycloak_client.users.find({realm: TARGET_REALM})).map(x=>user_dto_response_mapper.from(x)))
        )
    }
    
    
}

