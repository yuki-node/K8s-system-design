---
name: publish-k8s-pages
description: 发布本仓库的 Kubernetes 学习站到 GitHub Pages。用户明确要求发布、上线或更新线上网页时使用；普通本地开发遵循仓库 AGENTS.md 的发布边界。
---

# 发布 Kubernetes 学习站

发布授权遵循仓库根目录 [AGENTS.md](../../AGENTS.md)。读取本 skill 或复用过去的发布记录本身不构成新的推送授权。

## 固定目标

- 源码：`https://github.com/yuki-node/K8s-system-design`。
- 网站：`https://yuki-node.github.io/K8s-system-design/`。
- 工作流：`.github/workflows/pages.yml`；发布分支与构建命令从当前工作流和 `package.json` 读取。

本地目录可能名为 `K8s-systems-design`，远端是单数 `K8s-system-design`；使用上方网站路径的原始大小写。发布到现有 GitHub Pages，不另建托管站点、仓库或域名。

## 准备本次版本

在当前 checkout 的仓库根目录执行，先查看 `git status --short`、当前分支、`origin` 的 fetch/push 地址及未发布提交。HTTPS 和 SSH 可以分别用于 fetch/push，但都应指向固定目标仓库；不匹配时先解决目标问题。

在发布授权范围内 `git fetch origin`，检查 `origin/main` 与当前版本的关系。当前发布版本应位于 `main`，包含远端已有提交；存在分叉、保护规则或其他分支待集成时先处理相应问题，不用强制推送或把未知分支的 HEAD 直接覆盖到远端 `main`。

运行 `npm run check` 和 `git diff --check`。依赖未安装时按锁文件安装；已有依赖未改变时复用。检查失败先在本地修复，不能跳过检查发布。

查看最终 diff 与暂存内容，仅纳入本次授权范围的修改。构建产生的受跟踪 `dist/` 更新与对应源文件一起审查、提交；保留无关改动。明确本次会上传的全部未发布提交，避免顺带发布历史本地工作。已具备完整提交时直接复用，不创建空提交。

记录 `release_sha=$(git rev-parse HEAD)`，其含义是本次实际推送的提交，而非某个过去成功构建的提交。

## 上传并跟踪发布

确认上述版本后执行 `git push origin main`。此推送会触发现有工作流：检查并构建，将 `dist/` 上传到 Pages，再部署；不另推 `gh-pages` 分支或复制一份新的部署工作流。

推送后定位 `pages.yml` 中 **head SHA 等于 `release_sha`** 的运行。优先使用可用的 GitHub 连接或已登录的 `gh`，例如：

```sh
gh run list --repo yuki-node/K8s-system-design --branch main --workflow pages.yml --commit "$release_sha" --json databaseId,headSha,status,conclusion,url
```

确认返回的 SHA 后取对应 `databaseId` 作为 `run_id`；可以用 `gh run watch "$run_id" --repo yuki-node/K8s-system-design --exit-status` 跟踪，长任务以可恢复会话执行并持续提供有意义的进展。没有这些工具时，使用公开 Actions API 或仓库 Actions 页面读取同一提交的状态。SSH 推送成功不代表已具备 GitHub API 登录身份。

等待构建和部署均完成且成功；`queued`、`in_progress`、推送成功或仅构建成功都不算已上线。单次等待以 10 分钟为观察窗口；仍在排队时报告当前运行链接与状态，不宣称完成，也不为催促队列重复触发运行。

遇到失败先读取具体失败步骤。只有在根因已修复、授权范围仍相同且该次产物仍对应目标提交时才重跑失败任务；每个明确修正后重试一次，仍失败则保留错误证据，定位新的原因。首次启用、身份或浏览器阻塞时再读 [排障参考](references/troubleshooting.md)。

## 验证并交付

部署成功后检查正式网站，不能仅凭旧网页可访问就判定新版本已生效：

1. 首页和核心资源 `app.js`、`data.js`、`isokit.js`、`styles.css`、`isokit.css`、`icons.svg` 返回成功。
2. 抽查 `examples/lab.yaml` 和本次修改涉及的下载示例，核对项目子路径与内容。
3. 将线上文件与本次提交构建的相应 `dist/` 文件比较内容或哈希；若使用未改动的源码产物，也需核对成功运行的 SHA。
4. 浏览器可用时，从正式网址检查主题导航、场景切换、步骤和示例入口，保留实际线上截图。无法进行浏览器检查时如实说明范围。

完成条件是目标提交的部署成功，且对应站点与资源验证通过。交付正式网址、源码／提交和部署运行链接，说明验证结果。仍有部署失败、等待或访问异常时报告当前状态与所需下一步。

官方参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[gh run list](https://cli.github.com/manual/gh_run_list)、[gh run watch](https://cli.github.com/manual/gh_run_watch)。
