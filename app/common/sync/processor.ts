import type { AppSettings } from "~/types"
import type { Coordinator, CoordinatorContext, SyncType, TypeExt } from "."
import type { BackupData } from "../data"
import GistCoordinator from "./gist/coordinator"
import WebDAVCoordinator from "./webdav/coordinator"


export type AuthCheckResult = {
    option: BackupOption
    auth: Auth
    ext: TypeExt
    type: Type
    coordinator?: Coordinator
    errorMsg?: string
}

class CoordinatorContextWrapper implements CoordinatorContext {
    auth: Auth
    ext?: TypeExt
    cache: Cache
    type: Type


    constructor(auth: Auth, ext: TypeExt, type: Type) {
        this.cid = cid
        this.auth = auth
        this.ext = ext
        this.type = type
    }

    async init(): Promise<CoordinatorContext> {
        this.cache = await syncDb.getCache(this.type) as Cache
        return this
    }

    handleCacheChanged(): Promise<void> {
        return syncDb.updateCache(this.type, this.cache)
    }
}

type Result<T> = {
    success: boolean
    errorMsg?: string
    data?: T
}

function error<T>(msg: string): Result<T> {
    return { success: false, errorMsg: msg, }
}

function success<T>(data?: T): Result<T> {
    return { success: true, data }
}


function prepareAuth(option: BackupOption): Auth {
    const type = option?.backupType || 'none'
    const token = option?.backupAuths?.[type]
    const login = option.backupLogin?.[type]
    return { token, login }
}

export type RemoteQueryParam = {
    start: Date
    end: Date
    specCid?: string
    excludeLocal?: boolean
}

class Processor {
    coordinators: {
        [type in SyncType]?: Coordinator
    }

    constructor() {
        this.coordinators = {
            none: undefined,
            gist: new GistCoordinator(),
            webdav: new WebDAVCoordinator(),
        }
    }

    async syncData(): Promise<Result<number>> {
        const { option, auth, ext, type, coordinator, errorMsg } = await this.checkAuth()
        if (errorMsg) return error(errorMsg)

        const context: CoordinatorContext = await new CoordinatorContextWrapper(cid, auth, ext, type).init()
        await coordinator!.upload(context, data)

        try {
            const now = Date.now()
            return success(now)
        } catch (e) {
            console.error("Error to sync data", e)
            const msg = (e as Error)?.message || e as string
            return error(msg)
        }
    }

    async checkAuth(): Promise<AuthCheckResult> {
        const appSettings = JSON.parse(localStorage.getItem('app-settings') || '') as AppSettings
        const syncSettings = localStorage.getItem('sync-settings')
        const type = (appSettings?.syncType || 'none') as SyncType
        const auth = prepareAuth(option)

        const coordinator = type && this.coordinators[type]
        if (!coordinator) {
            // no coordinator, do nothing
            return { option, auth, ext, type, coordinator, errorMsg: "Invalid type" }
        }
        let errorMsg: string
        try {
            errorMsg = await coordinator.testAuth(auth, ext)
        } catch (e) {
            errorMsg = (e as Error)?.message || 'Unknown error'
        }
        return { option, auth, ext, type, coordinator, errorMsg }
    }

    async query(): Promise<BackupData> {
        const { type, coordinator, auth, ext, errorMsg } = await this.checkAuth()
        if (errorMsg || !coordinator) {
            return {}
        }

        // 1. init context
        const context: CoordinatorContext = await new CoordinatorContextWrapper(localCid, auth, ext, type).init()

        const data = await coordinator.download(context)

        return data
    }

    async clear(cid: string): Promise<Result<void>> {
        return success()
    }
}

export default new Processor()