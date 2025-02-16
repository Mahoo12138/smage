import {
    deleteDir, judgeDirExist, makeDir, readFile, writeFile,
    type WebDAVAuth, type WebDAVContext,
} from "~/common/api/web-dav"
import { type Coordinator, type CoordinatorContext, type TypeExt } from ".."
import type { BackupData } from "~/common/data"

function getEndpoint(ext: TypeExt): string {
    let { endpoint } = ext || {}
    if (endpoint?.endsWith('/')) {
        endpoint = endpoint.substring(0, endpoint.length - 1)
    }
    return endpoint!
}

function prepareContext(context: CoordinatorContext): WebDAVContext {
    const { auth, ext } = context
    const endpoint = getEndpoint(ext)
    const webDavAuth: WebDAVAuth = {
        type: "password",
        username: auth?.login?.acc,
        password: auth?.login?.psw,
    }
    return { auth: webDavAuth, endpoint }
}

export default class WebDAVCoordinator implements Coordinator {

    private filePath = "smage-backup.json"

    async download(context: CoordinatorContext): Promise<BackupData[]> {
        const dirPath = context?.ext?.dirPath
        const davContext = prepareContext(context)

        const result = await readFile(davContext, `${dirPath}/${this.filePath}`)
        if (result) {
            return JSON.parse(result)
        }
        throw new Error('')
    }

    async upload(context: CoordinatorContext, content: BackupData[]): Promise<void> {
        const dirPath = context?.ext?.dirPath
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

    async testAuth(auth: Auth, ext: TypeExt): Promise<string> {

    }

    async clear(context: CoordinatorContext, client: Client): Promise<void> {

    }
}

