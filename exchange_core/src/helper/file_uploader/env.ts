import { ENV } from "@abstract/env";

export const S3_ACCESS_KEY = ENV.get("S3_ACCESS_KEY")
export const S3_SECRET_KEY = ENV.get("S3_SECRET_KEY")
export const S3_BUCKET_NAME = ENV.get("S3_BUCKET_NAME")
export const S3_ENDPOINT_URL = ENV.get("S3_ENDPOINT_URL")
