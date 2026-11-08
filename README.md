# K8s Systems Design

学习站地址：[yuki-node.github.io/K8s-system-design](https://yuki-node.github.io/K8s-system-design/)。源码仓库：[yuki-node/K8s-system-design](https://github.com/yuki-node/K8s-system-design)。

面向懂一点应用开发和 Docker、准备学习 Kubernetes 的读者，以及希望深入机制的开发者和初级运维。先通过 **7 节入门导读**建立整体认识，再用 **27 个主题、54 个独立场景、305 个演示阶段**连接基础知识、应用部署和日常运维排障。

视觉与交互沿用 [Systems Explorer](https://kejun.github.io/cs-systems-design/)，形式参考 [Protocol Explorer](https://protocol-explorer-alpha.vercel.app/)。保留白底蓝线、细边框、三栏工作区、组件分组图解、状态观察和执行轨迹；支持深色主题与移动端。

## 本地运行

Node.js 22 或 24：

```sh
npm ci
npm run check
npm start
```

打开 [本机预览](http://127.0.0.1:4173/)。默认仅监听本机，设置 `PORT=4174 npm start` 可换端口。`npm run check` 会先构建最新课程和图解，再做类型、语法、课程、DOM 流程、图解与动画检查。

如本机 npm 默认是不可达的公司源，可对本项目单次使用：

```sh
npm ci --registry=https://registry.npmjs.org
```

生产产物为 `dist/`，可交给任意静态 HTTP 服务。运行时不依赖 CDN、数据库、集群连接或第三方服务；打开来源链接才会跳转官方文档。课程主题支持 hash 深链接，如 `#probes`、`#service-debug`、`#drain`。相对资源路径支持 GitHub Pages 项目前缀。

## 三条学习路径

无主题链接时默认进入“00 · Kubernetes 入门”（`#intro`）。导读从镜像与容器回顾，逐步介绍为什么需要 K8s、集群、Pod、Deployment 和 Service，最后通过本地教学模拟体验扩容、就绪和新 Pod 替代。预计阅读与交互约 8–10 分钟，可跳过；导读独立于 27 个机制主题及其原有进度。主题深链接继续直达。

| 路径 | 主题 |
| --- | --- |
| 基础与架构 | 集群架构、声明式 API、控制循环、Pod 生命周期、Namespace/配额、标签/选择器、调度、requests/limits、健康探针 |
| 应用与流量 | Deployment、StatefulSet、DaemonSet、Job/CronJob、ConfigMap/Secret、Service/EndpointSlice、DNS、Ingress/Gateway、持久存储 |
| 运维与排障 | NetworkPolicy、RBAC、Pod 安全、HPA、可观测性、Pod 排障、Service 排障、节点维护/PDB、备份与升级 |

每个主题包括机制说明、3 段深入解释、关键取舍、常见误解、关联主题、直接官方来源，以及各自带前提和预期的主流程／故障示例。知识图谱展示无方向的直接关联，不表示学习顺序或前置依赖。

## 组件图案

流程画面采用 [Kubernetes 官方图标集](https://github.com/kubernetes/community/tree/main/icons) 的 32 枚原版 SVG，覆盖控制面组件、节点、etcd 和常见 API 资源。控制器使用 controller-manager 图案，Deployment、ReplicaSet 等资源各用对应符号。拓扑采用等距立体终端、机柜、堆叠存储、容器舱、副本集合、路由器等造型，带侧面明暗、底座与落地阴影；官方原版图标作为模型上的身份徽标。时序图表头保留清晰的平面识别符号；状态、选择、播放和减少动态效果继续联动。

全部图标本地加载，无运行时 CDN。资源来源、下载日期、哈希与许可见 `dist/assets/kubernetes/manifest.json` 和 `dist/licenses/kubernetes-icons.md`。符号映射集中在 `src/component-visuals.mjs`，立体造型在 `src/isometric-component.jsx`，状态徽标与时序符号在 `src/component-glyph.jsx`，便于后续配置。

## 如何学习

第一次接触 K8s 时，先阅读基础路径最前面的入门导读；每次只看一小节，配合图解区分容器、Pod、管理副本的资源和访问入口，再进入下面的机制探索。

1. 选择主题，先观察主流程的组件拓扑与可变阶段，再切到故障场景比较条件变化。
2. 用右侧「机制」理解取舍，「命令 / YAML」查看和下载示例，「来源」继续阅读官方文档。
3. 可选下载「命令 / YAML」中的 `lab.yaml`，在自己的实验集群建立 `demo/web` Deployment 与 Service。站点不会执行任何集群命令。
4. 依据示例前提准备 CNI、存储、入口控制器或 Metrics Server 等组件，再验证预期行为。

组件拓扑支持点击角色查看相关阶段；交互时序支持点击消息行定位，两者与执行轨迹和阶段导航同步。可展开画布，在窄屏中横向浏览图解。滚动发布、Pod 创建与替换、HPA 用阶段状态展示待创建、运行、就绪与退出；控制信号与内部检查也有对应动效。页头左上角和页签使用 Kubernetes 官方 Logo。

键盘：`/` 搜索，空格播放／暂停，`←` / `→` 切阶段，`Esc` 重置。播放支持 0.5×、1×、1.5×、2×；暂停保持运动位置，页面隐藏时暂停，系统减少动态效果时不显示移动圆点。主题和学习标记保存到本机浏览器，和原 Systems Explorer 的存储键分开。

浏览到最后阶段或完成播放会标记当前主题已学，也可手动切换标记；本机进度不跨设备同步。可在课程说明中清除。

## 内容与示例边界

课程使用稳定 API 和通用机制，具体版本与插件以主题内官方资料为准。每个主流程有 6–9 个逻辑参与者、6–12 个阶段；角色可能是组件、资源集合或状态，不代表物理主机数量。阶段可压缩多轮异步控制循环。

`examples/lab.yaml` 创建专用 `demo` 空间。清理前确认里面没有其他人的资源；删除 Namespace 会连同空间内资源一起删除。存储示例可能申请实际后端卷，删除 PVC 前检查回收策略。节点维护、升级和恢复提供机制与只读盘点，实际操作应遵循自己的发行版流程。

详见 [内容范围与核查](docs/content-guide.md)、[首版设计约定](docs/spec.md)、[术语表](GLOSSARY.md) 与 [场景拓扑决策](docs/adr/0002-variable-mechanism-topologies.md)。本项目尚未通过真实 Kubernetes 集群验证所有示例；离线检查不能替代真实调度、准入和运行验证。

## 开发与验证

```sh
npm run typecheck       # 课程与场景类型
npm run build           # 生成课程、54 份示例和本地图解依赖
npm run test:course     # 已构建课程的独立检查
node --test test/learning.test.cjs
npm run check           # 最新构建 + 完整检查
```

| 文件 | 用途 |
| --- | --- |
| `src/course.ts` | 学习路径、官方来源和无方向的主题关系 |
| `src/course-types.ts` | 参与者、阶段、关系、示例的类型约束 |
| `src/lessons/*.ts` | 三条路径的机制讲解、示例与独立故障场景 |
| `src/scenarios.ts` | 各主题展开的主流程、角色分组与状态里程碑 |
| `src/intro-content.mjs` / `src/beginner-intro.jsx` | 独立入门导读的原创讲解、渐进图解与教学模拟 |
| `src/lab.yaml` | 可选入门实验的完整清单 |
| `dist/index.html` / `styles.css` / `explorer.css` / `intro.css` / `app.js` | 静态界面源文件与入门／主题导航 |
| `src/isokit-*.{jsx,mjs}` | 真正的 React / IsoKit 逻辑参与者图解 |
| `src/point-motion.mjs` | 基于经过时间的运动、暂停与恢复 |
| `scripts/build.mjs` | 生成 `dist/data.js`、示例与本地依赖和许可证 |
| `scripts/serve.mjs` | 仅本机静态预览服务 |
| `test/*.test.cjs` | 课程完整性与真实应用 bundle 的 DOM 流程检查 |
| `check-isokit.cjs` / `check-motion.cjs` | 全部阶段的图解与动画回归 |

课程产物和图解 bundle 由构建生成；修改课程时编辑 `src/`。界面文件沿用参考站在 `dist/` 内直接维护的方式，构建不会覆盖它们。DOM 测试运行真实应用与图解 bundle，仅用替代值提供测试环境缺少的 OS 媒体偏好／时间服务。

## GitHub Pages 自动发布

日常开发与发布授权见 [AGENTS.md](AGENTS.md)：默认只改本地，明确要求发布时才上传代码并更新线上网页。完整的上传、部署跟踪、线上验证与排障流程见 [发布 skill](skills/publish-k8s-pages/SKILL.md)。

当前源码仓库为 [yuki-node/K8s-system-design](https://github.com/yuki-node/K8s-system-design)，正式网站为 [Kubernetes 学习站](https://yuki-node.github.io/K8s-system-design/)。Pages 的 Source 已配置为 **GitHub Actions**；推送 `main` 会触发 [现有工作流](.github/workflows/pages.yml)，检查并构建后将 `dist/` 发布到网站。PR 只检查与构建，不部署。

所有资源使用相对路径，不需要为项目子路径调整域名或 `base`。例如探针深链接为 [K8s-system-design/#probes](https://yuki-node.github.io/K8s-system-design/#probes)。

IsoKit、React 等上游许可与声明位于 `dist/licenses/`。本仓库未替参考项目声明新的再分发许可；对外分发前请核对源项目及相关资产的许可要求。
