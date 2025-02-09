import type { AppSettings, S3Settings } from "~/types";
import type { SyncType } from "../sync";

export interface BackupData {
    setting: AppSettings;
    configs: S3Settings[];
}

export const SUPPORT_SYNC_TYPE = [
    'none',
    'gist',
    'webdav',
]

const SYNC_TYPE_NAME: { [t in SyncType]: string } = {
    none: "None",
    gist: 'GitHub Gist',
    webdav: 'WebDAV'
}