import {
    createGist, findTarget, getGist, getJsonFileContent, testToken, updateGist,
    type File, type FileForm, type Gist, type GistForm
} from "~/common/api/gist"
import { formatTimeYMD } from "~/utils/time"
import type { Auth, Coordinator, CoordinatorContext } from ".."
import type { BackupData } from "~/common/data"

export default class GistCoordinator implements Coordinator {
    async download(context: CoordinatorContext): Promise<BackupData[]> {

    }

    async upload(context: CoordinatorContext, data: BackupData[]): Promise<void> {

    }

    testAuth(auth: Auth): Promise<string> {
        return testToken(auth?.token)
    }

    async clear(context: CoordinatorContext): Promise<void> {
    }
}
