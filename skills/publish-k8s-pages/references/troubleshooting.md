# GitHub Pages 发布排障

仅在发布流程被相应问题阻塞时读取对应段落。当前工作流、远端状态与错误输出优先于过去记录。

## 首次启用或 Configure Pages 失败

当构建成功而 `Configure Pages` 报 Pages site Not Found，查看该仓库 [Settings → Pages](https://github.com/yuki-node/K8s-system-design/settings/pages)。发布来源应为 **Build and deployment → Source → GitHub Actions**。已有 `pages.yml`，无需点击建议模板的 Configure 去生成另一份工作流。

确认设置页面显示来源已保存，再重跑对应提交的失败部署任务。仅凭未认证的公开 Pages API 返回 404 不足以证明设置关闭；应结合真实部署日志与有权限的设置页面。

工作流内部已使用仓库 `GITHUB_TOKEN`，权限配置以工作流为准。通常无需为首次启用另建长期个人令牌；有管理权限的用户可通过已登录的设置页面启用。缺少身份或管理权限时请用户完成登录或设置，不索要密码、私钥或要求把令牌粘贴到聊天。

## Git 与 API 身份

Git 可复用本机已有 SSH 身份，fetch 可走公开 HTTPS，push 可走 SSH；核对两者仍指向同一目标仓库。`ssh -T git@github.com` 显示已成功认证时，退出码 1 是 GitHub 不提供 shell 的正常结果。

SSH 权限不等于 `gh` 或 REST API 权限。能推送但没有 API 登录时，公开 Actions 状态可用于观察；启用 Pages、重跑失败任务等写操作使用现有已登录连接、CLI 或浏览器。

如本机尚未信任 GitHub 主机密钥，依据 [GitHub 官方 SSH 主机指纹](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints) 校验；需要时在临时 known_hosts 中记录**官方公开主机密钥**，通过单次 SSH 选项使用并保持严格校验。临时路径仅对该次操作有效，不写入 skill、Git 远端 URL 或长期仓库配置；不通过关闭主机校验来绕过错误。个人私钥保持在现有凭据设施中。

## 浏览器接口或用户切换页面

页面控制接口不可用时，可使用受支持的原生界面完成设置。始终核对目标仓库与设置页面，优先使用专用标签页；不要对未知的当前活动标签直接输入或导航。

若用户正在切换 Chrome 页面导致操作中断，协调短暂空闲后再继续；恢复时重新读取当前状态。设置完成后用公开 API 观察运行和正式网址验证，及时结束对 Chrome 的占用。只截图与发布有关的页面，避免保存无关浏览内容。

## 发布未更新或资源缺失

- 先将工作流运行 SHA 与发布提交比较；不要拿上一轮的成功结果代替当前版本。
- 检查部署步骤、Pages 产物目录与项目子路径。站点资源应使用相对地址，下载文件应位于发布的 `dist/` 内。
- CDN 仍返回旧文件时保留对比证据，有限次等待后复查；持续不一致则报告未完成，避免通过空提交或重复部署掩盖原因。
- 工作流失败先修复具体原因；可复用同一提交的有效构建产物重跑失败部署。源码变化后发布新提交，不能把旧 SHA 的重跑视为新代码上线。
