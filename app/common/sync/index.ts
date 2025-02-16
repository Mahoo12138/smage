import type { z, ZodSchema, ZodTypeAny, ZodTypeDef } from "zod"
import webDavAuthSchema from "./webdav/schema"
import gistAuthSchema from "./gist/schema"
import type { BackupData } from "../data"

export interface Coordinator {
    /**
     * Download fragmented data from cloud
     *
     * @param targetCid The client id, default value is the local one in context
     */
    download(context: CoordinatorContext): Promise<BackupData[]>
    /**
     * Upload fragmented data to cloud
     * @param data
     */
    upload(context: CoordinatorContext, data: BackupData[]): Promise<void>
    /**
     * Test auth
     *
     * @returns errorMsg or null/undefined
     */
    testAuth(auth: Auth, ext: TypeExt): Promise<string>
    /**
     * Clear data
     */
    clear(context: CoordinatorContext): Promise<void>
}

export interface CoordinatorContext {
    auth?: Auth
    login?: LoginInfo
    ext?: TypeExt
}

export type LoginInfo = {
    acc?: string
    psw?: string
}

export type Auth = {
    token?: string
    login?: LoginInfo
}

export type AuthType =
    | 'token'
    | 'password'

export type TypeExt = {
    bucket?: string
    endpoint?: string
    dirPath?: string
}

export type SyncType =
    | 'none'
    | 'gist'
    | 'webdav'

export const SyncFormSchemas: { [key in SyncType]?: ZodSchema<any, ZodTypeDef, any> } = {
    gist: gistAuthSchema,
    webdav: webDavAuthSchema
}

export type SyncConfigSetting = {
    none: {}
    gist: z.infer<typeof gistAuthSchema>,
    webdav: z.infer<typeof webDavAuthSchema>,
}


declare module 'zod' {
    interface ZodMeta {
        label: string;
    }
}

