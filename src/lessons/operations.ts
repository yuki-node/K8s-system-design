import { sh, yaml, type Lesson } from '../course-types';

export const operations: Lesson[] = [
  {
    id: 'network-policy', group: 2, title: 'NetworkPolicy 网络隔离', en: 'NETWORK POLICY',
    summary: '从流量两端判断入站与出站是否允许，识别策略叠加和网络插件的职责。',
    principle: '对受隔离方向，允许规则取并集；一次连接还需同时满足源端出站与目标入站。',
    tradeoff: '默认拒绝缩小通信面，也要求准确维护 DNS、监控和应用依赖的放行规则。',
    pitfall: '创建策略不保证网络隔离已经生效，必须有支持 NetworkPolicy 的网络实现；规则也不是按文件先后覆盖。',
    nodes: ['来源 Pod', '出站规则', '入站规则', '目标 Pod'],
    steps: [
      ['明确通信双方', 0, 1, 'SOURCE EGRESS', '假设 CNI 支持并执行策略，来源 Pod 已被出站策略选中。先判断出站方向的允许集合。', '检查源端出站', 'check'],
      ['检查目标方向', 2, 3, 'DESTINATION INGRESS', '目标 Pod 若被入站策略隔离，则匹配它的所有入站允许规则取并集。', '检查目标入站', 'check'],
      ['两端条件均满足', 1, 2, 'BOTH DIRECTIONS ALLOW', '教学场景假设两端都允许，且协议与目标端口匹配。任一端不允许都会阻止连接。', '策略层允许连接', 'check'],
      ['建立应用连接', 0, 3, 'CONNECT', '策略允许只是条件之一，应用监听、Service、路由和基础网络仍需正常。', '请求到达目标', 'request'],
    ], code: ['判断双方是否在相关方向被隔离', '源端允许 = 所有适用 egress 规则并集', '目标允许 = 所有适用 ingress 规则并集', '两端允许且网络正常 → 可连接'],
    example: yaml('只隔离 web 的入站', '需要支持 NetworkPolicy 的 CNI。demo 中 app=web 为目标，app=client 为允许来源；仅限制入站，未限制出站。', 'network-policy.yaml', `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-from-client
  namespace: demo
spec:
  podSelector:
    matchLabels: {app: web}
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels: {app: client}
      ports:
        - protocol: TCP
          port: 80`, '同 namespace 的 client 标签 Pod 可访问 web 的 TCP/80；其他适用策略仍可能额外放行，需做允许／拒绝双向测试。'),
    sections: [
      { title: '方向与集合', body: '默认没有相关策略隔离时，该方向通常不受 NetworkPolicy 限制。一旦被该方向的策略选中，就按所有适用策略允许规则的并集决定；空规则集并不覆盖另一条允许规则。' },
      { title: '选择器的作用域', body: '单独 podSelector 的来源范围是策略所在命名空间。namespaceSelector 与 podSelector 写在同一个 from 元素中表示组合条件，写成两个元素则是另一种并集关系，必须审查 YAML 层级。' },
      { title: '用实际流量验证', body: '检查 CNI 能力、Pod 标签、命名空间标签和 DNS 路径，然后分别从允许来源与不允许来源测试。NetworkPolicy 不是 HTTP 路径鉴权，不能替代 RBAC、TLS 或应用认证。' },
    ], sources: ['network', 'labels'], related: ['labels', 'namespace', 'dns', 'service-debug'],
    fault: {
      name: '放行入站，出站仍拒绝', nodes: ['客户端 Pod', '客户端出站', '服务端入站', '服务端 Pod'],
      steps: [
        ['来源已被出站隔离', 0, 1, 'EGRESS ISOLATED', '独立场景：来源被 default-deny egress 选中，未允许访问目标服务。', '源端出站不允许', 'check'],
        ['目标入站允许', 2, 3, 'INGRESS ALLOWED', '目标策略确实允许来源标签，但只配置这一端无法覆盖来源出站限制。', '目标入站条件满足', 'check'],
        ['连接无法抵达', 0, 3, 'BLOCKED IN PATH', '出站路径不满足规则，教学图示把传输画为中断；具体丢弃位置由网络实现决定。', '目标未收到连接', 'lost'],
        ['核对两端与 DNS', 1, 2, 'CHECK BOTH POLICIES', '检查双方适用策略集合与真实依赖端口；若使用服务名，还需要允许对应 DNS 路径。', '修正完整通信意图', 'check'],
      ], code: ['检查 source egress', '检查 destination ingress', '核对端口、标签与 DNS', '允许与拒绝来源分别验证'],
      example: sh('检查两端的策略范围', 'demo 中存在待查策略；此命令只读定义，实际验证需从双方相关 Pod 发起连接。', `kubectl -n demo get networkpolicy
kubectl -n demo describe networkpolicy
kubectl -n demo get pods --show-labels
kubectl get namespaces --show-labels`, '不能仅凭策略存在判定有效；结合 CNI 能力与实际连接测试确认。'),
    },
  },
  {
    id: 'rbac', group: 2, title: 'RBAC 与最小权限', en: 'ROLE-BASED ACCESS CONTROL',
    summary: '围绕主体、动作、资源和作用域判断授权，把只读需求与管理员权限分开。',
    principle: '角色定义允许动作，绑定把动作授予主体；认证身份与授权范围分别判断。',
    tradeoff: '精确授权降低权限面，也增加角色维护和排障成本；通配权限虽然省事但难以审查。',
    pitfall: 'RoleBinding 引用 ClusterRole 时，通常只在该绑定的命名空间授予对应命名空间资源权限；不会因此变成全局管理员。',
    nodes: ['请求身份', 'API 授权', '角色规则', '角色绑定'],
    steps: [
      ['识别请求主体', 0, 1, 'AUTHENTICATED SUBJECT', '假设认证已经成功。请求包含动词、API 组、资源和命名空间等授权属性。', '身份已知 · 权限待判', 'request'],
      ['匹配授权绑定', 3, 1, 'SUBJECT / SCOPE', 'RBAC 授权根据适用绑定把主体与规则联系起来；认证成功不意味着能读任意资源。', '查找适用授权', 'control'],
      ['核对资源与动作', 1, 2, 'VERB / RESOURCE', '例如 get pods 与 get pods/log 是不同资源权限。RBAC 的允许规则是累加的。', '精确匹配权限', 'check'],
      ['允许继续处理', 1, 0, 'AUTHORIZED', '假设授权匹配，请求继续进入后续处理；准入、配额和资源校验仍可能拒绝写操作。', '授权通过 ≠ 所有检查通过', 'data'],
    ], code: ['认证：是谁', '授权：能对什么做什么', '准入：本次写入是否符合策略', '持续审查最小权限'],
    example: yaml('命名空间内的 Pod 只读角色', '需要在 demo 创建 ServiceAccount、Role 与 RoleBinding 的权限；不授予 Secret 或日志读取权限。', 'rbac.yaml', `apiVersion: v1
kind: ServiceAccount
metadata:
  name: pod-reader
  namespace: demo
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: demo
rules:
  - apiGroups: [""]
    resources: [pods]
    verbs: [get, list, watch]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader
  namespace: demo
subjects:
  - kind: ServiceAccount
    name: pod-reader
    namespace: demo
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: pod-reader`, '角色只允许读取 demo 的 Pod 对象；其他绑定仍可能额外授予该主体权限。'),
    sections: [
      { title: '角色与绑定', body: 'Role 属于命名空间，ClusterRole 可描述集群级或可复用规则。RoleBinding 在本空间绑定角色，ClusterRoleBinding 提供集群级绑定。应从主体实际拥有的所有绑定判断最终能力。' },
      { title: '权限细节不能靠猜', body: 'get、list、watch、create、patch 等是不同动作；pods/log、pods/exec 等子资源需要相应规则。创建 Pod 的权限也可能间接获得工作负载身份和卷数据，因此不能只看一条规则的名字。' },
      { title: '先验证再加权', body: '用 auth can-i 对具体动作和作用域检查。--as 需要模拟身份权限；若被拒绝，要区分是不能模拟还是目标动作不允许。不要为一个只读错误直接授予 cluster-admin。' },
    ], sources: ['rbac', 'secrets'], related: ['namespace', 'pod-security', 'config', 'api'],
    fault: {
      name: '能读 Pod，不能读日志', nodes: ['pod-reader 身份', 'pods 对象', 'pods/log 子资源', 'API 授权'],
      steps: [
        ['Pod 查询通过', 0, 1, 'GET POD ALLOWED', '独立场景：主体仅具有 pods 的 get/list/watch 权限，没有其他授予。', '可读 Pod 状态', 'request'],
        ['请求日志子资源', 0, 2, 'GET PODS/LOG', '读取日志走 pods/log，而不是直接读取 Pod 对象中的一段字段。', '需要单独授权动作', 'request'],
        ['授权未命中', 3, 0, '403 FORBIDDEN', '规则缺少 pods/log，API 返回 Forbidden；这与容器无日志或镜像拉取失败是不同问题。', '日志请求被拒绝', 'reject'],
        ['确认最小增量', 3, 3, 'REVIEW REQUIRED ACCESS', '确认确需日志权限后，再通过角色变更授予对应动作和范围；课程示例不自动扩权。', '避免不必要管理员权限', 'local'],
      ], code: ['区分 Forbidden 与 NotFound', '检查当前身份的 pods/log 权限', '核对所有适用角色绑定', '有需求才授予最小增量'],
      example: sh('按具体子资源检查权限', '检查当前登录身份；如果使用 --as 测试示例 ServiceAccount，还需要模拟身份权限。', `kubectl auth can-i get pods -n demo
kubectl auth can-i get pods/log -n demo
kubectl -n demo get rolebindings
kubectl -n demo describe role pod-reader`, 'can-i 反映当前身份与具体操作；管理员自己的 yes 不代表 pod-reader 也具备该权限。'),
    },
  },
  {
    id: 'pod-security', group: 2, title: 'Pod 安全与准入', en: 'POD SECURITY ADMISSION',
    summary: '区分运行时安全配置与准入策略，把告警、审计和强制拒绝分开。',
    principle: '安全标准定义约束，准入按命名空间模式检查；workload 被接受不表示其 Pod 一定能创建。',
    tradeoff: '更严格的限制减少高权限运行面，也要求镜像和应用支持非 root、能力裁剪与只读等约束。',
    pitfall: 'warn 和 audit 不会像 enforce 一样拒绝违规 Pod；给命名空间加标签也不会自动把运行中的 Pod 变安全。',
    nodes: ['Pod 模板', '安全标准', '准入检查', '新 Pod'],
    steps: [
      ['声明运行安全配置', 0, 0, 'SECURITY CONTEXT', '假设应用支持非 root，模板设置所需 securityContext；字段可在 Pod 或容器层分别配置。', '配置体现运行意图', 'local'],
      ['选择策略模式', 1, 2, 'ENFORCE / WARN / AUDIT', '命名空间标签决定相应模式和级别，还需考虑集群启用方式、豁免与版本。', '策略判定上下文明确', 'control'],
      ['创建时检查', 0, 2, 'POD ADMISSION', '创建新 Pod 时执行 enforce 等检查。Deployment 资源本身可能先被接受，控制器再因 Pod 被拒绝而失败。', '检查新 Pod 请求', 'check'],
      ['合规请求被接受', 2, 3, 'ADMITTED', '假设全部安全和其他准入条件都满足，Pod 才进入后续调度与运行。', '准入通过 · 运行另查', 'control'],
    ], code: ['明确应用所需权限', '配置安全上下文', '先观察 warn / audit 再规划 enforce', '以实际 Pod 创建结果验证'],
    example: yaml('非 root 的最小 Pod', 'demo 已存在且有 Linux 节点；busybox 的 echo/sleep 支持以数值 UID 1000 运行，仍须服从集群额外准入策略。', 'pod-security.yaml', `apiVersion: v1
kind: Pod
metadata:
  name: restricted-demo
  namespace: demo
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: busybox:1.37
      command: [sh, -c, 'id; sleep 3600']
      securityContext:
        allowPrivilegeEscalation: false
        capabilities:
          drop: [ALL]`, '日志应显示 uid=1000；本清单演示常见 Restricted 配置，不承诺满足任意自定义策略。'),
    sections: [
      { title: '三个模式不能混为一谈', body: 'enforce 拒绝违反相应级别的新 Pod；warn 向用户给出警告；audit 为审计记录添加信息。模式可以组合并设置不同级别。生产策略版本应明确固定或有计划地升级。' },
      { title: '镜像必须配合', body: 'runAsNonRoot 并不会自动修改镜像文件权限。应用监听特权端口、写根文件系统或启动脚本需要额外权限时，应改造应用或按边界审查，而不是盲目关闭所有安全约束。' },
      { title: '覆盖完整边界', body: 'Pod 安全约束不能替代 RBAC、NetworkPolicy、镜像供应链或节点安全。对 Deployment 等模板的警告与真正创建 Pod 时的 enforce 要分开看，排障时应读 ReplicaSet 事件。' },
    ], sources: ['security', 'standards', 'rbac'], related: ['rbac', 'namespace', 'pod-debug', 'reconcile'],
    fault: {
      name: 'Deployment 有了，Pod 被拒绝', nodes: ['Deployment', 'ReplicaSet', '安全准入', 'Pod 创建结果'],
      steps: [
        ['工作负载对象被接受', 0, 1, 'DEPLOYMENT ACCEPTED', '独立场景：命名空间 enforce=restricted，模板请求 privileged 容器；Deployment 对象已保存。', '声明存在但不保证 Pod 存在', 'control'],
        ['控制器请求创建 Pod', 1, 2, 'CREATE POD', 'ReplicaSet 从模板发起实际 Pod 创建，触发 Pod 级安全准入。', '进入 enforce 检查', 'request'],
        ['违规 Pod 被拒绝', 2, 1, 'VIOLATES RESTRICTED', '准入返回拒绝，控制器事件可出现 FailedCreate；并不是 Pod 卡在调度器。', '没有成功创建该 Pod', 'reject'],
        ['检查模板与事件', 3, 3, 'DIAGNOSE ADMISSION', '读取 ReplicaSet 事件和命名空间策略，按应用需要修正模板；不先把整个空间降为 privileged。', '根因在准入约束', 'local'],
      ], code: ['确认是否已有 Pod', '查看 ReplicaSet FailedCreate', '核对 namespace 安全标签', '修正模板的最小必要权限'],
      example: sh('查找实际拒绝位置', '已有 demo/web；安全标签可能未设置，本命令不会改动策略。', `kubectl get namespace demo --show-labels
kubectl -n demo describe replicasets
kubectl -n demo get events --sort-by=.metadata.creationTimestamp`, 'FailedCreate 的具体 message 可显示准入原因；Deployment 创建成功不能排除这种错误。'),
    },
  },
  {
    id: 'hpa', group: 2, title: 'HPA 自动扩缩容', en: 'HORIZONTAL POD AUTOSCALING',
    summary: '把指标、资源请求、目标比例与实际可用副本串起来，识别扩容的前提。',
    principle: 'HPA 修改目标工作负载的副本数；指标可用不等于新副本一定能调度并就绪。',
    tradeoff: '快速扩容应对流量变化，也需要启动容量；稳定窗口和速率限制减少抖动但会延迟缩容。',
    pitfall: '基于 CPU 利用率的 HPA 依赖相关 CPU requests；HPA 不会自动给集群增加节点。',
    nodes: ['资源指标 API', 'HPA 控制器', 'Deployment scale', '新 Pod'],
    steps: [
      ['获取有效指标', 0, 1, 'CPU METRICS', '假设资源指标 API 可用，每个相关容器设置 CPU request，当前副本为 2。', '可计算平均 CPU 利用率', 'data'],
      ['比较目标利用率', 1, 1, '80% / TARGET 50%', '理想化算例为 ceil(2×80/50)=4；实际算法还有容差、缺失指标、未就绪 Pod 与稳定策略处理。', '简化建议=4', 'local'],
      ['更新期望副本数', 1, 2, 'SET SCALE=4', '假设边界与行为策略允许，将目标资源的 scale 更新为 4。', '期望副本增大', 'control'],
      ['创建并验证容量', 2, 3, 'SCALE OUT', '工作负载控制器创建 Pod，后续仍受节点容量、配额、镜像和就绪约束。', '新容量尚需验证可用', 'control'],
    ], code: ['取当前目标与指标', '计算建议副本（含算法条件）', '应用 min/max 与行为限制', '更新 scale，观察实际 Ready'],
    example: yaml('基于 CPU 的 HPA', 'demo/web Deployment 存在，所有相关容器设置 CPU requests，已安装 Metrics Server 或等效资源指标提供者。', 'hpa.yaml', `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web
  namespace: demo
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50`, 'HPA 显示指标与条件；没有实际负载时不保证扩容。与持续 apply 固定 replicas 的自动化需要协调字段管理。'),
    sections: [
      { title: '百分比相对于 request', body: 'CPU 利用率与 request 比较，而不是与 limit 或整台节点 CPU 比较。相同 usage 下修改 request 会改变利用率含义。缺少相关 requests 时，这个利用率指标无法按预期计算。' },
      { title: '指标不是内置全部可用', body: '资源指标通常依赖 Metrics Server 等组件，外部或自定义指标依赖相应适配器。先核对 HPA conditions 和原始指标路径，再怀疑目标副本算法。kubectl top 与监控系统的时间窗口也可能不同。' },
      { title: 'Pod 与节点扩容不同', body: 'HPA 调整工作负载规模，节点扩容是另一套机制。若扩出来的 Pod 无法调度，应继续检查 requests、约束和节点容量；副本数字增长不代表业务吞吐已经增加。' },
    ], sources: ['hpa', 'resources'], related: ['resources', 'deployment', 'scheduling', 'observability'],
    fault: {
      name: '指标不可用，无法正常决策', nodes: ['资源指标 API', 'HPA 状态', '目标副本', '排障观察'],
      steps: [
        ['资源指标读取失败', 0, 1, 'METRICS UNAVAILABLE', '独立场景：HPA 仅配置一个 CPU 指标，但资源指标 API 不可用。', '缺少有效度量', 'lost'],
        ['报告计算问题', 1, 1, 'SCALING ACTIVE FALSE', 'HPA 条件和事件可能显示 FailedGetResourceMetric 等原因。具体条件以输出为准。', '指标状态异常', 'local'],
        ['没有本次有效建议', 1, 2, 'NO VALID CPU RECOMMENDATION', '单一不可用指标不能据此生成正常的 CPU 扩缩建议；边界处理等还需看实际配置，不能泛化所有多指标情形。', '不以未知值当零负载', 'control'],
        ['检查依赖链', 3, 0, 'VERIFY METRICS API', '检查指标提供者、证书与连通性，并核对 request。盲目提高 maxReplicas 不会修复缺失指标。', '先恢复有效观测', 'check'],
      ], code: ['读取 HPA conditions 和 Events', '验证资源指标 API', '核对容器 CPU requests', '恢复依赖后观察建议和 Ready'],
      example: sh('检查 HPA 输入', '已有 demo/web HPA；top 在缺少资源指标时会失败，这正是需定位的证据。', `kubectl -n demo describe hpa web
kubectl -n demo top pods
kubectl get apiservice v1beta1.metrics.k8s.io
kubectl -n demo get deployment web -o yaml`, '分别检查 APIService 可用性、指标输出、CPU requests 与 HPA 事件。'),
    },
  },
  {
    id: 'observability', group: 2, title: '指标、日志与事件', en: 'OBSERVABILITY',
    summary: '先定义问题，再选择证据：资源状态、事件、应用日志和指标各回答不同问题。',
    principle: '可观测性帮助建立因果线索；一个健康信号不能替代完整业务结果。',
    tradeoff: '更细观测提高排障能力，也增加成本、噪声和敏感数据暴露面。',
    pitfall: 'kubectl top 不是长期监控，Events 也不是永久审计日志；没有错误日志不意味着请求真的成功。',
    nodes: ['用户请求', '资源指标', '应用日志', '状态 / 事件'],
    steps: [
      ['描述用户症状', 0, 0, 'LATENCY / ERRORS', '假设用户报告某次发布后延迟上升。先记录时间窗、对象和影响范围，再收集数据。', '问题有可核对上下文', 'local'],
      ['对照资源变化', 1, 0, 'METRIC CORRELATION', '查看 CPU、内存、错误率与延迟趋势。时间相关可缩小范围，但不直接证明因果。', '建立候选假设', 'data'],
      ['结合应用输出', 2, 0, 'LOG CONTEXT', '用时间、版本、Pod UID 或请求 ID 关联日志，区分应用报错、重启和流量未到达。', '连接多种证据', 'data'],
      ['核对控制面事件', 3, 0, 'CONDITIONS / EVENTS', '检查 rollout、调度、探针和挂载事件，形成可验证的解释，再设计最小干预。', '证据支持下一步行动', 'data'],
    ], code: ['固定时间窗与对象身份', '对照指标、日志和事件', '提出可验证假设', '干预后验证业务指标恢复'],
    example: sh('收集入门实验的基本证据', 'demo/web 已部署；top 需要资源指标 API，logs 只包含能访问到的容器输出。', `kubectl -n demo get deployment,pods,service
kubectl -n demo get events --sort-by=.metadata.creationTimestamp
kubectl -n demo logs deployment/web --all-containers=true --tail=100
kubectl -n demo top pods`, '事件说明资源操作，日志说明应用输出，top 提供短期资源样本；它们互不替代。'),
    sections: [
      { title: '状态、事件、日志、追踪', body: 'status 和 conditions 表达组件观察，事件给出调度与操作线索，日志记录组件或应用输出，分布式追踪连接一次请求跨组件的过程。不同信号的保留时间、采样与时间基准不同。' },
      { title: '节点本地日志会消失', body: 'kubectl logs 依赖容器和节点上的日志可用性，轮转、Pod 删除或节点故障会影响读取。长期保留需要日志采集与后端系统，DaemonSet 只是常见采集部署方式之一。' },
      { title: '验证修复的业务结果', body: 'Pod Ready 和 CPU 降低未必说明故障已经解决，可能只是流量丢失。恢复验证应回到用户请求成功率、延迟和数据正确性，并记录观察窗口和仍不确定的条件。' },
    ], sources: ['observability', 'logging', 'debug'], related: ['pod-debug', 'service-debug', 'hpa', 'daemonset'],
    fault: {
      name: '当前日志正常，前次已崩溃', nodes: ['当前容器', '上次容器状态', '上次日志', '故障时间窗'],
      steps: [
        ['只看当前输出', 0, 0, 'CURRENT LOG LOOKS OK', '独立场景：容器刚重启，新实例输出正常，但用户症状发生在上一个实例。', '当前日志未覆盖故障', 'local'],
        ['检查重启证据', 1, 0, 'LAST STATE / RESTARTS', 'restartCount 与 lastState 表明前次终止。应记录原因和时间，与用户报告对应。', '发现跨实例边界', 'data'],
        ['读取 previous 日志', 2, 3, 'PREVIOUS INSTANCE', '如果上一实例日志仍保留，使用 previous 查阅；数据已轮转时需依赖集中日志等系统。', '可能补齐故障片段', 'data'],
        ['校验完整解释', 3, 3, 'CORRELATE EVIDENCE', '把前次退出、探针、资源峰值和版本变化关联，不能仅凭新实例安静就宣告修复。', '恢复结论需业务验证', 'local'],
      ], code: ['记录当前与前次实例时间', '检查 lastState 与 restartCount', '读取 previous 或集中日志', '用业务请求验证恢复'],
      example: sh('围绕容器实例收集证据', 'POD 替换为发生过重启的实际 Pod；多容器 Pod 应增加 -c 指定容器。', `POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo logs "$POD" --tail=100 --timestamps
kubectl -n demo logs "$POD" --previous --tail=100 --timestamps`, '对齐时间戳与退出时间；previous 不是永久历史日志存储。'),
    },
  },
  {
    id: 'pod-debug', group: 2, title: 'Pod 故障定位', en: 'DEBUGGING PODS',
    summary: '按“存在 → 调度 → 启动 → 运行 → 就绪”的顺序缩小问题范围。',
    principle: '先定位失败阶段，再读取对应证据；删除 Pod 不是通用诊断动作。',
    tradeoff: '保留证据能提高定位质量，但也需要及时控制影响，权衡取证、恢复和业务期限。',
    pitfall: '没有成功创建的容器可能没有日志；Pending、ImagePullBackOff、CrashLoopBackOff 与 NotReady 指向不同环节。',
    nodes: ['资源对象', '调度状态', '容器状态', '应用就绪'],
    steps: [
      ['确认对象身份', 0, 0, 'GET / OWNER', '假设业务负载异常。先核对集群、空间、对象名和 owner，资源不存在时查控制器创建错误。', '找到正确对象与控制器', 'local'],
      ['检查是否分配节点', 0, 1, 'POD SCHEDULED?', '有无 nodeName 和调度条件帮助区分调度失败与节点执行阶段的问题。', '确定是否进入节点阶段', 'check'],
      ['检查容器状态', 1, 2, 'WAITING / TERMINATED', '结合事件看镜像、配置、卷和运行时；有过执行记录再看退出原因及应用日志。', '定位启动或运行原因', 'check'],
      ['验证应用与就绪', 2, 3, 'READY / BUSINESS CHECK', '容器运行后继续检查探针、端口与请求结果。重启成功并不表示业务问题已经消失。', '形成可验证诊断', 'check'],
    ], code: ['不存在 → 查控制器事件与准入', '未调度 → 查 FailedScheduling', '未启动 → 查镜像、配置和挂载', '已运行 → 查日志、探针和业务结果'],
    example: sh('最小 Pod 排障顺序', 'POD 替换为真实名称，先确认 current-context 指向实验集群；多容器可按需指定 -c。', `POD=replace-me
kubectl config current-context
kubectl -n demo get pod "$POD" -o wide
kubectl -n demo describe pod "$POD"
kubectl -n demo logs "$POD" --tail=100`, '前三条明确对象与阶段；logs 若报告容器未启动，不应把它视为日志采集系统故障。'),
    sections: [
      { title: '对象不存在先看父资源', body: 'Deployment 存在但 Pod 没有创建，常见方向是 ReplicaSet 事件、配额、准入或权限。没有 Pod 对象时，去节点找容器日志往往还没有意义。' },
      { title: '把状态原因翻译成问题', body: 'FailedScheduling 查硬约束与资源；ImagePullBackOff 查镜像、凭据与网络；CreateContainerConfigError 查配置引用；CrashLoopBackOff 查退出与上次日志；Running/NotReady 查就绪条件。具体以事件为准。' },
      { title: '调试工具有前提', body: 'exec 依赖目标容器和工具；极简镜像可能没有 shell。临时调试容器需要集群支持与相应权限，并遵守 Pod 安全策略。调试不能绕开权限，也不应污染证据后再解释原故障。' },
    ], sources: ['debug', 'lifecycle', 'probes'], related: ['pod', 'scheduling', 'resources', 'config', 'observability'],
    fault: {
      name: '引用了不存在的配置', nodes: ['Pod 声明', 'kubelet', '缺失 ConfigMap', '容器日志'],
      steps: [
        ['调度已经成功', 0, 1, 'ASSIGNED', '独立场景：Pod 引用必需的 ConfigMap，但该空间内对象不存在。Pod 已分配节点。', '节点开始准备容器', 'control'],
        ['解析必需配置失败', 1, 2, 'CONFIG NOT FOUND', '节点无法准备必需环境变量配置，容器没有完成创建。错误消息比猜测应用日志更直接。', 'CreateContainerConfigError', 'check'],
        ['没有应用执行记录', 3, 3, 'NO APPLICATION LOG', '应用进程没有启动，因此可能没有可读应用日志；这是阶段结果，不是应用没有报错。', '日志无法回答启动前错误', 'local'],
        ['核对对象与键', 0, 2, 'CHECK NAMESPACE / KEY', '检查引用空间、对象名、键与 optional 标志，修正源清单或创建所需配置后观察。', '配置前提得到核对', 'check'],
      ], code: ['先看 describe Events', '检查 configMapKeyRef / secretKeyRef', '确认同空间对象与键存在', '修正后再观察容器启动'],
      example: sh('检查配置引用而不输出机密', 'POD 为异常 Pod；Secret 仅查看对象列表，不打印真实值。', `POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo get configmaps
kubectl -n demo get secrets`, '描述中的错误可指出缺失对象或键；不要把 Secret 内容复制到工单或日志。'),
    },
  },
  {
    id: 'service-debug', group: 2, title: 'Service 连通性排障', en: 'DEBUGGING CONNECTIVITY',
    summary: '沿调用方 → DNS → 服务入口 → 端点 → 应用排查，用分层对照缩小故障范围。',
    principle: '每次验证只排除一层假设；服务名、服务地址与 Pod 地址提供不同证据。',
    tradeoff: '逐层排查稍慢于反复重启，但能避免把标签、端口或策略错误当成随机网络抖动。',
    pitfall: 'port-forward 成功只验证一条经控制面建立的访问路径，不能证明普通 Service 数据面或 NetworkPolicy 路径正常。',
    nodes: ['实际调用方', 'DNS / Service', 'EndpointSlice', '应用 Pod'],
    steps: [
      ['固定调用上下文', 0, 0, 'SOURCE / TIME / ERROR', '假设调用方报告 web 请求失败。记录命名空间、目标名称、端口、协议与具体错误。', '诊断可重复', 'local'],
      ['检查名称与服务', 0, 1, 'RESOLVE / SERVICE CONFIG', '在调用方环境检查解析与 Service 配置。解析失败与连接失败需要不同后续路径。', '明确入口与端口', 'check'],
      ['检查后端条件', 1, 2, 'READY ENDPOINTS', '核对 selector、端点地址、端口、ready 与 Pod 对应关系，避免只看 Service 对象存在。', '明确可选后端', 'check'],
      ['对照应用与路径', 0, 3, 'TEST FROM SOURCE', '检查真实来源到后端的流量、监听和策略，再与服务入口路径对照；不能从旁路测试推断所有路径。', '按证据区分应用与网络层', 'request'],
    ], code: ['固定实际来源和错误', '检查 DNS 与 Service 端口', '检查 EndpointSlice 与 Pod 就绪', '比较后端直连与服务路径，核对策略'],
    example: sh('从集群内发起 HTTP 测试', 'demo/web 存在；允许创建临时 Pod，并能拉取 busybox。若应用只允许特定来源，应使用真实调用方或匹配其策略身份。', `kubectl -n demo get service web -o yaml
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl -n demo run http-check --rm -i --restart=Never --image=busybox:1.37 -- wget -S -O- -T 5 http://web.demo.svc`, '成功时可见 HTTP 响应；临时 Pod 的网络策略身份可能与真实调用方不同。'),
    sections: [
      { title: '先保留具体错误', body: 'NXDOMAIN、连接拒绝、超时、TLS 错误和 HTTP 错误码提供不同线索。将它们统一叫“网络不通”会丢失最有价值的诊断分支，尤其要标记来自哪个容器和时间窗口。' },
      { title: '端点与应用对照', body: '端点为空先查 selector 与就绪；端点存在则核对 targetPort 和应用监听。Pod 直连失败可能来自应用、策略或基础网络；Pod 能访问而服务不能访问时再重点检查服务数据面。' },
      { title: '测试路径必须一致', body: '本机 curl、kubectl port-forward、不同命名空间的临时 Pod 与真实调用方可能走不同网络和授权路径。旁路能帮助验证应用，但应回到用户实际路径复测，才可判断问题是否解决。' },
    ], sources: ['debugservice', 'service', 'endpoints', 'network'], related: ['service', 'dns', 'labels', 'network-policy', 'probes'],
    fault: {
      name: '旁路成功，服务仍不可达', nodes: ['本机 port-forward', '目标 Pod', '真实调用方', 'Service 数据面'],
      steps: [
        ['旁路访问应用成功', 0, 1, 'PORT-FORWARD OK', '独立场景：kubectl port-forward 访问某个 Pod 的 HTTP 端口成功。', '该应用路径当时可工作', 'request'],
        ['真实请求仍失败', 2, 3, 'SERVICE REQUEST FAILS', '实际调用方通过 Service 超时，说明两种测试路径不等价。', '用户问题仍存在', 'request'],
        ['对照不同路径', 0, 3, 'COMPARE PATHS', 'port-forward 不覆盖常规 Service 转发与真实来源策略，不能据此宣布网络健康。', '旁路证据只排除部分假设', 'compare'],
        ['返回真实来源排查', 2, 3, 'VERIFY SOURCE PATH', '从真实来源核对 DNS、端点、端口、网络策略和数据面，修复后在同一路径复测。', '恢复依据是真实请求', 'check'],
      ], code: ['记录 port-forward 的目标与端口', '从真实来源复现失败', '对照 Service 和策略配置', '修复后按原路径验收'],
      example: sh('先核对原始路径配置', '命令只检查配置；实际连接测试应在原调用方容器中使用其已有 HTTP 工具。', `kubectl -n demo get service web -o yaml
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl -n demo get networkpolicy
kubectl -n demo get pods -l app=web -o wide`, '把端点 IP、端口、就绪和来源策略逐项对照；不要把单个成功请求扩展为全路径结论。'),
    },
  },
  {
    id: 'drain', group: 2, title: '节点维护与 PDB', en: 'NODE DRAIN & DISRUPTIONS',
    summary: '用 cordon、受预算约束的驱逐与恢复调度完成节点维护，理解哪些中断不受 PDB 保护。',
    principle: 'PDB 约束经过驱逐 API 的自愿中断；它不是业务永不掉线或节点不会故障的保证。',
    tradeoff: '严格预算保护维护时的可用副本，也可能阻止排空，需要提前预留容量和恢复路径。',
    pitfall: '--ignore-daemonsets 是跳过守护 Pod，不是删除它们；cordon 不会迁走已有 Pod，也不阻止所有特殊放置。',
    nodes: ['维护操作者', '目标节点', '驱逐 / PDB', '其他节点副本'],
    steps: [
      ['先确认维护范围', 0, 1, 'CORDON', '假设应用有多副本且其他节点有足够容量。cordon 将节点标为不可调度，不迁走已有 Pod。', '普通新调度避开该节点', 'control'],
      ['请求有预算的驱逐', 0, 2, 'DRAIN / EVICTION', 'drain 尝试驱逐可处理的 Pod，并遵守适用 PDB；本地数据、裸 Pod、DaemonSet 等还需明确处理。', '中断预算被检查', 'request'],
      ['等待替代容量', 2, 3, 'REPLACEMENT READY', '控制器在可行节点补建替代 Pod；课程假设依赖和资源满足，维护前应实际验证恢复。', '替代副本逐步就绪', 'control'],
      ['维护后恢复调度', 0, 1, 'UNCORDON', '维护完成并检查节点健康后再 uncordon，使普通调度可以恢复；业务健康也要检查。', '节点重新参与调度', 'control'],
    ], code: ['检查 PDB、容量、存储与裸 Pod', 'cordon → drain（遵守驱逐预算）', '确认节点工作负载与业务状态', '维护并验证后 uncordon'],
    example: sh('维护前的只读检查', '具备节点与 PDB 读取权限；NODE 替换为计划维护的节点。此示例不实际排空节点。', `NODE=replace-me
kubectl get node "$NODE" -o wide
kubectl get pods -A --field-selector spec.nodeName="$NODE" -o wide
kubectl get pdb -A
kubectl describe node "$NODE"`, '先识别 DaemonSet、裸 Pod、卷和预算；真正维护命令应在明确节点与业务窗口后执行。'),
    sections: [
      { title: '维护过程不是搬家', body: '普通 Pod 不会被原封不动搬到另一个节点，通常是驱逐后由控制器创建新 Pod。容量、调度约束、卷拓扑、优雅退出和应用连接处理共同影响维护结果。' },
      { title: 'PDB 保护的边界', body: 'PDB 主要限制自愿驱逐，不能阻止节点掉电等非自愿故障。直接删除 Pod 或工作负载自己的滚动更新不等同于经过驱逐 API 的 drain；发布策略还需由工作负载配置。' },
      { title: '完成与恢复', body: 'drain 需要按实际资源处理守护 Pod、裸 Pod 和本地临时数据，不能盲目添加强制参数。排空后维护节点，完成健康检查再 uncordon。节点变为可调度也不会自动迁回所有已迁走的应用。' },
    ], sources: ['drain', 'pdb', 'daemonset'], related: ['deployment', 'scheduling', 'storage', 'backup-upgrade'],
    fault: {
      name: '可用预算为零，排空被阻止', nodes: ['drain 请求', 'PDB minAvailable=2', '两个就绪副本', '驱逐结果'],
      steps: [
        ['准备驱逐一个副本', 0, 1, 'EVICTION REQUEST', '独立场景：Deployment 有两个就绪副本，PDB minAvailable=2，目标节点上有其中一个。', 'disruptionsAllowed=0', 'request'],
        ['检查剩余可用数量', 1, 2, 'WOULD DROP TO 1', '驱逐后不能满足预算，PDB 不会自动增加第三个副本或提供额外节点。', '预算条件不满足', 'check'],
        ['拒绝本次驱逐', 1, 3, 'EVICTION BLOCKED', 'drain 会等待或重试，不能把这解释为 Kubernetes 随机卡住。', '维护尚未完成', 'reject'],
        ['先准备安全余量', 2, 2, 'REVIEW CAPACITY / BUDGET', '按业务需求准备额外健康副本与容量，或审查预算设计；不直接关闭驱逐约束来掩盖可用性风险。', '修正前提再维护', 'local'],
      ], code: ['读取 disruptionsAllowed', '确认 currentHealthy / desiredHealthy', '准备额外副本与调度容量', '重新验证预算和业务健康'],
      example: sh('检查 PDB 阻塞证据', '应用存在 PDB 时使用；本示例不绕过预算，不执行删除。', `kubectl -n demo get pdb
kubectl -n demo describe pdb
kubectl -n demo get deployment web
kubectl -n demo get pods -l app=web -o wide`, '核对 selector 是否确实匹配目标 Pod，以及预算、健康副本和可调度余量。'),
    },
  },
  {
    id: 'backup-upgrade', group: 2, title: '备份、恢复与升级', en: 'BACKUP · RESTORE · UPGRADE',
    summary: '把控制面状态、应用数据、版本兼容与恢复演练作为一组运维约束。',
    principle: '可恢复性来自可验证的备份与恢复流程；升级需要按发行版、组件版本与工作负载条件逐步推进。',
    tradeoff: '更频繁备份和演练降低恢复不确定性，也带来存储、保密、维护窗口和验证成本。',
    pitfall: 'etcd 快照不包含外部 PV 的业务数据；快照文件存在也不能证明整个业务可恢复。',
    nodes: ['控制面状态', '应用 / 卷数据', '隔离恢复环境', '升级计划'],
    steps: [
      ['盘点备份对象', 0, 1, 'STATE + APPLICATION DATA', '假设自管集群需要维护。分别识别 etcd、应用卷、外部数据库、证书和配置等恢复依赖。', '备份范围覆盖不同层', 'check'],
      ['验证恢复能力', 0, 2, 'RESTORE DRILL', '按对应工具与版本，在隔离环境验证恢复流程，不能对在线集群直接套用恢复命令。', '恢复证据可复核', 'control'],
      ['核对升级约束', 3, 3, 'VERSION / ADD-ON CHECK', '检查组件版本偏差、发行版升级路径、API 移除与 CNI/CSI 等插件兼容。托管服务遵守供应商流程。', '升级前提明确', 'local'],
      ['分批维护并验收', 3, 2, 'STAGED VALIDATION', '按方案逐步升级控制面与节点，每步观察节点、系统组件与业务；图解不提供适用所有集群的自动脚本。', '完成需依靠实际验收', 'check'],
    ], code: ['盘点控制面与业务数据', '验证备份完整性并演练恢复', '核对目标版本和插件兼容', '分批维护，每步验证业务'],
    example: sh('升级前盘点版本', '只读盘点；不执行升级或恢复。自管 kubeadm、其他发行版和托管服务的后续流程不同。', `kubectl version -o yaml
kubectl get nodes -o wide
kubectl get apiservices
kubectl -n kube-system get pods -o wide
kubectl get storageclasses`, '记录组件与驱动版本并查对应升级文档；版本偏差不能简单假设为“相差一版都可以”。'),
    sections: [
      { title: '备份分层', body: 'etcd 保存 Kubernetes API 状态与敏感对象，应用卷数据通常位于其他存储。外部数据库、对象存储、证书和加密密钥也可能是恢复依赖。备份范围和一致性要求应由应用恢复目标决定。' },
      { title: '恢复必须演练', body: '快照校验只能说明部分文件属性，不能证明业务能启动和数据正确。etcd 恢复工具、证书、成员配置与版本需要相符；在线恢复还涉及停服务与缓存一致性，必须遵循明确官方流程。' },
      { title: '升级按实际部署方式', body: 'kubeadm 的计划和逐节点流程不能直接替代云厂商或其他发行版流程。核对版本偏差、已移除 API、Webhook、CNI/CSI 和监控插件，再结合 drain、PDB、备份和验证窗口推进。' },
    ], sources: ['etcd', 'upgrade', 'skew', 'storage'], related: ['drain', 'storage', 'statefulset', 'observability'],
    fault: {
      name: '控制面恢复了，业务数据没有', nodes: ['etcd 快照', 'API 资源', '缺失业务卷', '业务验证'],
      steps: [
        ['从控制面快照恢复', 0, 1, 'RESTORE API STATE', '独立场景：演练环境已恢复 etcd 资源状态，但后端业务卷没有相应备份。', '资源定义可重新出现', 'control'],
        ['声明不等于卷内容', 1, 2, 'PVC METADATA ≠ DATA', 'PVC/PV 对象描述并不包含卷中的数据库文件，后端卷可缺失或与恢复时点不一致。', '业务数据仍可能不可用', 'check'],
        ['业务验收失败', 3, 3, 'APPLICATION CHECK FAILS', '即使 API 可用、部分 Pod 已运行，应用也可能缺数据、报错或结果不一致。', '不能宣称完整恢复', 'local'],
        ['补齐分层恢复设计', 3, 2, 'RECOVERY GAP', '明确卷和数据库备份、一致性与顺序，在隔离演练中证明目标。不能让一份 etcd 快照替代全部业务恢复方案。', '恢复范围需覆盖真实依赖', 'check'],
      ], code: ['区分资源元数据与业务内容', '核对备份的时间点与依赖', '隔离环境恢复应用数据', '验证业务正确性和恢复目标'],
      example: sh('盘点卷与业务依赖', '需要相应只读权限；命令不读取 Secret 值，不做恢复，不验证备份内容。', `kubectl get pvc -A
kubectl get pv
kubectl get statefulsets -A
kubectl get storageclasses`, '将资源清单与存储后端及应用备份记录对应；kubectl 列表不能替代后端数据恢复测试。'),
    },
  },
];
