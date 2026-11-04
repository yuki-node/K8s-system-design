# K8s Systems Design — 首版约定

2026-11-05 经用户确认。项目独立于参考仓库，最终目录为同级 `K8s-systems-design`，本地 Git 提交；发布到公网不在本次范围内。

面向具备 Linux、容器基础的开发者和初级运维，用中文解释 Kubernetes 的基础、应用与运维。静态站点，不连接真实集群；所有操作示例由学习者自行在实验环境执行。

沿用 cs-systems-design 和 Protocol Explorer 的白底蓝线、细边框、三栏工作区、等距立体插画与执行轨迹。保留搜索、分组、知识关联图、分步播放、主流程／故障场景切换、键盘操作、深浅主题、本地学习标记和移动端布局。图中四个参与者是逻辑实体，不表示真实集群拓扑。

## 课程

共 27 个主题，每个主题有 1 个主流程与 1 个独立故障场景，各 4 步，共 54 个场景／216 个阶段。

1. 基础与架构：集群架构、声明式 API、控制循环、Pod 生命周期、Namespace、标签与选择器、调度、资源 requests/limits、健康探针。
2. 应用与流量：Deployment、StatefulSet、DaemonSet、Job/CronJob、ConfigMap/Secret、Service/EndpointSlice、DNS、Ingress/Gateway、PV/PVC/StorageClass。
3. 运维与排障：NetworkPolicy、RBAC、Pod 安全、HPA、可观测性、Pod 排障、Service 排障、节点维护/PDB、备份与升级。

每个主题包含机制解释、关键取舍、常见误解、关联主题、kubectl／YAML 示例、官方来源。示例说明前提和预期结果，区分完整清单与配置片段，不把条件性行为描述为保证。额外组件（如 CNI、CSI、入口控制器、Metrics Server）明确标注。

## 已确认测试边界

- 课程数据公开输出：目录与来源、主流程和故障场景完整性、示例前提；不证明 Kubernetes 实际行为。
- IsoKit 图解输出：四个参与者、箭头语义、传输中断、可读标签、暂停和减少动态效果；不验证真实拓扑。
- 浏览器学习流程：搜索、切主题／场景、播放、主题与学习进度保存、知识图谱、移动端；不运行真实集群命令。

类型检查覆盖课程结构；保留原动画回归测试。按 TDD 逐个边界实现，最后运行完整检查、构建与标准／需求两轴评审，修复发现后提交。
