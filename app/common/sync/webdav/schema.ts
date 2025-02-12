import { register } from 'zod-metadata';
import zod from 'zod';
register(zod);

const webDavAuthSchema = zod.object({
    host: zod.string().describe("WebDAV 的 Endpoint，不包含文件路径。").meta({ label: 'Endpoint', placeholder: '请输入 Endpoint', required: "Endpoint 必输" }),
    path: zod.string().describe("文件夹路径。").meta({ label: 'Directory', placeholder: '请输入 Directory', required: "Directory 必输" }),
    username: zod.string().meta({ label: '用户名', placeholder: '请输入用户名', required: "用户名必输" }),
    password: zod.string().meta({ label: '密码', placeholder: '请输入密码', required: "密码必输" }),
});

export default webDavAuthSchema