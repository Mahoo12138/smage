import type { AllSettings } from "~/types";
import type { SyncType } from "../sync";

export interface BackupData {
    name: string;
    setting: AllSettings
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