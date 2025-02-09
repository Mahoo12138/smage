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