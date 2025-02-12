import { register } from 'zod-metadata';
import zod from 'zod';
register(zod);

const gistAuthSchema = zod.object({
    token: zod.string().describe("需要创建一个至少包含 gist 权限的 token").meta({ label: 'Access Token', placeholder: '请输入 Access Token', required: "Access Token 必输" }),
});

export default gistAuthSchema