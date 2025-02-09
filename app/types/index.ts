import type { AppSettings } from "../common/data/AppSettings";
import type { S3Settings } from "../common/data/S3Settings";
export * from "../common/data/S3Settings";
export * from "../common/data/AppSettings";

export interface UploadedFileLinkObj {
  link: string;
  name: string;
}

export interface Photo {
  Key: string;
  LastModified: string;
  url: string;
}

export type AllSettings = {
  s3: S3Settings;
  app: AppSettings;
};
