import type { Frame, Milestone, ParticipantGroup, Scenario } from './course-types';

type Mechanism = Pick<Scenario, 'nodes' | 'steps' | 'groups' | 'milestones'>;
const mechanism = (nodes: string[], groups: [string, number[]][], steps: Frame[], milestones: Milestone[] = []): Mechanism => ({
  nodes, steps, groups: groups.map(([label, nodes]): ParticipantGroup => ({ label, nodes })), milestones,
});

// Each sequence is a teaching path through asynchronous components, not a synchronous call stack.
export const MECHANISMS: Record<string, Mechanism> = {
  architecture: mechanism(
    ['kubectl', 'API Server', 'etcd', 'Deployment 控制器', 'ReplicaSet 控制器', '调度器', 'kubelet', '容器运行时', 'Pod / 容器'],
    [['操作端', [0]], ['控制平面', [1, 2, 3, 4, 5]], ['工作节点', [6, 7, 8]]], [
      ['声明应用目标', 0, 1, 'APPLY DEPLOYMENT', '假设权限、配额与清单有效。提交 Deployment，应用目标不会直接变成节点上的进程。', '请求已到达 API 入口', 'request'],
      ['认证、授权与准入', 1, 1, 'ADMISSION / VALIDATION', 'API 处理身份、权限、准入与对象校验；这些处理在持久化之前完成。', '本次请求通过检查', 'local'],
      ['持久化目标对象', 1, 2, 'PERSIST DEPLOYMENT', 'API Server 把接受的对象写入 etcd；etcd 不直接驱动节点或调度器。', 'Deployment 已保存 · Pod 尚未创建', 'data'],
      ['观察并协调 Deployment', 1, 3, 'WATCH DEPLOYMENT', 'Deployment 控制器经 API 观察目标，计算需要的 ReplicaSet。', '准备协调 ReplicaSet', 'data'],
      ['请求创建 ReplicaSet', 3, 1, 'CREATE REPLICASET', '控制器经 API 管理 ReplicaSet；ReplicaSet 与 Pod 是不同资源。', 'ReplicaSet 目标已提交', 'request'],
      ['副本控制器观察目标', 1, 4, 'WATCH REPLICASET', 'ReplicaSet 控制器观察副本目标与当前 Pod 数量。图中压缩了多次 API 读写。', 'desired > observed', 'data'],
      ['创建待调度 Pod', 4, 1, 'CREATE POD', 'ReplicaSet 控制器请求创建 Pod，对象仍需经过校验和持久化。', 'Pod 对象已创建 · Pending', 'request'],
      ['调度器发现待调度 Pod', 1, 5, 'WATCH UNSCHEDULED', '调度器通过 API 发现未绑定的 Pod，按资源与约束筛选节点。', '节点筛选与打分', 'data'],
      ['记录节点绑定', 5, 1, 'BIND NODE', '调度器经 API 记录选择结果；它不直接启动容器。', 'spec.nodeName 已设置', 'request'],
      ['节点观察分配结果', 1, 6, 'WATCH ASSIGNED POD', '目标节点 kubelet 观察到属于本节点的 Pod，准备网络、卷与运行条件。', '节点开始协调', 'data'],
      ['通过 CRI 驱动运行时', 6, 7, 'CRI · CREATE / START', 'CRI 是 kubelet 和容器运行时之间的接口；镜像、网络与存储仍可能阻止启动。', '正在创建容器', 'control'],
      ['运行与就绪分别检查', 7, 8, 'CONTAINER STARTED', '假设容器成功启动。Running 不保证 Ready，kubelet 还会检查并经 API 上报状态。', 'Running · Ready 另行观察', 'control'],
    ], [{ step: 0, node: 8, status: 'pending' }, { step: 10, node: 8, status: 'pending' }, { step: 11, node: 8, status: 'running' }]),
  api: mechanism(['资源清单', 'API Server', '认证 / 授权', '准入与校验', 'etcd', '控制器', '资源状态'], [['客户端', [0]], ['API 请求处理', [1, 2, 3, 4]], ['异步协调', [5, 6]]], [
    ['提交期望声明', 0, 1, 'APPLY MANIFEST', '客户端提交资源清单，API 是声明入口。', 'spec 等待接受', 'request'],
    ['验证请求身份与权限', 1, 2, 'AUTHENTICATE / AUTHORIZE', '先确认调用者是谁、能否执行该动作。', '身份与动作获准', 'check'],
    ['处理准入与对象约束', 1, 3, 'ADMIT / VALIDATE', '默认值、准入和对象约束检查在持久化前完成。', '对象可被接受', 'check'],
    ['保存期望状态', 1, 4, 'PERSIST SPEC', '保存成功只表示声明被接受，不代表应用健康。', 'spec 已持久化', 'data'],
    ['控制器观察变化', 1, 5, 'WATCH OBJECT', '控制器经 API 观察对象，再协调对应子资源。', '异步协调开始', 'data'],
    ['报告观测状态', 5, 1, 'UPDATE STATUS', '各组件经 API 写入状态与条件，可能存在观察延迟。', 'status 更新中', 'request'],
    ['对照目标与进展', 1, 6, 'READ CONDITIONS', '读取条件、事件和业务验证，分别判断接受、运行与就绪。', '验证收敛结果', 'data'],
  ]),
  reconcile: mechanism(['ReplicaSet 目标', 'API Server', '副本控制器', '原 Pod', '替代 Pod', '调度器', 'kubelet'], [['声明与协调', [0, 1, 2]], ['副本集合', [3, 4]], ['节点落实', [5, 6]]], [
    ['读取目标副本', 1, 2, 'WATCH REPLICASET', '假设目标为两个受管副本，原有两个 Pod。控制器通过 API 观察当前状态。', 'desired=2 · observed=2', 'data'],
    ['一个 Pod 被删除', 3, 1, 'POD DELETED', '独立演示受管 Pod 被删除；已消失的 Pod 不会以相同 UID 复活。', 'observed=1', 'data'],
    ['发现副本缺口', 1, 2, 'RECONCILE', '控制器依据所有权与活动 Pod 计算差额。', '缺少一个受管副本', 'data'],
    ['请求补建对象', 2, 1, 'CREATE REPLACEMENT', '控制器经 API 创建新 Pod；配额或准入仍可能拒绝。', '替代 Pod 已创建 · 新 UID', 'request'],
    ['选择新节点', 1, 5, 'SCHEDULE REPLACEMENT', '新 Pod 独立经过调度，不是把旧 Pod 搬过去。', '等待节点绑定', 'data'],
    ['节点协调新 Pod', 1, 6, 'OBSERVE BOUND POD', '此阶段假设调度已经 API 完成绑定，kubelet 开始创建新容器。', '替代 Pod 启动中', 'data'],
    ['替代副本运行', 6, 4, 'START NEW POD', '运行条件满足后新 Pod 运行，就绪仍要单独检查。', 'Running · 就绪另查', 'control'],
    ['再次观察副本集合', 1, 2, 'RECONCILE AGAIN', '控制器经 API 再次观察受管 Pod；副本数量收敛不等于业务数据恢复。', 'desired=2 · observed=2', 'data'],
  ], [{ step: 0, node: 3, status: 'ready' }, { step: 0, node: 4, status: 'pending' }, { step: 1, node: 3, status: 'removed' }, { step: 6, node: 4, status: 'running' }]),
  pod: mechanism(['Pod 对象', 'API Server', '调度器', 'kubelet', '容器运行时', '应用容器', '就绪检查'], [['声明与调度', [0, 1, 2]], ['工作节点', [3, 4]], ['运行状态', [5, 6]]], [
    ['接受 Pod 声明', 0, 1, 'CREATE POD', '此处直接创建裸 Pod，跳过 Deployment 与 ReplicaSet 控制器。', 'phase=Pending', 'request'],
    ['发现未绑定 Pod', 1, 2, 'WATCH UNSCHEDULED', '调度器观察没有 nodeName 的 Pod。', '等待调度', 'data'],
    ['保存绑定结果', 2, 1, 'BIND NODE', '可行节点经过筛选与打分后，绑定经 API 保存。', 'PodScheduled=True', 'request'],
    ['kubelet 观察分配', 1, 3, 'ASSIGNED POD', '目标节点准备卷、网络及容器运行所需条件。', 'Pending · 容器准备中', 'data'],
    ['调用容器运行时', 3, 4, 'CRI START', '运行时拉取镜像、创建并启动容器；这些步骤可能失败。', '容器创建中', 'control'],
    ['应用进程运行', 4, 5, 'CONTAINER RUNNING', '假设启动成功，Pod 可进入 Running，但此时不保证就绪。', 'Running · Ready=False', 'control'],
    ['检查就绪条件', 3, 6, 'READINESS PROBE', 'readiness 检查成功且其他就绪条件满足后，kubelet 才能报告 Ready。', '就绪条件满足', 'check'],
    ['回写 Pod 状态', 3, 1, 'UPDATE POD STATUS', 'kubelet 经 API 上报状态，控制面消费者随后观察变化。', 'Ready=True', 'request'],
  ], [{ step: 0, node: 5, status: 'pending' }, { step: 5, node: 5, status: 'running' }, { step: 7, node: 5, status: 'ready' }]),
  scheduling: mechanism(['待调度 Pod', '调度器', '节点 A', '节点 B', '节点 C', 'API Server', '目标 kubelet'], [['调度入口', [0, 1]], ['候选节点', [2, 3, 4]], ['绑定与执行', [5, 6]]], [
    ['观察待调度 Pod', 0, 1, 'UNSCHEDULED POD', '示意调度器经 API 观察未绑定 Pod。', '等待可行节点', 'data'],
    ['过滤标签不匹配节点', 1, 2, 'FILTER · SELECTOR', '示例节点 A 不满足 nodeSelector，被排除；过滤不是启动尝试。', 'A 不可行', 'check'],
    ['过滤资源不足节点', 1, 3, 'FILTER · REQUESTS', '示例节点 B 没有足够请求预算。空闲 CPU 不是唯一判断依据。', 'B 不可行', 'check'],
    ['为可行节点打分', 1, 4, 'SCORE FEASIBLE NODES', '示例节点 C 满足硬约束，进入评分；真实候选可以不止一个。', 'C 被选中', 'check'],
    ['通过 API 记录绑定', 1, 5, 'BIND NODE C', '调度器写入绑定，不直接在节点执行容器。', 'spec.nodeName=C', 'request'],
    ['节点观察绑定结果', 5, 6, 'WATCH ASSIGNED', 'kubelet 观察本节点 Pod 后继续协调运行。', '调度完成 · 启动另查', 'data'],
  ], [{ step: 1, node: 2, status: 'failed' }, { step: 2, node: 3, status: 'failed' }, { step: 3, node: 4, status: 'ready' }]),
  deployment: mechanism(['Deployment', 'Deployment 控制器', '旧 ReplicaSet', '新 ReplicaSet', '旧 Pod A', '旧 Pod B', '新 Pod A', '新 Pod B', 'Service 数据面'], [['发布目标', [0, 1]], ['副本控制', [2, 3]], ['应用与流量', [4, 5, 6, 7, 8]]], [
    ['修改 Pod 模板', 0, 1, 'CHANGE POD TEMPLATE', '经 API 观察到镜像等模板变化，触发新 revision；仅改变 replicas 不会触发新 revision。', '开始滚动更新', 'control'],
    ['协调新的 ReplicaSet', 1, 3, 'CREATE NEW REPLICASET', '图示控制关系经 API 完成；新旧 ReplicaSet 并存。', '旧副本仍提供服务', 'control'],
    ['创建首个新副本', 3, 6, 'SCALE NEW RS', '假设 maxSurge 允许增量，RS 控制器经 API 创建新 Pod，再经调度与节点启动。', '新 Pod A 启动中', 'control'],
    ['新副本就绪', 6, 8, 'READY ENDPOINT', '假设 readiness 成功；EndpointSlice 与数据面随后同步，新连接可选择它。', '新旧版本并存', 'control'],
    ['减少一个旧副本', 2, 4, 'SCALE DOWN OLD RS', '满足可用性预算后，旧 RS 减少一个副本，Pod 进入终止流程。', '旧 Pod A 退出', 'control'],
    ['创建第二个新副本', 3, 7, 'CREATE NEW POD B', '控制器持续协调；示意过程压缩了 API、调度与启动细节。', '新 Pod B 启动中', 'control'],
    ['第二个副本就绪', 7, 8, 'UPDATE READY ENDPOINTS', '就绪条件满足后端点集合更新；不表示既有连接被立即搬迁。', '两个新副本就绪', 'control'],
    ['最后一个旧副本退出', 2, 5, 'RETIRE OLD POD B', '达到目标可用副本后缩减旧 RS；旧 RS 可以按历史限制保留。', '滚动更新完成', 'control'],
  ], [{ step: 0, node: 4, status: 'ready' }, { step: 0, node: 5, status: 'ready' }, { step: 0, node: 6, status: 'pending' }, { step: 0, node: 7, status: 'pending' }, { step: 2, node: 6, status: 'running' }, { step: 3, node: 6, status: 'ready' }, { step: 4, node: 4, status: 'removed' }, { step: 5, node: 7, status: 'running' }, { step: 6, node: 7, status: 'ready' }, { step: 7, node: 5, status: 'removed' }]),
  service: mechanism(['客户端 Pod', '集群 DNS', 'API Server', 'Service 对象', '端点控制器', 'EndpointSlice', '节点数据面', '后端 Pod A', '后端 Pod B'], [['调用方', [0, 1]], ['服务发现控制面', [2, 3, 4, 5]], ['业务数据路径', [6, 7, 8]]], [
    ['声明 Service', 3, 2, 'SERVICE SELECTOR', '示意 Service 配置经 API 保存，selector 用于选择后端 Pod。', 'ClusterIP 与端口已声明', 'request'],
    ['观察后端条件', 2, 4, 'WATCH SERVICE / PODS', '端点控制器通过 API 观察 Service、Pod 标签及就绪条件。', '匹配两个就绪后端', 'data'],
    ['维护端点集合', 4, 5, 'UPDATE ENDPOINTSLICE', '控制器经 API 维护 EndpointSlice；对象不是每个请求的中转站。', 'A、B 为可用端点', 'control'],
    ['同步节点转发规则', 5, 6, 'SYNC DATA PLANE', 'kube-proxy 或替代实现经 API 观察发现信息，更新实际转发规则。', '规则同步完成', 'control'],
    ['先解析服务名称', 0, 1, 'DNS QUERY', '按名称访问时先查询集群 DNS；普通 Service 通常返回 ClusterIP。', '得到 Service ClusterIP', 'request'],
    ['发起业务连接', 0, 6, 'CONNECT CLUSTERIP', '业务请求进入节点数据面，不经 API Server 或 EndpointSlice 对象逐跳转发。', '选择可用后端', 'request'],
    ['连接后端 A', 6, 7, 'FORWARD TO POD A', '此连接被转发到 A；具体负载分配由实际数据面决定。', 'A 处理请求', 'data'],
    ['另一连接选择后端 B', 6, 8, 'ANOTHER CONNECTION', '示意另一新连接选择 B，不代表每次请求严格轮询，也不保证连接迁移。', 'B 处理另一连接', 'data'],
  ], [{ step: 0, node: 7, status: 'ready' }, { step: 0, node: 8, status: 'ready' }]),
  hpa: mechanism(['应用 Pod A', 'kubelet 指标', 'Metrics Server', '资源指标 API', 'HPA 控制器', 'Deployment scale', '副本控制器', '新增 Pod B', '新增 Pod C'], [['指标采集', [0, 1, 2, 3]], ['容量决策', [4, 5, 6]], ['副本变化', [7, 8]]], [
    ['观察应用负载', 0, 1, 'CPU USAGE', '示例假设 CPU request 已配置，当前一个副本，观测利用率 150%，目标 50%。', '当前副本=1', 'data'],
    ['采集节点资源指标', 1, 2, 'SCRAPE METRICS', 'Metrics Server 是需要部署的指标组件，采集 kubelet 暴露的资源指标。', '观测样本已采集', 'data'],
    ['提供资源指标 API', 2, 3, 'METRICS.K8S.IO', '指标经聚合 API 暴露；指标丢失不能当作 CPU 使用量为零。', '指标可读取', 'data'],
    ['HPA 读取观测值', 3, 4, 'READ METRICS', 'HPA 周期性读取指标，不是每个请求触发一次扩容。', 'utilization=150% · target=50%', 'data'],
    ['计算建议并应用约束', 4, 4, 'CEIL(1 × 150 / 50)', '基础算例得到 3；实际还受 min/max、容差、缺失样本和行为策略影响。此处假设允许扩到 3。', '建议副本=3', 'local'],
    ['更新目标 scale', 4, 5, 'PATCH SCALE = 3', 'HPA 通过 API 更新工作负载 scale，不直接创建 Pod。', '目标副本=3', 'request'],
    ['工作负载控制器协调', 5, 6, 'RECONCILE REPLICAS', 'Deployment / RS 控制器通过 API 观察新目标，再创建缺少的 Pod。', '缺少两个副本', 'control'],
    ['新增副本 B', 6, 7, 'CREATE POD B', '压缩 API、调度、镜像与节点启动过程；容量不足仍可能让 Pod Pending。', 'B 启动中', 'control'],
    ['新增副本 C', 6, 8, 'CREATE POD C', '新增副本分别完成调度、启动与就绪检查后才可服务。', 'C 启动中 · 就绪另查', 'control'],
    ['等待下一轮指标', 3, 4, 'NEXT CONTROL CYCLE', '扩容后继续观察；缩容还受稳定窗口等策略约束，教学阶段不表示真实耗时。', '继续观察容量与负载', 'data'],
  ], [{ step: 0, node: 0, status: 'ready' }, { step: 0, node: 7, status: 'pending' }, { step: 0, node: 8, status: 'pending' }, { step: 7, node: 7, status: 'running' }, { step: 8, node: 8, status: 'running' }]),
};

