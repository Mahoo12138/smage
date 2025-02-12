import {
    deleteDir, judgeDirExist, makeDir, readFile, writeFile,
    type WebDAVAuth, type WebDAVContext,
} from "~/common/api/web-dav"
import DateIterator from "@/utils/date-iterator"
import { processDir, type Coordinator, type CoordinatorContext, type TypeExt } from ".."

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

    async download(context: CoordinatorContext, dateStart: Date, dateEnd: Date, targetCid?: string): Promise<timer.core.Row[]> {
        const dirPath = processDir(context?.ext?.dirPath)
        const davContext = prepareContext(context)
        targetCid = targetCid || context?.cid

        const dateIterator = new DateIterator(dateStart, dateEnd)
        const result: timer.core.Row[] = []
        await Promise.all(dateIterator.toArray().map(async date => {
            const filePath = `${dirPath}${targetCid}/${date}.md`
            const fileContent = await readFile(davContext, filePath)
            const rows: timer.core.Row[] = parseData(fileContent)
            rows?.forEach?.(row => result.push(row))
        }))
        return result
    }

    async upload(context: CoordinatorContext, rows: timer.core.Row[]): Promise<void> {
        const dateAndContents = divideByDate(rows)
        const dirPath = processDir(context?.ext?.dirPath)
        const cid = context?.cid
        const davContext = prepareContext(context)

        const clientPath = await this.checkClientDirExist(davContext, dirPath, cid)

        await Promise.all(
            Object.entries(dateAndContents).map(async ([date, content]) => {
                const filePath = `${clientPath}/${date}.md`
                await writeFile(davContext, filePath, content)
            })
        )
    }

    private async checkClientDirExist(davContext: WebDAVContext, dirPath: string, cid: string) {
        const clientDirPath = `${dirPath}${cid}`
        const clientExist = await judgeDirExist(davContext, clientDirPath)
        if (!clientExist) {
            await makeDir(davContext, clientDirPath)
        }
        return clientDirPath
    }

    async testAuth(auth: Auth, ext: TypeExt): Promise<string> {
        const endpoint = getEndpoint(ext)
        if (!endpoint) {
            return "The endpoint is blank"
        }
        const { dirPath } = ext || {}
        if (!dirPath) {
            return "The path of directory is blank"
        }
        const { acc, psw } = auth?.login || {}
        if (!acc) {
            return 'Account is blank'
        }
        if (!psw) {
            return 'Password is blank'
        }
        const davAuth: WebDAVAuth = { type: 'password', username: acc, password: psw }
        const davContext: WebDAVContext = { endpoint, auth: davAuth }
        const webDavPath = processDir(dirPath)
        try {
            const exist = await judgeDirExist(davContext, webDavPath)
            if (!exist) {
                return "Directory not found"
            }
        } catch (e) {
            return (e as Error)?.message || e
        }
    }

    async clear(context: CoordinatorContext, client: Client): Promise<void> {
        const cid = client.id
        const dirPath = processDir(context.ext?.dirPath)
        const davContext = prepareContext(context)
        const clientDirPath = `${dirPath}${cid}/`
        const exist = await judgeDirExist(davContext, clientDirPath)

        if (!exist) return
        await deleteDir(davContext, clientDirPath)
    }
}