import type { z, ZodSchema, ZodTypeAny, ZodTypeDef } from "zod"
import webDavAuthSchema from "./webdav/schema"
import gistAuthSchema from "./gist/schema"
import type { BackupData } from "../data"

export interface Coordinator<T extends SyncType> {
    /**
     * Download fragmented data from cloud
     *
     * @param targetCid The client id, default value is the local one in context
     */
    download(context: CoordinatorContext<T>): Promise<BackupData[]>
    /**
     * Upload fragmented data to cloud
     * @param data
     */
    upload(context: CoordinatorContext<T>, data: BackupData[]): Promise<void>
    /**
     * Test auth
     *
     * @returns errorMsg or null
     */
    testAuth(context: CoordinatorContext<T>): Promise<string | null>
    /**
     * Clear data
     */
    clear(context: CoordinatorContext<T>): Promise<void>
}


// 基础认证类型
export type BaseConfig<T extends SyncType> = {
    type: T;
}

// 各种同步方式的扩展配置
export type WebDAVConfig = BaseConfig<'webdav'> & {
    endpoint: string;
    dirPath: string;
    username: string;
    password: string;
}

export type GistConfig = BaseConfig<'gist'> & {
    token: string;
    gistId?: string;
    description?: string;
};

export type NoneConfig = BaseConfig<'none'>

// 扩展配置映射
export type ConfigMap = {
    none: NoneConfig;
    gist: GistConfig;
    webdav: WebDAVConfig;
}

export type TypeConfig<T extends SyncType> = ConfigMap[T]

// 协调器上下文
export interface CoordinatorContext<T extends SyncType> {
    // auth: Auth<T>;
    config: TypeConfig<T>;
    type: T;
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

