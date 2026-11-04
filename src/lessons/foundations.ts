import { sh, yaml, type Lesson } from '../course-types';

export const foundations: Lesson[] = [
  {
    id: 'architecture', group: 0, title: '集群架构与组件', en: 'CLUSTER ARCHITECTURE',
    summary: '从提交一个 Pod 开始，分清 API Server、控制器、调度器与 kubelet 的职责。',
    principle: '控制面通过 API 协作，节点上的 kubelet 才驱动容器运行时运行容器。',
    tradeoff: '组件分工让系统可以独立扩展与恢复，也使一次操作需要跨越多个异步环节。',
    pitfall: 'API 返回成功只说明对象已被接受；不代表 Pod 已调度、镜像已拉取或应用已就绪。',
    nodes: ['kubectl', 'API / etcd', '调度器', 'kubelet / CRI'],
    steps: [
      ['提交 Pod 声明', 0, 1, 'CREATE POD', '假设集群可用且用户有权限。kubectl 请求 API Server 创建 Pod，经过校验后保存到后端存储。', '对象已保存 · 尚未运行', 'request'],
      ['发现未绑定 Pod', 1, 2, 'WATCH UNSCHEDULED', '调度器通过 API 观察尚未绑定节点的 Pod，而不是由 kubectl 直接选择一台机器。', '等待调度决策', 'data'],
      ['记录节点绑定', 2, 1, 'BIND NODE', '调度器筛选与打分后，通过 API 记录绑定结果；这里省略候选节点以聚焦职责。', 'spec.nodeName 已设置', 'control'],
      ['节点驱动运行', 1, 3, 'OBSERVE ASSIGNED POD', '目标节点的 kubelet 观察到分配给自己的 Pod，通过 CRI 驱动运行时，并上报状态；就绪还需后续检查。', '已分配到节点 · 就绪另行判断', 'control'],
    ],
    code: ['kubectl → API Server：提交对象', 'API Server → etcd：持久化', 'scheduler → API Server：记录绑定', 'kubelet → CRI：协调容器运行'],
    example: sh('观察控制面与节点', '需要可访问的实验集群；托管集群可能不展示控制面 Pod，不能据此判断组件缺失。', `kubectl cluster-info
kubectl get nodes -o wide
kubectl -n kube-system get pods
kubectl -n demo get pods -o wide`, '节点列表显示状态与版本；demo Pod 的 NODE 列可与调度结果对应。'),
    sections: [
      { title: '控制面保存目标，节点落实目标', body: 'API Server 提供资源读写入口，etcd 保存集群状态。调度器负责选择节点，控制器负责各类资源的控制循环。kubelet 管理节点上的 Pod，容器运行时负责容器执行；CNI、CSI 等扩展承担相应网络与存储工作。' },
      { title: '控制路径与业务路径分开', body: '请求应用 Service 的业务流量通常不经过 API Server。Service 的转发可能由 kube-proxy 或替代数据面实现；API 保存配置与发现信息，不替每个请求做业务代理。' },
      { title: '先找到卡住的环节', body: '对象不存在先查请求与权限；没有节点绑定查调度事件；已绑定但容器未创建查 kubelet、运行时、镜像和挂载。组件职责是排查顺序的依据，四个图解节点只是逻辑角色。' },
    ], sources: ['architecture', 'pods'], related: ['api', 'reconcile', 'scheduling', 'pod'],
    fault: {
      name: 'API 可用，镜像拉取失败', nodes: ['Pod 声明', '调度绑定', 'kubelet / CRI', '镜像仓库'],
      steps: [
        ['确认对象已存在', 0, 0, 'POD CREATED', '独立场景：Pod 对象已创建，镜像地址不存在。API 接受声明时不会预先验证镜像能否拉取。', '存在对象 ≠ 容器运行', 'local'],
        ['Pod 成功分配节点', 1, 2, 'ASSIGNED', '调度没有发现资源或约束冲突，节点开始处理该 Pod。', 'PodScheduled=True', 'control'],
        ['仓库拒绝拉取', 2, 3, 'IMAGE PULL ERROR', '运行时请求镜像失败，常见原因包括地址错误、凭据错误或网络不可达。', 'ErrImagePull / ImagePullBackOff', 'reject'],
        ['保留错误证据', 2, 2, 'BACKOFF', '节点稍后会重试；应查看事件定位原因，不能因为 API 健康就判定整个集群运行正常。', '调度成功 · 容器尚未启动', 'local'],
      ], code: ['检查 Pod 的 nodeName', '读取 Events 的拉取错误', '核对镜像地址、凭据与仓库连通性', '修正声明后观察新事件'],
      example: sh('定位镜像问题', '将 POD 替换为 demo 中真实的异常 Pod 名；不通过删除 Pod 掩盖首次失败证据。', `POD=replace-me
kubectl -n demo get pod "$POD" -o wide
kubectl -n demo describe pod "$POD"`, '查看 Events 中 Failed、BackOff 的具体原因；没有运行过的容器通常没有应用日志。'),
    },
  },
  {
    id: 'api', group: 0, title: '声明式 API 与对象', en: 'DECLARATIVE API',
    summary: '用清单描述目标，通过 spec 与 status 的区别判断“接受了”与“完成了”。',
    principle: 'spec 是期望，status 是观测；声明式管理依赖持续收敛。',
    tradeoff: '可重复声明便于审查与自动化，但多方修改同一字段时需要明确字段所有权和变更来源。',
    pitfall: 'apply 成功不会等待应用健康；--dry-run=server 也不会真正创建 Pod 或运行容器。',
    nodes: ['资源清单', 'API Server', '已存对象', '控制器'],
    steps: [
      ['提交期望状态', 0, 1, 'APPLY MANIFEST', '假设清单格式正确且请求有权限。客户端把清单提交给 API，而不是直接在节点执行脚本。', '请求正在验证', 'request'],
      ['保存声明', 1, 2, 'PERSIST SPEC', 'API 执行默认值、准入和校验等处理后保存对象。此刻不能推断业务可用。', 'spec 已更新', 'data'],
      ['观察新目标', 2, 3, 'OBSERVE CHANGE', '控制器通过 API 观察资源变化并尝试协调对应子资源。', '目标与现状可能不同', 'control'],
      ['观察收敛结果', 3, 2, 'UPDATE STATUS', '组件回写条件与状态。学习者需要结合资源条件、事件和业务检查验证结果。', 'status 反映观测进展', 'data'],
    ], code: ['声明 desired spec', 'API 验证并保存', '控制器协调资源', '读 status / conditions 验证进展'],
    example: sh('预检清单并观察结果', '已下载入门实验清单为 lab.yaml。第一行会创建或更新 demo 命名空间；服务端预检不会创建它，因此须先完成该准备。需要相应权限及支持 dry-run 的准入组件。', `kubectl create namespace demo --dry-run=client -o yaml | kubectl apply -f -
kubectl apply --dry-run=server -f lab.yaml
kubectl diff -f lab.yaml
kubectl apply -f lab.yaml
kubectl -n demo rollout status deployment/web --timeout=120s`, 'diff 退出码 1 表示存在差异；rollout status 的成功是 Deployment 进度检查，不替代业务验收。'),
    sections: [
      { title: '对象身份不是只有名字', body: 'apiVersion、kind、metadata、spec 共同描述资源。命名空间内同一种资源的名字唯一，UID 区分同名对象的不同生命周期。status 通常由系统组件写入，不能把它当作用户的目标声明。' },
      { title: '校验与执行是不同阶段', body: 'server dry-run 可以经过服务端校验与准入，但不持久化资源，也不会验证镜像可拉取、卷可挂载或 HTTP 接口可工作。声明被接受后，仍有异步控制环节可能失败。' },
      { title: '管理字段需要协作约定', body: 'Server-Side Apply 记录字段管理者。多个工具争用字段时可能出现冲突；在不了解来源前强制接管字段会覆盖别人的配置。应先检查 managedFields、提交差异与自动化控制器。' },
    ], sources: ['api', 'apply'], related: ['reconcile', 'deployment', 'rbac'],
    fault: {
      name: '缺少字段，声明被拒绝', nodes: ['无效清单', 'API 校验', '持久化存储', '控制器'],
      steps: [
        ['提交无效对象', 0, 1, 'INVALID MANIFEST', '独立场景：新建 Deployment 时模板标签与 selector 不匹配。', '请求尚未持久化', 'request'],
        ['服务端验证失败', 1, 1, 'VALIDATION FAILED', 'API 检查 selector 必须匹配 Pod 模板标签等约束，不能接受该对象。', 'Invalid', 'local'],
        ['返回明确错误', 1, 0, '422 INVALID', '调用方收到字段路径与错误原因。控制器没有收到一个成功创建的该对象。', '本次创建未成功', 'reject'],
        ['修正后再提交', 0, 0, 'FIX AND RETRY', '保留原始错误，对齐 selector 与模板标签后重新执行 dry-run；不要把校验错误当作节点问题。', '待修正清单', 'local'],
      ], code: ['读取错误字段路径', '比对 selector 和 template.labels', '修正本地清单', '再次执行 server dry-run'],
      example: sh('查询字段约束', 'kubectl 能访问集群 OpenAPI；把待检查 Deployment 清单保存为 deployment.yaml。', `kubectl explain deployment.spec.selector
kubectl explain deployment.spec.template
kubectl apply --dry-run=server -f deployment.yaml`, '命令显示字段说明；无效清单会返回校验错误，不创建资源。'),
    },
  },
  {
    id: 'reconcile', group: 0, title: '控制循环与自愈', en: 'RECONCILIATION LOOP',
    summary: '理解控制器如何反复观察差异，以及“自愈”为什么需要资源、权限和依赖条件。',
    principle: '控制器不断缩小期望与现状的差距；每次协调都可能需要重试。',
    tradeoff: '最终收敛可以容忍临时故障，代价是中间状态、观察延迟和反复重试。',
    pitfall: '控制器补建的是新 Pod；它不会让已经消失的 Pod 以相同 UID 复活，也不保证业务数据自动恢复。',
    nodes: ['期望副本 2', 'ReplicaSet 控制器', 'Pod 集合', 'API Server'],
    steps: [
      ['观察受管资源', 0, 1, 'DESIRED=2', '假设 ReplicaSet 目标副本为 2，当前只有一个受它管理的活动 Pod。', 'desired=2 · observed=1', 'control'],
      ['比较副本差额', 1, 2, 'OBSERVE PODS', '控制器基于观察到的资源身份、所有权和删除状态判断差额。图中集合不是一台服务器。', '缺少一个 Pod', 'check'],
      ['请求创建新 Pod', 1, 3, 'CREATE REPLACEMENT', '控制器向 API 发起创建请求；API 接受后，调度与节点执行继续推进。', '已请求补建', 'request'],
      ['再次观察现状', 2, 1, 'RECONCILE AGAIN', '后续观察确认有两个活动 Pod；就绪和业务健康仍需各自条件，不由数量代替。', '副本数收敛 · 就绪另查', 'data'],
    ], code: ['desired = ReplicaSet.spec.replicas', 'observed = controlled active Pods', 'if observed < desired: request new Pods', '再次观察，失败则有节制地重试'],
    example: sh('观察期望与实际副本', '已应用 lab.yaml，demo/web Deployment 目标为 2；这里只观察，不主动制造故障。', `kubectl -n demo get deployment web
kubectl -n demo get replicasets
kubectl -n demo get pods -l app=web -w`, 'Deployment、ReplicaSet 与 Pod 是不同资源；最后一条持续观察，可按 Ctrl+C 结束。'),
    sections: [
      { title: '控制器对资源负责', body: 'Deployment 管理 ReplicaSet，ReplicaSet 管理 Pod 副本。观察事件是推进协调的线索，控制器仍要读取当前状态再决定动作；不能把每个事件机械地映射为一次创建。' },
      { title: '幂等与重试', body: '网络超时、冲突与临时依赖错误可能反复出现。控制循环必须能够在已经部分完成的状态下继续工作，而不是每次从零假设。自定义控制器同样需要考虑重复协调与业务副作用。' },
      { title: '自愈有条件', body: '权限不足、配额耗尽、调度无解或镜像失败都会阻止收敛。直接创建的裸 Pod 被删除后没有工作负载控制器负责补建；容器在原 Pod 内重启则是 kubelet 层面的另一种恢复。' },
    ], sources: ['controllers', 'deployment', 'lifecycle'], related: ['api', 'pod', 'deployment', 'observability'],
    fault: {
      name: '想补副本，却被配额拦住', nodes: ['期望副本', '副本控制器', 'API / 配额', '受管 Pod'],
      steps: [
        ['现有副本不足', 0, 1, 'DESIRED > OBSERVED', '独立场景：目标为两个副本，只有一个 Pod，而命名空间 Pod 配额已被其他负载占满。', '需要创建替代 Pod', 'control'],
        ['尝试补建', 1, 2, 'CREATE POD', '控制器按目标发起创建请求，不能绕过准入与命名空间配额。', '等待准入结果', 'request'],
        ['配额拒绝创建', 2, 1, 'EXCEEDED QUOTA', 'API 拒绝请求，ReplicaSet 事件可能出现 FailedCreate。新 Pod 尚不存在，不属于 Pending 调度失败。', '副本缺口仍在', 'reject'],
        ['定位约束再处理', 1, 1, 'RETRY AFTER DIAGNOSIS', '检查配额与消耗方，调整需求或合理释放资源。控制器重试不能创造无限容量。', '自愈受配额约束', 'local'],
      ], code: ['检查 ReplicaSet FailedCreate 事件', '读取 ResourceQuota 当前用量', '与目标副本对应的资源需求比较', '修正约束后重新观察'],
      example: sh('分清创建失败与调度失败', '已部署 demo/web；若存在配额问题，ReplicaSet 事件比不存在的 Pod 更有诊断价值。', `kubectl -n demo describe deployment web
kubectl -n demo describe replicasets
kubectl -n demo describe resourcequota`, 'FailedCreate 表示创建环节失败；没有配额对象时 describe 会提示没有资源。'),
    },
  },
  {
    id: 'pod', group: 0, title: 'Pod 与容器生命周期', en: 'POD LIFECYCLE',
    summary: '把 Pod 阶段、容器状态、重启次数和 Ready 条件分别读懂。',
    principle: 'Pod 是调度与共享网络的单元；容器是其中运行和重启的单元。',
    tradeoff: '同 Pod 容器方便共享网络与卷，也绑定了调度、生命周期和资源故障边界。',
    pitfall: 'Running 不等于 Ready；CrashLoopBackOff 是 kubectl 可能显示的容器等待原因，不是 Pod phase。',
    nodes: ['Pod 对象', '调度绑定', 'kubelet', '容器 / 探针'],
    steps: [
      ['创建待运行 Pod', 0, 0, 'PENDING', '假设直接创建一个有效 Pod。Pending 可包含等待调度、拉取镜像等时间，不只是没有节点。', 'phase=Pending', 'local'],
      ['绑定目标节点', 1, 2, 'POD SCHEDULED', '节点 kubelet 接管分配给自己的 Pod，准备网络、卷和容器运行条件。', 'PodScheduled=True', 'control'],
      ['启动容器', 2, 3, 'START CONTAINER', '运行时启动容器后，Pod 可进入 Running；探针或其他就绪条件仍可能未满足。', 'Running · Ready 可能为 False', 'control'],
      ['报告就绪条件', 3, 2, 'READINESS OK', '假设所有相关容器和就绪门满足条件，kubelet 更新 Pod Ready。这里只描述此刻的就绪观察。', 'Ready=True', 'data'],
    ], code: ['读 .status.phase', '读 .status.conditions', '读 containerStatuses[*].state', '区分容器重启和 Pod 替换'],
    example: yaml('一个完整的 Pod 清单', 'demo 命名空间已存在，实验集群可拉取 nginx:1.28；保存为 pod.yaml 后 kubectl apply -f pod.yaml。', 'pod.yaml', `apiVersion: v1
kind: Pod
metadata:
  name: lifecycle-demo
  namespace: demo
spec:
  containers:
    - name: web
      image: nginx:1.28
      ports:
        - containerPort: 80
      readinessProbe:
        httpGet:
          path: /
          port: 80`, 'Pod 最终应 Running 且 Ready；裸 Pod 被删除后不会由 Deployment 自动补建。'),
    sections: [
      { title: '同一个 Pod 共享什么', body: 'Pod 内容器共享网络命名空间和 IP，可通过 localhost 通信，并可显式挂载共享卷。它们仍是独立容器，默认并不等于共享全部进程视图或文件系统。' },
      { title: '重启与替换', body: '容器退出后，kubelet 按 restartPolicy 等条件处理重启；Pod UID 不因此变化。工作负载控制器创建替代 Pod 时会产生新的 UID，可能获得不同节点和 IP。不能把 IP 当作永久身份。' },
      { title: '读取完整状态', body: 'phase 只有粗粒度描述，conditions 表达调度和就绪等判断，containerStatuses 提供 Waiting、Running、Terminated 与 lastState。结合事件和日志才能判断故障原因，单个 STATUS 列不够。' },
    ], sources: ['pods', 'lifecycle'], related: ['probes', 'reconcile', 'pod-debug', 'resources'],
    fault: {
      name: '容器反复退出', nodes: ['应用进程', '容器状态', 'kubelet', '同一个 Pod'],
      steps: [
        ['进程退出', 0, 1, 'EXIT CODE ≠ 0', '独立场景：restartPolicy=Always 的 Pod 内应用启动即退出，退出原因可能是配置错误。', 'container=Terminated', 'data'],
        ['节点决定重启', 1, 2, 'RESTART POLICY', 'kubelet 根据重启策略尝试重启该容器，并对重复失败使用退避。', 'restartCount 上升', 'control'],
        ['保持 Pod 身份', 2, 3, 'SAME POD UID', '重启的是原 Pod 内的容器，而不是调度器把旧 Pod 搬到另一台节点。', 'Pod UID 不变', 'control'],
        ['调查上一次退出', 1, 1, 'LAST STATE / PREVIOUS LOG', '结合退出码、reason、previous 日志与事件找原因。退避状态不是根因，重启次数也不能解释业务错误。', 'CrashLoopBackOff 只是线索', 'local'],
      ], code: ['观察 restartCount 和 lastState', '读取容器上一次运行日志', '检查启动参数与配置', '修正原因后验证持续健康'],
      example: sh('读取上一次容器日志', '将 POD 替换为 demo 中有重启记录的 Pod，容器名假设为 web；首次未启动时没有 previous 日志。', `POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo logs "$POD" -c web --previous --tail=100`, 'previous 日志来自上一实例；日志可因轮转或节点变化不可用，需与状态和事件互证。'),
    },
  },
  {
    id: 'namespace', group: 0, title: 'Namespace 与配额', en: 'NAMESPACE & QUOTA',
    summary: '用命名空间组织资源，用配额限制消耗，避免把命名隔离误当作安全隔离。',
    principle: 'Namespace 划分命名和管理范围；安全与网络隔离需要额外策略。',
    tradeoff: '细分命名空间便于授权和配额管理，也增加跨空间配置、发现和维护成本。',
    pitfall: 'Node、PV 和 Namespace 等是集群作用域资源；Namespace 本身不会阻止跨空间网络通信。',
    nodes: ['用户请求', 'API / Namespace', 'ResourceQuota', '命名空间资源'],
    steps: [
      ['指定资源归属', 0, 1, 'NAMESPACE=DEMO', '假设 demo 已存在，用户创建命名空间作用域的对象。显式 -n 可避免误用当前上下文。', '请求目标=demo', 'request'],
      ['检查资源用量', 1, 2, 'ADMISSION CHECK', '如果存在匹配配额，准入根据当前已用量与请求检查限额。权限判断是另一层。', '检查 hard / used', 'check'],
      ['允许创建对象', 1, 3, 'CREATE IN DEMO', '假设权限和配额均满足，资源在 demo 中创建；另一个命名空间可存在同名同类对象。', '同空间同类型名字唯一', 'data'],
      ['观察空间内资源', 3, 3, 'LIST SCOPED RESOURCES', '用 -n demo 查询资源，再用 -A 对比。命名空间不会自动形成网络边界。', '管理边界已明确', 'local'],
    ], code: ['明确资源是否 namespaced', '指定 namespace', '检查权限、Quota 与 LimitRange', '按作用域查询和管理'],
    example: yaml('一个受限的实验命名空间', '完整多文档清单；已有实验 Pod 时，创建配额不会驱逐它们，但会限制后续创建。', 'namespace.yaml', `apiVersion: v1
kind: Namespace
metadata:
  name: quota-lab
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: object-budget
  namespace: quota-lab
spec:
  hard:
    pods: "4"
    services: "2"`, 'kubectl -n quota-lab describe quota 显示 Hard 与 Used；此清单未配置网络隔离。'),
    sections: [
      { title: '命名边界', body: 'Pod、Deployment、Service 等属于命名空间，Node、PV、StorageClass 等属于集群。不能用 -n 把一个集群作用域对象变成局部对象。可用 api-resources 查询资源是否支持命名空间。' },
      { title: '配额与默认值分工', body: 'ResourceQuota 限制空间内资源总量或对象数；LimitRange 可以提供默认值或范围约束。若配额要求 requests/limits，未声明且没有默认值的 Pod 可能在创建时被拒绝。' },
      { title: '隔离是组合能力', body: '多人共享集群通常还需要 RBAC、NetworkPolicy、Pod 安全约束等。命名空间适合组织团队和环境，但管理员权限、集群级资源与共享节点仍需单独设计。' },
    ], sources: ['namespace', 'quota'], related: ['rbac', 'network-policy', 'resources', 'reconcile'],
    fault: {
      name: '资源在，却查错空间', nodes: ['kubectl 上下文', 'default 空间', 'demo 空间', '目标 Deployment'],
      steps: [
        ['使用默认查询范围', 0, 1, 'GET DEPLOYMENT', '独立场景：web 在 demo，当前上下文使用 default。普通 get 请求只查询当前命名空间。', '查询 namespace=default', 'request'],
        ['目标未在范围内', 1, 1, 'NOT FOUND', '返回 NotFound 不表示整个集群没有名为 web 的 Deployment。', '当前范围没有对象', 'local'],
        ['显式选择 demo', 0, 2, 'GET -N DEMO', '先核对 context 的集群和身份，再明确命名空间重新查询，避免对错误环境做修改。', '查询 namespace=demo', 'request'],
        ['定位真实对象', 2, 3, 'FOUND WEB', '找到目标后再开始诊断；权限不足还可能造成其他查询错误，不能一概归因为空间。', '对象身份已确认', 'data'],
      ], code: ['核对 current-context', '查看 namespace 设置', '显式 -n demo 查询', '确认后才修改资源'],
      example: sh('确认查询范围', '只读命令；-A 的可见性受当前身份权限限制，不输出 kubeconfig 凭据。', `kubectl config current-context
kubectl get deployments -A
kubectl -n demo get deployment web
kubectl api-resources --namespaced=false`, '对比资源的 NAMESPACE 列，识别集群级与命名空间级资源。'),
    },
  },
  {
    id: 'labels', group: 0, title: '标签与选择器', en: 'LABELS & SELECTORS',
    summary: '通过集合匹配把工作负载、Pod 和 Service 关联起来，而不是靠对象名称猜关系。',
    principle: '标签描述属性，选择器定义集合；匹配结果决定关联对象。',
    tradeoff: '松耦合的标签支持灵活分组，但随意修改标签会改变流量、策略与控制器可见集合。',
    pitfall: 'Service selector 匹配的是 Pod 标签，不是 Deployment 的 metadata.labels，也不是容器名。',
    nodes: ['Service selector', 'Pod 标签集合', '匹配的 Pod', 'EndpointSlice'],
    steps: [
      ['声明标签条件', 0, 0, 'SELECT app=web', '假设 Service 与 Pod 同在 demo，Service 选择 app=web。', 'selector 已定义', 'local'],
      ['对照 Pod 标签', 0, 1, 'MATCH POD LABELS', '控制器根据 selector 匹配当前命名空间内的 Pod。名称包含 web 不构成匹配依据。', '按标签决定集合', 'check'],
      ['收集匹配对象', 1, 2, 'MATCHED PODS', '匹配集合还会随标签、Pod 生命周期和就绪状态变化。', '已找到候选后端', 'data'],
      ['更新服务端点', 2, 3, 'UPDATE ENDPOINTS', '对于有 selector 的常见 Service，EndpointSlice 控制器据此维护端点及相应条件。', '流量候选取决于端点条件', 'control'],
    ], code: ['读取 Service.spec.selector', '检查 Pod.metadata.labels', '按相同 selector 查询 Pod', '检查 EndpointSlice.conditions'],
    example: sh('把选择器与端点对起来', '已应用 lab.yaml；Service web 选择 app=web。', `kubectl -n demo get service web -o yaml
kubectl -n demo get pods -l app=web --show-labels
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml`, '核对 selector、Pod 标签、端点 targetRef 和 ready 条件；不能仅比较资源名字。'),
    sections: [
      { title: '模板标签才会传给 Pod', body: 'Deployment 顶层标签用于描述 Deployment 自身，spec.template.metadata.labels 才定义新 Pod 标签。Deployment 的 selector 必须匹配模板，并且已有 Deployment 的 selector 通常不可变。' },
      { title: '选择器是实时关系', body: '多个标签条件通常组成 AND。更改 Pod 标签可让其进入或离开某个 Service 或 NetworkPolicy 的选择范围，因此标签变更也可能改变行为和安全边界。' },
      { title: '选择器不是所有权', body: '匹配 Service 的 Pod 不归 Service 管理。工作负载所有权需要 ownerReferences 等机制表达；观察到相同标签不能推断哪个控制器负责删除或补建对象。' },
    ], sources: ['labels', 'service', 'endpoints'], related: ['service', 'deployment', 'network-policy', 'service-debug'],
    fault: {
      name: 'Service 标签拼错', nodes: ['Service app=weeb', 'Pod app=web', 'EndpointSlice', '客户端'],
      steps: [
        ['声明了错误选择器', 0, 1, 'SELECTOR MISMATCH', '独立场景：Service selector 拼为 app=weeb，而实际 Pod 为 app=web。', '匹配集合为空', 'check'],
        ['没有匹配后端', 2, 2, 'NO MATCHED ENDPOINTS', '常规选择器控制器无法为它生成匹配的可用后端；Pod 自身可能完全健康。', '服务没有可用目标', 'local'],
        ['请求仍发向服务', 3, 0, 'CONNECT SERVICE', 'DNS 可能正常返回 ClusterIP，但有地址不表示有可用后端。', '服务访问失败', 'request'],
        ['对照而非重启', 0, 1, 'COMPARE LABELS', '检查 selector 与模板标签并修正声明。重启健康 Pod 不会把 weeb 自动改成 web。', '根因在关联条件', 'check'],
      ], code: ['服务 DNS 正常也要查后端', '比对 selector 与 Pod 标签', '修正源清单中的拼写', '观察端点再验证访问'],
      example: sh('查看匹配集合', '已有 demo/web Service；标签选择查询为空时先核对源清单，不直接修改所有 Pod 标签。', `kubectl -n demo get pods -l app=weeb
kubectl -n demo get pods --show-labels
kubectl -n demo get deployment web -o yaml`, '错误 selector 的查询为空；模板标签与实际 Pod 标签可交叉核对。'),
    },
  },
  {
    id: 'scheduling', group: 0, title: '调度与节点约束', en: 'SCHEDULING & PLACEMENT',
    summary: '理解调度器如何在资源请求、节点选择、亲和性和污点等约束中寻找可行节点。',
    principle: '先满足硬约束，再在可行节点中选择；容忍污点不代表一定会被调度。',
    tradeoff: '严格约束提高放置确定性，也缩小可用容量和故障时的替代空间。',
    pitfall: '调度主要依据资源 requests 与约束，不是看到节点当前 CPU 空闲就一定能放下 Pod。',
    nodes: ['未绑定 Pod', '调度器', '候选节点', 'API 绑定'],
    steps: [
      ['读取放置需求', 0, 1, 'UNSCHEDULED POD', '假设 Pod 声明了资源 requests 与 nodeSelector，尚未设置 nodeName。', '等待一次调度尝试', 'data'],
      ['筛选可行节点', 1, 2, 'FILTER', '检查请求资源、选择器、污点、卷约束等；实际调度框架还有更多插件与阶段。', '得到可行节点集合', 'check'],
      ['比较候选偏好', 2, 1, 'SCORE', '在满足约束的节点中根据配置的评分策略做选择，而不是简单选 CPU 使用率最低者。', '选择一个候选', 'data'],
      ['写入节点绑定', 1, 3, 'BIND', '调度器通过 API 完成绑定；容器启动由目标节点处理，不是调度器运行镜像。', 'nodeName 已确定', 'control'],
    ], code: ['读取 Pod 约束与 requests', '过滤不满足硬条件的节点', '对可行节点打分', '通过 API 绑定，等待 kubelet'],
    example: sh('读取 FailedScheduling 证据', '将 POD 替换为实际待调度 Pod；节点详情可能包含集群运维信息，仅在自己实验集群查看。', `POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl get nodes --show-labels
kubectl describe nodes`, 'Events 说明资源不足、选择器不匹配或污点等原因；Allocated resources 可与实时使用率对照。'),
    sections: [
      { title: 'requests 决定能否放下', body: '调度把请求资源与节点可分配容量及已有请求比较。资源实际使用率很低也可能没有足够未分配 requests。CPU 和内存之外，端口、卷、拓扑及其他资源同样可能成为硬约束。' },
      { title: '硬条件与软偏好', body: 'nodeSelector 与 required 亲和性限制可行节点；preferred 亲和性表达偏好。NoSchedule 污点会排斥缺少相应容忍的 Pod，而容忍只取消这种排斥，并不指定目标节点。' },
      { title: '不要靠 nodeName 绕过理解', body: '直接指定 nodeName 会绕过常规调度选择，不应作为解决 FailedScheduling 的通用办法。先看事件、标签、可分配资源与实际配置；扩容也必须满足所有硬约束。' },
    ], sources: ['scheduling', 'taints', 'resources'], related: ['resources', 'architecture', 'pod-debug', 'drain'],
    fault: {
      name: '节点很多，却没有候选', nodes: ['nodeSelector', '调度器', '节点标签', 'Pod 事件'],
      steps: [
        ['要求不存在的标签', 0, 1, 'disk=ultra', '独立场景：Pod 要求 disk=ultra，而所有节点都没有这个标签。', '存在硬性放置条件', 'control'],
        ['筛选结果为空', 1, 2, 'NO MATCHING NODE', '即使节点 CPU 和内存充足，不满足 nodeSelector 的节点也不能成为候选。', '0 feasible nodes', 'check'],
        ['记录失败事件', 1, 3, 'FAILED SCHEDULING', '调度器报告原因，Pod 继续等待后续重试；没有绑定便没有目标节点启动容器。', 'Pending · 无 nodeName', 'data'],
        ['修正约束来源', 0, 0, 'REVIEW INTENT', '判断确实需要这类节点还是清单有误。不要随意给节点贴标签伪装硬件能力。', '先确认放置意图', 'local'],
      ], code: ['读 FailedScheduling 事件', '比较 nodeSelector 与实际节点标签', '核实标签代表的真实能力', '修正需求或提供合适节点'],
      example: sh('对照节点选择条件', 'POD 为待调度的真实 Pod；这里只观察标签，不更改节点能力声明。', `POD=replace-me
kubectl -n demo get pod "$POD" -o yaml
kubectl get nodes -l disk=ultra
kubectl -n demo describe pod "$POD"`, '节点查询为空且事件提示选择器不匹配时，资源扩容本身未必解决问题。'),
    },
  },
  {
    id: 'resources', group: 0, title: '资源请求与限制', en: 'REQUESTS & LIMITS',
    summary: '区分资源调度预算与运行限制，解释 CPU 限流、内存超限和节点压力。',
    principle: 'requests 参与调度与资源分配；limits 约束运行消耗，两者不是一回事。',
    tradeoff: '较大 requests 保留更多调度预算；过小会增加竞争，过紧 limits 可能造成限流或内存终止。',
    pitfall: '内存 limit 不是预留内存；容器被 OOM 杀死与 Pod 因节点压力被驱逐需要分开诊断。',
    nodes: ['Pod 资源声明', '调度预算', '节点 cgroup', '应用进程'],
    steps: [
      ['声明资源需求', 0, 1, 'REQUEST 100m / 64Mi', '假设容器请求 100m CPU、64Mi 内存，限制为 500m、128Mi。', '请求与上限明确', 'control'],
      ['通过调度检查', 1, 1, 'FIT BY REQUESTS', '调度器按请求等条件判断节点是否可放置，不能把空闲监控值直接视为可分配承诺。', '节点可容纳 requests', 'local'],
      ['落实运行限制', 0, 2, 'CONFIGURE LIMITS', '节点通过运行时和内核机制实施资源配置；CPU 和内存的限制方式不同。', '运行约束生效', 'control'],
      ['在预算内运行', 2, 3, 'RESOURCE USAGE', '应用实际使用随负载变化，可能高于 request，但仍受配置、争用和节点条件约束。', 'usage 与 request 分别观测', 'control'],
    ], code: ['request → 调度预算', 'CPU limit → CPU 时间约束', 'memory limit → 内存约束', '结合 usage、事件和退出原因诊断'],
    example: yaml('资源边界完整清单', 'demo 已存在；启动后可用 describe 检查配置。kubectl top 还需要资源指标 API。', 'resources.yaml', `apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
  namespace: demo
spec:
  containers:
    - name: web
      image: nginx:1.28
      resources:
        requests:
          cpu: 100m
          memory: 64Mi
        limits:
          cpu: 500m
          memory: 128Mi`, 'CPU 为 0.1 核请求、0.5 核限制；内存为二进制单位 Mi，不是毫字节 m。'),
    sections: [
      { title: 'CPU 与内存不是同一种限制', body: 'CPU 上限常表现为可用 CPU 时间被限制，应用可能变慢。内存无法像 CPU 时间一样按周期排队；超限时可能触发 OOM 处理。还需排查应用内存增长、工作集与节点整体压力。' },
      { title: '默认值会改变实际声明', body: 'LimitRange、准入以及只填写 limit 时的默认处理可能改变最终 Pod 的请求。以 API 中实际保存的 Pod spec 为准，而不能只看本地模板或 Helm values。' },
      { title: '资源也影响 HPA', body: '基于 CPU 利用率的 HPA 用 usage 相对于 request 的比例。缺少相关 requests 会使该利用率指标无法定义；设置一个很小的 request 也会改变扩容判断，而不是单纯优化调度。' },
    ], sources: ['resources', 'hpa'], related: ['scheduling', 'hpa', 'pod-debug', 'namespace'],
    fault: {
      name: '内存超限导致容器终止', nodes: ['应用内存', 'cgroup 上限', '容器状态', 'kubelet'],
      steps: [
        ['工作集持续增大', 0, 0, 'MEMORY GROWTH', '独立场景：容器限制 128Mi，实际使用持续增长；CPU 不高不代表内存健康。', '内存接近配置上限', 'local'],
        ['发生内存限制事件', 0, 1, 'MEMORY LIMIT', '内核在内存压力与限制条件下执行 OOM 处理；教学场景假设该容器进程被杀死。', '进程被终止', 'control'],
        ['记录终止原因', 1, 2, 'OOMKILLED', '容器 lastState 可出现 OOMKilled。仅凭 137 退出码不能排除其他 SIGKILL 来源。', '检查 reason 与上下文', 'data'],
        ['根据策略处理重启', 2, 3, 'RESTART POLICY', '若策略允许，节点尝试重启容器。应定位内存增长和合理预算，不能把重启当作根因修复。', '恢复需持续验证', 'control'],
      ], code: ['核对 lastState.reason', '对照 limits 与内存观测', '区分容器 OOM 与节点驱逐', '修正内存行为或合理预算'],
      example: sh('确认 OOM 线索', 'POD 为异常 Pod；top 需要 Metrics Server，采样也可能错过峰值。', `POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo logs "$POD" --previous --tail=100
kubectl -n demo top pod "$POD" --containers`, 'lastState、事件与历史指标应共同判断；重启后的当前内存不能代表崩溃前峰值。'),
    },
  },
  {
    id: 'probes', group: 0, title: '启动、就绪与存活探针', en: 'STARTUP · READINESS · LIVENESS',
    summary: '让“正在启动”“能接流量”“需要重启”成为三个独立判断。',
    principle: 'startup 保护启动期，readiness 控制就绪，liveness 触发容器恢复。',
    tradeoff: '敏感探针更快发现异常，也更易在慢启动、瞬时抖动或依赖故障时误判。',
    pitfall: '就绪失败本身不重启容器；存活探针不应因为共享下游短暂不可用就把所有副本反复重启。',
    nodes: ['kubelet', 'startup 检查', 'readiness 检查', 'liveness 检查'],
    steps: [
      ['先确认启动完成', 0, 1, 'STARTUP PROBE', '假设容器配置了三种探针。startup 成功前，readiness 与 liveness 不会开始执行。', '启动期受独立预算保护', 'check'],
      ['开始检查就绪', 0, 2, 'READINESS PROBE', 'startup 成功后，就绪探针判断是否能接收流量。成功还需满足 Pod 其他就绪条件。', 'Ready 根据条件更新', 'check'],
      ['独立检查存活', 0, 3, 'LIVENESS PROBE', '存活探针判断是否需要通过重启恢复，与是否进入 Service 常规就绪后端是不同问题。', '进程存活健康单独判断', 'check'],
      ['循环观察结果', 0, 0, 'PROBE PERIOD', '探针按周期与阈值运行。Service 后端更新存在传播过程，不能承诺单次探针立刻切断所有连接。', '阈值与传播延迟均需考虑', 'local'],
    ], code: ['若有 startup：先通过启动检查', 'readiness 失败 → 标记不就绪', 'liveness 达到失败阈值 → 终止容器', '按 restartPolicy 等条件处理重启'],
    example: yaml('三种探针的完整示例', 'demo 已存在，nginx:1.28 的 / 可用；此例演示三个检查的配置位置，生产端点应按语义分别设计。', 'probes.yaml', `apiVersion: v1
kind: Pod
metadata:
  name: probe-demo
  namespace: demo
spec:
  containers:
    - name: web
      image: nginx:1.28
      startupProbe:
        httpGet: {path: /, port: 80}
        periodSeconds: 5
        failureThreshold: 30
      readinessProbe:
        httpGet: {path: /, port: 80}
        periodSeconds: 5
      livenessProbe:
        httpGet: {path: /, port: 80}
        periodSeconds: 10
        failureThreshold: 3`, 'startup 允许较长启动窗口；探针命中容器应用端点，不是通过 Service 检查其他副本。'),
    sections: [
      { title: '就绪影响流量资格', body: 'readiness 失败会使相应容器不就绪，并影响 Pod Ready 与常规 Service 后端资格。使用 publishNotReadyAddresses 等特殊配置时行为不同，既有连接和更新传播也需要单独考虑。' },
      { title: '存活不是依赖列表', body: '应用暂时无法访问数据库时，重启未必有用，反而可能加剧风暴。存活端点应判断容器是否需要重启恢复；就绪可结合是否能处理请求做更严格判断，但也要防止全体摘流。' },
      { title: '慢启动需要单独预算', body: 'startup 将初始化耗时与运行期健康阈值分离。它成功后不再持续运行；运行期间仍靠 readiness 和 liveness。阈值要根据实际启动与故障分布设置，并持续观察误报。' },
    ], sources: ['probes', 'lifecycle', 'endpoints'], related: ['pod', 'service', 'deployment', 'pod-debug'],
    fault: {
      name: '就绪失败，容器仍存活', nodes: ['应用容器', 'readiness 结果', 'Pod 条件', 'EndpointSlice'],
      steps: [
        ['就绪接口返回失败', 0, 1, 'READINESS FAILED', '独立场景：进程还在运行，readiness 连续失败达到阈值，而 liveness 一直通过。', '容器 Running', 'data'],
        ['更新 Pod 条件', 1, 2, 'READY=FALSE', 'kubelet 将就绪观察反映到 Pod 状态，不因为单纯就绪失败重启容器。', 'restartCount 不因此增加', 'control'],
        ['端点资格变化', 2, 3, 'NOT READY ENDPOINT', '常规 selector Service 的端点就绪条件相应变化，数据面更新后不再按正常就绪后端发送新请求。', '就绪后端减少', 'control'],
        ['修复应用依赖', 0, 0, 'DIAGNOSE READINESS', '查看探针端点与依赖，而不是先删 Pod。恢复成功后就绪状态与流量资格可重新建立。', '恢复需要再次探测', 'local'],
      ], code: ['读取 readiness 事件与状态', '对照 restartCount 是否增长', '检查 EndpointSlice.ready', '修复后观察 Ready 恢复'],
      example: sh('验证就绪与重启分离', 'POD 替换为 Service web 选中的异常 Pod；观察输出而非预设一定是探针问题。', `POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl -n demo get pod "$POD" -o wide`, '对照 Ready、Restart Count 与端点 ready；Running/NotReady 可以同时存在。'),
    },
  },
];
