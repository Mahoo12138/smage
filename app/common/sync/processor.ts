import type { AppSettings } from "~/types"
import type { Coordinator, CoordinatorContext, SyncType } from "."
import type { BackupData } from "../data"
import GistCoordinator from "./gist/coordinator"
import WebDAVCoordinator from "./webdav/coordinator"




type Result<T> = {
    success: boolean
    errorMsg?: string
    data?: T
}


// 添加认证结果类型
type AuthResult = {
    success: boolean
    message: string | null
}
class Processor {
    coordinators = {
        none: undefined,
        gist: new GistCoordinator(),
        webdav: new WebDAVCoordinator(),
    }


    constructor() {

    }
    // 同步数据的主要方法
    async syncData(): Promise<Result<BackupData[]>> {
        try {
            const { coordinator, context } = await this.getActiveCoordinator()
            if (!coordinator) {
                return { success: false, errorMsg: 'No active sync coordinator' }
            }

            // 下载远程数据
            const remoteData = await coordinator.download(context)

            // TODO: 这里可以添加数据合并逻辑

            // 上传合并后的数据
            await coordinator.upload(context, remoteData)

            return { success: true, data: remoteData }
        } catch (error) {
            return {
                success: false,
                errorMsg: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    // 检查认证状态
    async checkAuth(): Promise<AuthResult> {
        try {
            const { coordinator, context } = await this.getActiveCoordinator()
            console.log('object');
            if (!coordinator) {
                return { success: false, message: 'No active sync coordinator' }
            }

            const result = await coordinator.testAuth(context)
            return { success: true, message: result }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Authentication failed'
            }
        }
    }

    // 获取当前活动的协调器和上下文
    private async getActiveCoordinator<T extends SyncType>(): Promise<{
        coordinator?: Coordinator<T>,
        context: CoordinatorContext<T>
    }> {
        const appSettings = JSON.parse(localStorage.getItem('app-settings') || '{}') as AppSettings;
        const syncSettings = JSON.parse(localStorage.getItem('sync-settings') || '{}');
        const type = (appSettings?.syncType || 'none') as SyncType;

        const coordinator = this.coordinators[type];

        // 确保当前同步类型的配置存在
        if (!(type in syncSettings)) {
            throw new Error('Invalid sync configuration');
        }

        const context: CoordinatorContext<T> = {
            config: { ...syncSettings[type], type },
            type: type as T
        };

        return { coordinator: coordinator as Coordinator<T>, context };
    }

    // 清除特定客户端的数据
    async clear(cid: string): Promise<Result<void>> {
        try {
            const { coordinator, context } = await this.getActiveCoordinator()
            if (!coordinator) {
                return { success: false, errorMsg: 'No active sync coordinator' }
            }

            await coordinator.clear(context)
            return { success: true }
        } catch (error) {
            return {
                success: false,
                errorMsg: error instanceof Error ? error.message : 'Clear operation failed'
            }
        }
    }
}

export default new Processor()