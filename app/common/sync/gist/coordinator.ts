import {
    createGist, findTarget, getGist, getJsonFileContent, testToken, updateGist,
    type File, type FileForm, type Gist, type GistForm
} from "~/common/api/gist"
import { formatTimeYMD } from "~/utils/time"
import type { Coordinator, CoordinatorContext } from ".."
import type { BackupData } from "~/common/data"

export default class GistCoordinator implements Coordinator<"gist"> {
    async download(context: CoordinatorContext<"gist">): Promise<BackupData[]> {

    }

    async upload(context: CoordinatorContext<"gist">, data: BackupData[]): Promise<void> {

    }

    async testAuth(context: CoordinatorContext<"gist">): Promise<string> {
        if (context.config.type !== 'gist') {
            throw new Error('Invalid auth type');
        }
        return testToken(context.config.token);
    }

    async clear(context: CoordinatorContext<"gist">): Promise<void> {
    }
}
