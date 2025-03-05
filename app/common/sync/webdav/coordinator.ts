import {
    deleteDir, judgeDirExist, makeDir, readFile, writeFile,
    type WebDAVAuth, type WebDAVContext,
} from "~/common/api/web-dav"
import { type Coordinator, type CoordinatorContext, type WebDAVConfig } from ".."
import type { BackupData } from "~/common/data"

function getEndpoint(ext: WebDAVConfig): string {
    let { endpoint } = ext || {}
    if (endpoint?.endsWith('/')) {
        endpoint = endpoint.substring(0, endpoint.length - 1)
    }
    return endpoint!
}

function prepareContext(context: CoordinatorContext<'webdav'>): WebDAVContext {
    const { config } = context
    const endpoint = getEndpoint(config)
    const webDavAuth: WebDAVAuth = {
        type: "password",
        username: config?.username,
        password: config?.password,
    }
    return { auth: webDavAuth, endpoint }
}

export default class WebDAVCoordinator implements Coordinator<'webdav'> {

    private filePath = "smage-backup.json"

    async download(context: CoordinatorContext<'webdav'>): Promise<BackupData[]> {
        const dirPath = context?.config?.type
        const davContext = prepareContext(context)

        const result = await readFile(davContext, `${dirPath}/${this.filePath}`)
        if (result) {
            return JSON.parse(result)
        }
        throw new Error('')
    }

    async upload(context: CoordinatorContext<'webdav'>, content: BackupData[]): Promise<void> {
        const dirPath = context?.config?.dirPath
        const davContext = prepareContext(context)

        const clientPath = await this.checkClientDirExist(davContext, dirPath)

        const filePath = `${clientPath}/${this.filePath}`
        await writeFile(davContext, filePath, JSON.stringify(content))
    }

    private async checkClientDirExist(davContext: WebDAVContext, dirPath: string) {
        const clientExist = await judgeDirExist(davContext, dirPath)
        if (!clientExist) {
            await makeDir(davContext, dirPath)
        }
        return dirPath
    }

    async testAuth(context: CoordinatorContext<'webdav'>): Promise<string | null> {
        if (context.config.type !== 'webdav') {
            throw new Error('Invalid auth type');
        }
        const endpoint = getEndpoint(context.config)
        if (!endpoint) {
            return "The endpoint is blank"
        }
        const { dirPath } = context.config || {}
        if (!dirPath) {
            return "The path of directory is blank"
        }
        const { username, password } = context.config || {}
        if (!username) {
            return 'Username is blank'
        }
        if (!password) {
            return 'Password is blank'
        }
        const davAuth: WebDAVAuth = { type: 'password', username, password }
        const davContext: WebDAVContext = { endpoint, auth: davAuth }
        const webDavPath = processDir(dirPath)
        if (!webDavPath) {
            return "Directory process error"
        }
        try {
            const exist = await judgeDirExist(davContext, webDavPath)
            if (!exist) {
                return "Directory not found"
            }
            return null
        } catch (e) {
            return (e as Error)?.message || 'Unknown error'
        }
    }

    async clear(context: CoordinatorContext<'webdav'>): Promise<void> {

    }
}


export function processDir(dirPath?: string) {
    dirPath = dirPath?.trim?.()
    if (!dirPath) {
        return null
    }
    while (dirPath.startsWith("/")) {
        dirPath = dirPath.substring(1)
    }
    if (!dirPath.endsWith("/")) {
        dirPath = dirPath + '/'
    }
    return dirPath
}
