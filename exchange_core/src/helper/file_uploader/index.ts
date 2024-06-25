import { S3_ACCESS_KEY, S3_BUCKET_NAME, S3_ENDPOINT_URL, S3_SECRET_KEY } from './env';
import { FileStorage } from './file_uploader';

export function file_uploader(){
    return new FileStorage(S3_ENDPOINT_URL, S3_SECRET_KEY, S3_ACCESS_KEY, S3_BUCKET_NAME)    
}