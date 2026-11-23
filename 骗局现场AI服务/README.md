# 骗局现场 AI 主持人：本地演示服务

当前服务仅用于开发者工具本地演示，默认监听 `127.0.0.1:8787`，不具备在线多人房间身份认证、服务端事件存储或公网防滥用能力，不能直接部署到公网或用于真实用户。

本机安装 Node.js 18 以上后，先在阿里云百炼开通通用 API Key 并确认北京地域的免费额度、开启“额度用完即停”。将 Key 配置到启动服务的进程环境变量 `DASHSCOPE_API_KEY`，然后在本目录运行 `node server.js`。服务默认使用 `qwen3.7-flash`，可以通过 `BAILIAN_MODEL` 调整。不要把密钥写进小程序、源代码或聊天记录。

例如，在本服务目录打开 PowerShell，使用隐藏输入将密钥放入当前窗口的临时环境（关闭窗口后失效）：

```powershell
$caseApiSecret = Read-Host '请输入百炼通用 API Key（输入不会显示）' -AsSecureString
$env:DASHSCOPE_API_KEY = [System.Net.NetworkCredential]::new('', $caseApiSecret).Password
node server.js
```

停止服务后可执行 `Remove-Item Env:DASHSCOPE_API_KEY` 清除该窗口中的环境变量。不要在命令、脚本文件或聊天里直接写明密钥。比较两个平台时，同一个 PowerShell 窗口还需使用同样的隐藏输入方式设置 `SILICONFLOW_API_KEY`，并将 `SILICONFLOW_MODEL` 设置为控制台显示的免费模型 ID；随后运行 `node compare.js`。硅基流动模型 ID 不是密钥，但具体版本和免费状态仍需在控制台确认。

微信开发者工具调试时，小程序会尝试连接本机服务；服务没开、没有密钥、接口报错或超时时，自动使用预设主持人与预设复盘。真机不会连接本机演示地址，须另行实现并部署带认证、服务端房间权限校验的 HTTPS 服务，再配置微信合法域名。

当前本机原型将客户端标记为已公开的线索编号提交到服务端，由服务端从本地案件材料中取出对应线索。模型不收到聊天原文、私人角色、未标记公开的线索或席位；但客户端的公开标记尚未经过可信服务端确认。正式多人局必须由后端维护房间、认证玩家和公开事件，不能相信客户端提交的编号。

对照测试：在服务端进程环境分别配置 `DASHSCOPE_API_KEY`、`SILICONFLOW_API_KEY` 和硅基流动控制台中确认免费的 `SILICONFLOW_MODEL`，然后运行 `node compare.js`。此命令将以相同输入向两个供应商各发起七次调用，覆盖空公开线索、退费、改签、演出票、校园和两种复盘结果，可能消耗额度。输出逐条响应、回退原因和每家中位响应时间供人工比较。文本输出的自然度仍需人工评分；有限样本与关键词检测不能证明模型永不泄露或幻觉，也不能代表多人并发性能。

检查：`node host-service.test.js`、`node providers.test.js`、`node evaluation.test.js`、`node server.test.js`；小程序侧在项目目录运行 `node tests/ai-host-ui.test.js`。
