import type { z, ZodSchema, ZodTypeAny, ZodTypeDef } from "zod"
import webDavAuthSchema from "./webdav/schema"
import gistAuthSchema from "./gist/schema"

export interface Coordinator {
    /**
     * Download fragmented data from cloud
     *
     * @param targetCid The client id, default value is the local one in context
     */
    download(context: CoordinatorContext, dateStart: Date, dateEnd: Date, targetCid?: string): Promise<any[]>
    /**
     * Upload fragmented data to cloud
     * @param rows
     */
    upload(context: CoordinatorContext, rows: any[]): Promise<void>
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
    cid: string
    auth?: Auth
    login?: LoginInfo
    ext?: TypeExt
}

type LoginInfo = {
    acc?: string
    psw?: string
}

type Auth = {
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
    gist: z.infer<typeof gistAuthSchema>,
    webdav: z.infer<typeof webDavAuthSchema>,
}


declare module 'zod' {
    interface ZodMeta {
        label: string;
    }
}


type FormField = {
    key: string
    label: string
    description?: string
    zodType: ZodTypeAny
    uiType: 'input' | 'select' | 'checkbox' | 'datepicker' | 'custom'
    uiProps?: Record<string, any>
    options?: { label: string; value: any }[] // 下拉/单选选项
    layout?: {
        cols?: number // 栅格布局
        class?: string
    }
}

