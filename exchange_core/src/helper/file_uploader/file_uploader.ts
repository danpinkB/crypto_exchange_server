import { DeleteObjectsCommandOutput, ObjectIdentifier, S3 } from '@aws-sdk/client-s3';
import sha from 'sha1'
import bcrypt from 'bcrypt';
import Handlebars from 'handlebars'

const PATTERN= /[\/.](gif|jpg|jpeg|tiff|png|webp)$/i;
const FILE_PATH_TEMPLATE = Handlebars.compile(`{{path}}/{{file_name}}.{{file_extension}}`)
export class FileStorage{
    conn: S3
    bucket_name: string

    constructor(url:string, secret_access_key: string, access_key_id: string, bucket_name: string){
        this.bucket_name = bucket_name
        this.conn = new S3({
            forcePathStyle: true,
            endpoint: url,
            region:'us-east-1',
            credentials: { accessKeyId: access_key_id, secretAccessKey: secret_access_key, },
        })
    }

    async upload_image(file:Express.Multer.File):Promise<string> {  
        if (PATTERN.test(file.originalname)){
            let parts = file.originalname.split(".")
            let file_path = FILE_PATH_TEMPLATE({ path:"uploads", file_name: sha(parts[0]+bcrypt.genSaltSync(10)), file_extension: parts[parts.length-1] })
            
            return await this.conn.putObject({ 
                Bucket: this.bucket_name, 
                Key: file_path, 
                Body: file.buffer, 
                ACL: 'public-read', 
                ContentType: file.mimetype 
            }).then(()=>file_path)
        }
        else return "";
    }

    async upload_image_with_path(file:Express.Multer.File, path: string):Promise<string> {  
        if (PATTERN.test(file.originalname)){
            let parts = file.originalname.split(".")
            let file_path = FILE_PATH_TEMPLATE({ path:path, file_name: sha(parts[0]+bcrypt.genSaltSync(10)), file_extension: parts[parts.length-1] })
            
            return await this.conn.putObject({ 
                Bucket: this.bucket_name, 
                Key: file_path, 
                Body: file.buffer, 
                ACL: 'public-read', 
                ContentType: file.mimetype 
            }).then(()=>file_path)
        }
        else return "";
    }

    async get_images_by_path(path:string):Promise<string[]>{
        return await this.conn.listObjectsV2({
            Bucket: this.bucket_name,
            Prefix: path
        }).then((result)=>result.Contents?.map(x=>x.Key!) || [])
    }
    async delete_image(path:string):Promise<string> {
        return await this.conn.deleteObject({Bucket: this.bucket_name, Key: path}).then(()=>path)
    }
    
    async delete_objects(objects:ObjectIdentifier[]):Promise<DeleteObjectsCommandOutput> {
        return await this.conn.deleteObjects({Bucket: this.bucket_name, Delete:{Objects:objects}})
    }
}