// Smaller topics keep their carefully authored original steps, with explicit missing roles added.
// Inserted stages point to real participants; there is no padding to a universal node/step count.
export const EXTENSIONS: Record<string, { nodes: string[]; before?: Frame[]; after: Frame[]; order?: number[] }> = {
  namespace: { order: [1, 0, 5, 2, 3, 4, 6], nodes: ['身份 / RBAC', 'LimitRange'], before: [ ['核对操作权限', 0, 4, 'AUTHORIZE REQUEST', '命名空间组织资源；请求是否允许仍由授权规则判断。', '需要命名空间内对应权限', 'check'] ], after: [ ['检查默认资源约束', 1, 5, 'LIMITRANGE', '若配置 LimitRange，可为容器设置默认资源值或约束；与总配额分工不同。', '默认值与范围另行检查', 'check'], ['确认管理边界', 1, 1, 'SCOPE ≠ ISOLATION', '命名空间不是自动网络隔离，仍需 RBAC、NetworkPolicy 等组合。', '命名边界不等于安全边界', 'local'] ] },
  labels: { order: [0, 4, 1, 2, 3, 5], nodes: ['端点控制器', 'API Server'], after: [ ['控制器观察标签变化', 5, 4, 'WATCH POD LABELS', 'EndpointSlice 控制器经 API 观察标签、Service selector 和 Pod 条件。', '准备重新计算端点', 'data'], ['同步端点成员', 4, 3, 'UPDATE MEMBERSHIP', '控制器经 API 更新端点集合；标签变化与数据面同步存在延迟。', '成员取决于选择器与条件', 'control'] ] },
  resources: { order: [1, 0, 2, 5, 3, 4], nodes: ['节点可分配量', '容器运行时'], before: [ ['读取节点预算', 4, 1, 'NODE ALLOCATABLE', '调度预算以节点可分配资源及已分配 requests 为基础，不直接等于实时空闲资源。', '对比 requests 与 allocatable', 'data'] ], after: [ ['落实容器资源约束', 5, 2, 'RUNTIME / CGROUP', 'kubelet 与运行时根据配置落实相应 cgroup 约束，具体能力依赖节点环境。', 'CPU 限流与内存终止语义不同', 'control'] ] },
  probes: { order: [0, 4, 1, 2, 5, 6, 3], nodes: ['应用容器', 'API Server', 'EndpointSlice'], after: [ ['持续检查应用', 0, 4, 'PROBE APPLICATION', 'startup 成功前不执行配置的 liveness 与 readiness；三种探针有不同后果。', '容器存活与就绪分别判断', 'check'], ['上报就绪变化', 0, 5, 'UPDATE POD READY', '此轮假设 readiness 从成功变为失败。kubelet 改变就绪条件，但不会因此重启容器。', 'Ready=False · 容器可仍 Running', 'request'], ['端点状态随之更新', 5, 6, 'ENDPOINT CONDITIONS', '端点控制器经 API 观察后维护就绪条件；默认新连接不会选择未就绪后端，特殊配置除外。', '就绪状态影响流量资格', 'control'] ] },
  statefulset: { order: [0, 1, 2, 4, 5, 6, 3], nodes: ['Pod web-1', '独立 PVC web-1', 'StatefulSet 控制器'], after: [ ['控制器观察首个副本', 2, 6, 'ORDERED READY', '在默认 OrderedReady 下等待前一个 Pod Running 且 Ready，然后再创建下一个。', 'web-0 满足顺序条件', 'control'], ['创建下一序号 Pod', 6, 4, 'CREATE WEB-1', '控制器经 API 创建 web-1；稳定身份不等于固定节点或固定 IP。', 'web-1 启动中', 'control'], ['使用各自独立的卷', 4, 5, 'VOLUME CLAIM TEMPLATE', '采用 volumeClaimTemplates 时，每个 Pod 获得各自的持久卷申领。', '每副本存储独立', 'control'] ] },
  daemonset: { order: [0, 1, 2, 4, 5, 3], nodes: ['新增节点', 'DaemonSet 控制器'], after: [ ['观察新增节点', 4, 5, 'WATCH NODE', '控制器经 API 观察节点，重新判断标签、污点与模板约束。', '新增节点符合条件', 'data'], ['补齐守护 Pod', 5, 2, 'CREATE DAEMON POD', '控制器为需要覆盖的节点创建 Pod，再由默认调度器等落实放置；不是每个节点必然都有。', '期望覆盖数变化', 'control'] ] },
  jobs: { order: [0, 1, 2, 3, 5, 4, 6], nodes: ['CronJob 控制器', 'Job 控制器', '后续计划 Job'], before: [ ['控制器评估计划', 0, 4, 'SCHEDULE CHECK', 'CronJob 控制器评估时区、并发与错过计划等条件；不能保证每个时刻恰好执行一次。', '计划允许创建 Job', 'control'] ], after: [ ['Job 控制器跟踪结果', 2, 5, 'OBSERVE COMPLETION', 'Job 控制器经 API 观察任务 Pod，结合 completions、parallelism 与失败策略推进。', '本次 Pod 成功 · 统计完成条件', 'control'], ['后续计划创建独立任务', 4, 6, 'NEXT SCHEDULE', '后续计划在并发和截止条件允许时创建独立 Job。重试与下一次计划不同；重复执行边界见故障场景。', '下一次运行使用新 Job', 'control'] ] },
  config: { nodes: ['API Server', '投射卷文件'], before: [ ['保存配置资源', 0, 4, 'CONFIG OBJECT', 'ConfigMap 与 Secret 经 API 管理；Secret 的 base64 编码不是加密。', '配置对象已接受', 'request'] ], after: [ ['更新普通投射文件', 1, 5, 'PROJECTED VOLUME', '普通投射卷可最终传播配置变化，但 subPath 挂载不自动获得此更新。', '文件更新具有延迟', 'control'], ['应用按需重新加载', 5, 3, 'RELOAD IF SUPPORTED', '文件变化不保证应用主动重读，环境变量也不会随对象变化自动更新。', '应用行为需另查', 'data'] ] },
  dns: { order: [0, 1, 2, 4, 3, 5], nodes: ['Service ClusterIP', '后端 Pod'], after: [ ['返回普通 Service 地址', 2, 4, 'DNS ANSWER · CLUSTERIP', '对普通 ClusterIP Service，DNS 通常返回虚拟 IP；Headless Service 的记录行为不同。', '解析成功不等于服务可用', 'data'], ['建立后续业务连接', 0, 5, 'CONNECT VIA SERVICE', '示意解析后的业务目标，实际经 Service 数据面转发；DNS 不代理业务请求。', '连通性仍取决于端点与网络', 'request'] ] },
  ingress: { order: [0, 5, 1, 2, 3, 4, 6], nodes: ['入口控制器', 'API Server', '后端 Pod'], before: [ ['提交路由规则', 2, 5, 'APPLY INGRESS / ROUTE', 'Ingress 或 Gateway API 资源先经 API 保存；创建规则不代表自动安装对应实现。', '路由配置已声明', 'request'] ], after: [ ['控制器同步入口配置', 5, 4, 'WATCH ROUTING RESOURCES', '匹配的控制器观察路由，验证引用与权限，并配置实际数据面。', '配置接受与生效分开观察', 'data'], ['数据面转发到应用', 1, 6, 'HTTP ROUTE MATCH', '图示将 Service 后端发现与转发压缩为一步；业务流量不经 API Server。', '检查路由、端口与就绪', 'request'] ] },
  storage: { order: [1, 0, 5, 2, 3, 6, 4], nodes: ['StorageClass', 'CSI 供给器', '后端存储'], before: [ ['读取供给策略', 0, 4, 'STORAGECLASS', 'PVC 指定或默认使用 StorageClass，bindingMode 可决定是否等待消费者。', '检查绑定模式与供给器', 'check'] ], after: [ ['请求实际后端卷', 5, 6, 'CSI CREATE VOLUME', '支持动态供给时，由 CSI 等存储实现请求后端创建卷。实际拓扑与配额仍可能阻止成功。', '供给成功后才能绑定', 'control'], ['落实节点挂载', 2, 3, 'NODE MOUNT', 'PV/PVC 绑定不等于节点一定挂载成功，还要检查访问模式、拓扑与驱动。', '应用可以访问挂载路径', 'control'] ] },
  'network-policy': { order: [0, 1, 2, 5, 3, 6, 4], nodes: ['NetworkPolicy', '支持策略的 CNI'], before: [ ['配置策略选择范围', 4, 5, 'ENFORCE POLICY', '策略资源需要支持 NetworkPolicy 的网络实现执行；创建对象本身不足以保证隔离。', '假设网络实现支持策略', 'control'] ], after: [ ['检查实际网络实现', 5, 3, 'VERIFY ENFORCEMENT', '从真实调用方验证源、目的和端口；被隔离的两端需要分别满足相关方向策略。', '规则并集 · 两端分别判断', 'check'], ['保留必要的 DNS 通路', 0, 0, 'DNS EGRESS', '启用出站隔离后，服务名查询也可能需要放行 DNS。', '名称解析与业务连通分开验证', 'local'] ] },
  rbac: { order: [0, 1, 2, 3, 5, 4, 6], nodes: ['ServiceAccount', '目标 API 资源'], before: [ ['明确工作负载身份', 4, 0, 'SERVICE ACCOUNT', 'Pod 可使用 ServiceAccount 身份，不能把用户权限与工作负载身份混为一谈。', '明确实际请求主体', 'control'] ], after: [ ['对资源与动作授权', 1, 5, 'VERB / RESOURCE / SCOPE', '匹配动作、API group、resource 与作用域；日志是 pods/log 子资源。', '权限只覆盖匹配动作', 'check'], ['使用同一身份核查', 0, 1, 'CAN-I', 'can-i 判断授权结果；它不替代准入校验、网络与实际业务检查。', '授权通过仍可能后续失败', 'request'] ] },
  'pod-security': { order: [1, 0, 2, 5, 3, 4, 6], nodes: ['命名空间标签', 'ReplicaSet 控制器'], before: [ ['选择命名空间安全级别', 4, 2, 'ENFORCE / AUDIT / WARN', 'Pod Security Admission 依据命名空间配置执行相应模式；警告不等于拒绝。', '以实际 enforce 设置为准', 'control'] ], after: [ ['控制器尝试创建 Pod', 5, 2, 'ADMIT CHILD POD', 'Deployment 模板被接受不保证后续 Pod 一定通过安全准入。', '子资源仍接受准入检查', 'request'], ['核查工作负载事件', 5, 5, 'OBSERVE CREATE RESULT', '本流程假设请求合规；仍需从 ReplicaSet 事件确认创建结果。若被拒绝，应查事件而非不存在的 Pod 日志。', '声明成功与子资源成功分开', 'local'] ] },
  observability: { order: [0, 1, 4, 2, 5, 3, 6], nodes: ['指标后端', '日志后端', 'API Server'], after: [ ['按标签聚合指标', 1, 4, 'METRICS OVER TIME', '若环境安装指标后端，可按时间窗与维度观察趋势；瞬时值不能解释所有故障。', '指标用于定位范围', 'data'], ['关联应用日志', 2, 5, 'LOG CORRELATION', '若部署了日志采集，按 Pod UID、容器与时间窗查询，避免把替代 Pod 的日志混入。', '日志用于理解上下文', 'data'], ['读取条件与事件', 6, 3, 'GET STATUS / EVENTS', '状态与事件来自 API 观测，事件有保留时间且不构成完整审计。', '多种证据互相验证', 'data'] ] },
  'pod-debug': { order: [0, 1, 4, 2, 5, 3, 6], nodes: ['节点 kubelet', '镜像 / 配置', '事件与日志'], after: [ ['检查节点创建条件', 4, 5, 'IMAGE / CONFIG / VOLUME', '已绑定却未启动时，检查拉取、配置引用与挂载；此阶段可能没有应用日志。', '按最后成功的环节缩小范围', 'check'], ['收集对应证据', 4, 6, 'EVENTS / PREVIOUS LOGS', '结合 describe 事件、容器状态和 previous 日志，不能把退避提示当根因。', '错误原因与时间窗对应', 'data'], ['修复后验证就绪', 6, 3, 'VERIFY READINESS', '保留证据再修正声明，持续检查就绪与业务结果；重启不是通用修复。', 'Running、Ready、业务分别验证', 'check'] ] },
  'service-debug': { order: [0, 1, 2, 4, 5, 6, 3], nodes: ['节点数据面', '网络策略', '应用监听端口'], after: [ ['检查转发规则同步', 1, 4, 'DATA PLANE SYNC', '解析与端点正确后，检查 kube-proxy 或替代数据面是否正常同步。', 'API 对象存在不等于转发生效', 'check'], ['检查双向策略约束', 0, 5, 'NETWORK POLICY', '从真实调用方测试；其出站与目标入站策略都可能阻断连接。', '按源、目的和端口验证', 'check'], ['核对应用真实监听', 3, 6, 'TARGET PORT / LISTEN', 'Service targetPort 应对应应用实际监听地址和端口；端点非空也可能拒绝连接。', '对比配置与实际进程', 'check'] ] },
  drain: { order: [0, 1, 4, 5, 6, 2, 3], nodes: ['工作负载控制器', '替代 Pod', '其他节点 kubelet'], after: [ ['控制器创建替代副本', 2, 4, 'RECONCILE AFTER EVICTION', '经 API 观察受管 Pod 被驱逐后，控制器创建新的 Pod，而非搬移原 Pod。', '替代 Pod 有新 UID', 'control'], ['调度到其他节点', 4, 5, 'NEW POD · NEW PLACEMENT', '压缩 API 与调度过程。容量、亲和性或存储约束都可能阻止替代副本运行。', '等待其他节点运行条件', 'control'], ['节点启动新副本', 6, 5, 'START REPLACEMENT', '满足运行条件后继续检查 Ready 和业务；DaemonSet 与静态 Pod 有各自边界。', '恢复取决于容量与健康', 'control'] ] },
  'backup-upgrade': { order: [2, 0, 1, 6, 3, 4, 7, 5], nodes: ['etcd 快照', '卷数据备份', '业务校验'], before: [ ['区分备份对象', 0, 4, 'CONTROL PLANE SNAPSHOT', 'etcd 快照覆盖控制面状态，不包含外部业务数据库与卷内容。', '控制面备份有明确范围', 'data'], ['单独保护业务数据', 1, 5, 'APPLICATION DATA BACKUP', '卷与数据库按各自一致性和恢复要求备份。', '数据备份需要独立方案', 'data'] ], after: [ ['执行恢复演练验收', 2, 6, 'RESTORE VERIFICATION', '在隔离环境验证对象、权限、业务数据及依赖；文件存在不代表可恢复。', '以恢复演练验证备份', 'check'], ['检查升级兼容约束', 3, 3, 'VERSION SKEW / RELEASE NOTES', '实际升级遵循发行版流程、版本偏差与插件兼容要求，不从教学图直接执行。', '先验证备份与升级前提', 'local'] ] },
};
