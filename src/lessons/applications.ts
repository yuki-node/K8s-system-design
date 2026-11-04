import { sh, yaml, type Lesson } from '../course-types';

export const applications: Lesson[] = [
  {
    id: 'deployment', group: 1, title: 'Deployment 与滚动发布', en: 'DEPLOYMENT & ROLLOUT',
    summary: '追踪 Deployment、ReplicaSet 和 Pod 的关系，观察新旧副本如何交替。',
    principle: 'Deployment 通过 ReplicaSet 推进 Pod 模板更新；可用性取决于策略、就绪和容量。',
    tradeoff: 'maxSurge 用额外容量换取发布余量，maxUnavailable 用可用副本预算限制发布期间的下降。',
    pitfall: 'Deployment 进度超时会报告失败，不会自动回滚；业务兼容性和数据迁移也不会由它自动保证。',
    nodes: ['Deployment', '新 ReplicaSet', '旧 ReplicaSet', 'Pod 就绪状态'],
    steps: [
      ['变更 Pod 模板', 0, 1, 'NEW TEMPLATE', '假设 RollingUpdate Deployment 从 v1 更新到可工作的 v2。模板变化触发新 ReplicaSet。', 'revision 增加', 'control'],
      ['在预算内扩新副本', 1, 3, 'SCALE UP NEW RS', '控制器遵守 surge 与 unavailable 预算，新 Pod 还需经过调度、启动与就绪。', '新副本逐渐 Ready', 'control'],
      ['逐步缩旧副本', 0, 2, 'SCALE DOWN OLD RS', '在允许的可用性预算内缩减旧 ReplicaSet；不是先删光旧 Pod 再等待新应用。', '新旧副本共存', 'control'],
      ['验证发布结果', 3, 0, 'ROLLOUT PROGRESS', '状态达到发布条件后仍应做请求成功率、延迟与业务验收。图中四步压缩了多次控制循环。', '控制器完成 ≠ 业务已验收', 'data'],
    ], code: ['更新 spec.template', '创建或选择新 ReplicaSet', '按 maxSurge / maxUnavailable 调整副本', '观察 rollout 与业务指标'],
    example: yaml('可运行的滚动更新清单', 'demo 已存在；该清单定义 demo/web，可与入门实验对齐。修改镜像版本才会产生模板修订。', 'deployment.yaml', `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: demo
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels: {app: web}
  template:
    metadata:
      labels: {app: web}
    spec:
      containers:
        - name: web
          image: nginx:1.28
          resources:
            requests: {cpu: 100m, memory: 64Mi}
            limits: {cpu: 500m, memory: 128Mi}
          readinessProbe:
            httpGet: {path: /, port: 80}`, '两个副本为目标；发布可能需要第三个 Pod 的暂时容量，终止中的 Pod 也可能暂时占用资源。'),
    sections: [
      { title: '模板修订与副本数不同', body: '改变 Pod 模板会触发 rollout，单纯修改 replicas 属于扩缩容。历史 ReplicaSet 让部分回滚成为可能，但保留数量和外部配置会影响结果；回滚模板不会回滚外部数据库数据。' },
      { title: '就绪是发布门槛之一', body: '可用副本判断与就绪、minReadySeconds 等条件有关。探针如果只检查进程存在，控制器可能认为发布成功，而真实请求已经失败。策略和健康检查需要根据应用行为共同设计。' },
      { title: '进度失败后的动作', body: 'ProgressDeadlineExceeded 是需要调查的条件。先查新 ReplicaSet、Pod 事件、镜像和就绪，再决定修正或显式回滚。自动化发布平台可以加策略，但它不是 Deployment 默认保证。' },
    ], sources: ['deployment', 'probes'], related: ['reconcile', 'probes', 'hpa', 'drain'],
    fault: {
      name: '新版本一直不就绪', nodes: ['Deployment', '新 ReplicaSet', '新 Pod', '旧 ReplicaSet'],
      steps: [
        ['新版本开始发布', 0, 1, 'ROLLOUT START', '独立场景：replicas=2、maxSurge=1、maxUnavailable=0，新模板使用错误的 readiness 路径。', '允许增加一个新 Pod', 'control'],
        ['新 Pod 就绪失败', 1, 2, 'READY=FALSE', '镜像能启动但探针失败，新 Pod 不满足可用条件。', '更新副本已创建但不可用', 'control'],
        ['旧副本保持预算', 0, 3, 'KEEP AVAILABLE OLD PODS', '在此场景的预算与旧 Pod 健康条件下，控制器无法继续缩旧副本来完成更新。', '发布停滞 · 旧副本仍服务', 'control'],
        ['报告并诊断进度', 0, 0, 'PROGRESS DEADLINE', '超过配置的进度时限后会报告条件，不会自行回滚。先保留事件与版本，再做明确修正。', '需要人为或发布平台决策', 'local'],
      ], code: ['读取 Deployment conditions', '检查新 RS 与 Pod readiness', '核对 revision 与模板差异', '修正模板或显式回滚'],
      example: sh('检查发布卡在哪个修订', '已存在 demo/web；命令均为观察，不执行回滚。', `kubectl -n demo rollout status deployment/web --timeout=30s
kubectl -n demo rollout history deployment/web
kubectl -n demo describe deployment web
kubectl -n demo get pods -l app=web -o wide`, '超时只是观察窗口结束；结合 conditions、事件和 revision 确认发布状态。'),
    },
  },
  {
    id: 'statefulset', group: 1, title: 'StatefulSet 与稳定身份', en: 'STATEFULSET & IDENTITY',
    summary: '理解稳定序号、网络身份和卷声明，区分身份管理与数据库复制。',
    principle: 'StatefulSet 管理稳定身份；数据复制、主从选举与备份仍由应用或专门系统负责。',
    tradeoff: '有序创建和稳定存储便于状态系统管理，也可能让前一个实例的不就绪阻塞后续进度。',
    pitfall: '同名 Pod 重建不等于数据一定安全；PVC 保留策略、PV 回收策略与后端数据保护必须分别核对。',
    nodes: ['StatefulSet', 'Headless Service', 'Pod web-0', 'PVC / PV'],
    steps: [
      ['声明稳定身份', 0, 1, 'SERVICE NAME', '假设 Headless Service 已创建，StatefulSet 指向它来建立稳定的网络命名基础。', '命名与发现关系明确', 'control'],
      ['创建有序实例', 0, 2, 'ORDINAL 0', '默认 OrderedReady 从较小序号开始推进，Pod 名带序号。可以配置其他管理策略，不能一概而论。', '实例名稳定 · UID 可变化', 'control'],
      ['绑定实例卷', 2, 3, 'CLAIM PER ORDINAL', '有 volumeClaimTemplates 时，实例关联独立 PVC；卷能否供给和挂载取决于存储环境。', '身份与卷声明关联', 'control'],
      ['应用自行管理数据', 2, 2, 'APPLICATION RESPONSIBILITY', '稳定身份支持应用搭建成员关系，但不会自动配置数据库副本、选主或一致性协议。', '应用数据语义仍需实现', 'local'],
    ], code: ['创建 governing Headless Service', '为 Pod 分配稳定 ordinal', '按模板关联每实例 PVC', '由应用负责复制与恢复'],
    example: yaml('不依赖存储插件的身份实验', 'demo 已存在；该完整清单专门观察身份，不声明持久卷，也不把 nginx 解释为数据库。', 'statefulset.yaml', `apiVersion: v1
kind: Service
metadata:
  name: stable-web
  namespace: demo
spec:
  clusterIP: None
  selector: {app: stable-web}
  ports:
    - port: 80
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: stable-web
  namespace: demo
spec:
  serviceName: stable-web
  replicas: 2
  selector:
    matchLabels: {app: stable-web}
  template:
    metadata:
      labels: {app: stable-web}
    spec:
      containers:
        - name: web
          image: nginx:1.28
          readinessProbe:
            httpGet: {path: /, port: 80}`, '应看到 stable-web-0 和 stable-web-1；稳定网络身份的解析还依赖 DNS 与就绪等条件。'),
    sections: [
      { title: '名字稳定，实例仍会替换', body: 'Pod 替换后序号和名称可保持，UID、IP 和节点仍可能改变。应用应通过稳定身份与发现机制识别成员，而不是永久记录一次分配的 IP。Headless Service 不提供普通 ClusterIP 负载均衡入口。' },
      { title: '保留不等于备份', body: 'PVC 默认保留语义与可配置的 StatefulSet PVC 保留策略需要核对。PV 的 Retain/Delete 又是另一层，最终后端卷是否存在及能否恢复需按存储系统验证。' },
      { title: '序号不是复制协议', body: 'web-0 不会天然成为安全的数据库主节点。顺序启动只能帮助依赖初始化；应用成员发现、写入权限、仲裁、同步和恢复仍需独立设计，通常由数据库本身或 Operator 实现。' },
    ], sources: ['statefulset', 'storage', 'dns'], related: ['storage', 'dns', 'deployment', 'backup-upgrade'],
    fault: {
      name: '首个实例不就绪，后续等待', nodes: ['OrderedReady', 'Pod ordinal 0', '就绪条件', 'Pod ordinal 1'],
      steps: [
        ['按默认顺序创建', 0, 1, 'CREATE ORDINAL 0', '独立场景：新的 StatefulSet 使用默认 OrderedReady，序号 0 因启动配置错误无法就绪。', '第一个 Pod 已创建', 'control'],
        ['检查先前实例', 0, 2, 'WAIT FOR READY', '默认创建流程要求前一个实例达到运行和就绪条件后再创建后续实例。', '先前就绪条件未满足', 'check'],
        ['后续实例未推进', 3, 3, 'WAITING FOR PREDECESSOR', '序号 1 可能尚未创建，这不同于它已经存在但调度 Pending。', '后续创建受阻', 'local'],
        ['处理最早的阻塞点', 1, 1, 'FIX FIRST FAILURE', '先查序号 0 的事件、日志、探针和卷；改为 Parallel 不是修复应用依赖的通用答案。', '诊断顺序由管理策略决定', 'local'],
      ], code: ['确认 podManagementPolicy', '定位最早未就绪序号', '检查它的事件与依赖', '修复后观察后续创建'],
      example: sh('检查有序创建进度', '已应用身份实验清单；如果所有副本健康，此命令只显示正常状态。', `kubectl -n demo get statefulset stable-web -o yaml
kubectl -n demo get pods -l app=stable-web
kubectl -n demo describe pod stable-web-0`, '对照 podManagementPolicy、readyReplicas 与首个 Pod 的事件。'),
    },
  },
  {
    id: 'daemonset', group: 1, title: 'DaemonSet 与节点服务', en: 'DAEMONSET',
    summary: '为符合条件的节点部署一份守护工作负载，理解调度条件如何改变覆盖范围。',
    principle: 'DaemonSet 面向符合条件的节点集合，副本目标来自节点资格而非一个固定 replicas 值。',
    tradeoff: '节点级覆盖适合日志代理等服务，但每增加一个节点也会增加常驻资源和维护负担。',
    pitfall: 'DaemonSet 不是无条件在每个节点运行；标签、污点容忍、资源和模板约束仍会影响结果。',
    nodes: ['DaemonSet', '符合条件节点', '守护 Pod', '节点新增事件'],
    steps: [
      ['识别节点资格', 0, 1, 'ELIGIBLE NODES', '假设模板选择 Linux 节点并具有合适容忍。节点资格与是否能最终成功运行仍应分开观察。', '目标节点集合已确定', 'check'],
      ['为目标节点建 Pod', 0, 2, 'CREATE DAEMON POD', '控制器为需要覆盖的节点创建相应 Pod，并通过节点亲和性等机制约束目标。', '每目标节点一份常规副本', 'control'],
      ['节点变化被观察', 3, 0, 'NEW NODE', '符合条件的新节点进入集群后，控制器会重新计算需要覆盖的节点。', '目标集合可能增加', 'data'],
      ['持续核对覆盖', 0, 0, 'DESIRED / READY', '比较 desired、current、ready、available 等状态；有 Pod 不代表守护服务已经健康。', '覆盖与健康分别观测', 'local'],
    ], code: ['读取节点与模板约束', '为缺少守护 Pod 的合格节点创建', '调度器与 kubelet 推进运行', '持续比较 desired / ready'],
    example: yaml('非特权守护 Pod 实验', 'demo 已存在且有 Linux 节点；只是演示每节点部署，不提供真实日志采集，也不挂载宿主机路径。', 'daemonset.yaml', `apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-demo
  namespace: demo
spec:
  selector:
    matchLabels: {app: node-demo}
  template:
    metadata:
      labels: {app: node-demo}
    spec:
      nodeSelector:
        kubernetes.io/os: linux
      containers:
        - name: agent
          image: busybox:1.37
          command: [sh, -c, 'while true; do date; sleep 30; done']
          resources:
            requests: {cpu: 10m, memory: 16Mi}
            limits: {cpu: 100m, memory: 32Mi}`, '观察 DESIRED 和 READY；有未容忍污点或资源不足的节点不保证能运行该 Pod。'),
    sections: [
      { title: '控制器与调度器分工', body: 'DaemonSet 控制器创建针对目标节点的 Pod，默认调度器负责完成放置流程。不能因此认为所有 DaemonSet 都绕过调度器。节点选择、亲和性及容忍决定覆盖资格和运行条件。' },
      { title: '每个节点的成本', body: '日志、监控和网络代理通常常驻节点。把每份 Pod 的 requests 乘以节点数才能估计总成本；批量更新时还应关注服务本身是否承担集群网络或日志等关键职责。' },
      { title: '排空时的特殊处理', body: '常规 drain 需要显式处理 DaemonSet 管理的 Pod；--ignore-daemonsets 允许继续排空其他 Pod，并不表示删除了这些守护 Pod。节点维护前应清楚哪些服务将随节点停止。' },
    ], sources: ['daemonset', 'drain', 'taints'], related: ['scheduling', 'observability', 'drain'],
    fault: {
      name: '专用节点没有被覆盖', nodes: ['专用节点污点', 'DaemonSet 模板', '目标 Pod', '状态观察'],
      steps: [
        ['节点带专用污点', 0, 0, 'DEDICATED=OPS:NOSCHEDULE', '独立场景：节点有自定义 NoSchedule 污点，模板没有对应容忍。自动添加的部分容忍不涵盖任意自定义污点。', '节点有排斥条件', 'local'],
        ['对照容忍配置', 1, 0, 'TOLERATION MISSING', 'DaemonSet 仍需满足相关污点条件，不能仅因为它是守护工作负载就假设覆盖全部节点。', '目标覆盖受约束', 'check'],
        ['该节点无运行实例', 2, 2, 'NOT RUNNING HERE', '根据资格和状态，可能不属于期望集合或对应 Pod 无法调度；应从节点条件和 Pod 事件分别确认。', '缺口尚未解释', 'local'],
        ['核对设计意图', 3, 1, 'REVIEW COVERAGE', '先判断该服务是否确实应该运行在专用节点，再对源模板增加精确容忍；不应盲目容忍全部污点。', '覆盖策略需要明确', 'check'],
      ], code: ['查看节点 taints', '查看 DaemonSet tolerations', '检查 desired 覆盖与 Pod Events', '按职责修正模板'],
      example: sh('检查覆盖差异', '已应用 node-demo 示例；节点污点与 Pod 是否存在需同时检查。', `kubectl -n demo get daemonset node-demo -o wide
kubectl -n demo get pods -l app=node-demo -o wide
kubectl -n demo get daemonset node-demo -o yaml
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints`, '对照节点范围、容忍与实际 Pod 的 NODE 列，区分资格与运行失败。'),
    },
  },
  {
    id: 'jobs', group: 1, title: 'Job 与 CronJob', en: 'BATCH & SCHEDULED JOBS',
    summary: '为会结束的任务选择控制器，并把重试、定时调度与业务幂等一起考虑。',
    principle: 'Job 追踪任务完成，CronJob 按计划创建 Job；业务副作用必须容忍重复执行。',
    tradeoff: '自动重试提高完成机会，也可能重复调用外部系统；禁止并发会减少重叠，但可能跳过计划。',
    pitfall: 'Job 和 CronJob 都不提供业务“恰好一次”保证，Forbid 也不是所有任务共享的全局互斥锁。',
    nodes: ['CronJob 计划', 'Job 对象', '任务 Pod', '完成状态'],
    steps: [
      ['到达计划时间', 0, 1, 'CREATE JOB', '假设 CronJob 未暂停，计划与并发策略允许，控制器创建一个 Job。调度不是硬实时保证。', '本次运行有独立 Job', 'control'],
      ['创建任务 Pod', 1, 2, 'RUN BATCH POD', 'Job 按并行度和完成条件推进 Pod，节点运行容器执行任务。', '任务正在执行', 'control'],
      ['报告执行结果', 2, 3, 'EXIT SUCCESS', '假设任务成功退出，控制器观察 Pod 成功并累计完成数量。', '成功次数增加', 'data'],
      ['满足完成条件', 3, 1, 'COMPLETE', '达到 Job 配置的成功条件后，任务结束。保留历史或清理由历史限制与 TTL 等设置决定。', 'Job 完成', 'control'],
    ], code: ['CronJob：计划 → Job', 'Job：创建任务 Pod', '失败按策略重试', '业务用稳定键去重或幂等'],
    example: yaml('一个会完成的 Job', 'demo 已存在；命令只输出时间，不产生外部业务副作用。', 'job.yaml', `apiVersion: batch/v1
kind: Job
metadata:
  name: clock-once
  namespace: demo
spec:
  backoffLimit: 2
  activeDeadlineSeconds: 120
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: clock
          image: busybox:1.37
          command: [sh, -c, 'date; echo completed']`, 'kubectl -n demo logs job/clock-once 读取输出；任务成功后 Pod 显示 Completed 是正常现象。'),
    sections: [
      { title: '任务会结束', body: 'Deployment 适合持续运行的服务，Job 适合有完成条件的批处理。restartPolicy 和 backoffLimit 等共同影响失败时的行为。计数和失败策略存在细节，不应把 backoffLimit 简化为恰好执行固定次数。' },
      { title: '并发策略的范围', body: 'CronJob 的 Allow、Forbid 和 Replace 对该 CronJob 创建的 Job 生效，不约束另一个 CronJob 或人为发起的任务。时区、暂停与 startingDeadlineSeconds 等影响计划解释和补调度。' },
      { title: '重复执行必须可承受', body: '在失败、控制器重试或调度边界下，任务需要按可能重复执行设计。扣款、发信或迁移数据应使用业务幂等键、事务或可检查的完成记录，不能只依赖 Pod 名称去重。' },
    ], sources: ['jobs', 'cronjob'], related: ['pod', 'reconcile', 'config', 'observability'],
    fault: {
      name: '任务失败后又执行一次', nodes: ['首次任务 Pod', '外部业务状态', 'Job 控制器', '重试 Pod'],
      steps: [
        ['先写入业务结果', 0, 1, 'SIDE EFFECT COMMITTED', '独立场景：任务先成功写入外部系统，随后在报告成功前退出失败。', '业务已发生一次副作用', 'data'],
        ['观察到 Pod 失败', 0, 2, 'POD FAILED', 'Job 只能按观察到的任务状态决定后续动作，无法知道任意外部写入是否完成。', 'Job 尚未满足完成条件', 'data'],
        ['创建重试实例', 2, 3, 'RETRY POD', '假设失败预算允许且使用 Never，控制器创建新的 Pod 重试。', '相同业务可能再次执行', 'control'],
        ['用业务键判断重复', 3, 1, 'IDEMPOTENCY CHECK', '任务应使用稳定业务身份和原子去重等机制。这里只展示检查关系，不宣称 Kubernetes 已提供去重。', '需要应用保证幂等', 'check'],
      ], code: ['任务执行前确定稳定业务键', '原子记录业务效果与完成状态', '重试读取已有结果', '避免重复副作用'],
      example: sh('查看失败与重试实例', '已存在 Job；将 clock-once 换成需要调查的 Job。成功的示例可能只有一个 Pod。', `kubectl -n demo describe job clock-once
kubectl -n demo get pods -l batch.kubernetes.io/job-name=clock-once
kubectl -n demo logs job/clock-once --tail=100`, '按 Job 标签找关联 Pod；需要时分别读取每个 Pod 日志，单份日志不代表所有尝试。'),
    },
  },
  {
    id: 'config', group: 1, title: 'ConfigMap 与 Secret', en: 'CONFIGURATION & SECRETS',
    summary: '把配置与镜像分离，理解环境变量、投射卷和机密存储的不同边界。',
    principle: '配置对象、注入方式和应用重载是三层；更新对象不会自动重启或重载所有应用。',
    tradeoff: '外置配置便于变更与复用，也需要版本、发布联动和权限管理，避免配置与代码错配。',
    pitfall: 'Secret 的 base64 不是加密；默认环境变量不随对象更新而变化，subPath 挂载也不会自动收到更新。',
    nodes: ['配置对象', 'kubelet', '容器注入', '应用读取'],
    steps: [
      ['创建配置对象', 0, 0, 'CONFIGMAP / SECRET', '假设 demo 内已创建 ConfigMap；它保存非机密配置，Secret 用于有权限管理要求的敏感数据。', '对象位于 API 中', 'local'],
      ['节点读取配置', 0, 1, 'RESOLVE REFERENCE', 'Pod 引用同一命名空间的对象，节点按配置准备环境变量或卷。', '引用必须存在或允许缺省', 'data'],
      ['注入运行环境', 1, 2, 'ENV OR VOLUME', '环境变量在容器创建时设置；普通投射卷更新会经过传播，而非同步即时。', '注入方式影响更新行为', 'control'],
      ['应用使用配置', 2, 3, 'APPLICATION READ', '应用是否重新读取文件或缓存值取决于应用自己。挂载内容更新不等于业务配置已生效。', '需验证实际生效值', 'data'],
    ], code: ['对象：保存配置', 'Pod：声明 env 或 volume 引用', '节点：按方式注入', '应用：自行读取与重载'],
    example: yaml('环境变量与卷对照实验', 'demo 已存在；仅使用无敏感信息的演示 ConfigMap。', 'config.yaml', `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: demo
data:
  MODE: learning
---
apiVersion: v1
kind: Pod
metadata:
  name: config-reader
  namespace: demo
spec:
  containers:
    - name: reader
      image: busybox:1.37
      command: [sh, -c, 'while true; do echo "$MODE"; cat /config/MODE; sleep 10; done']
      env:
        - name: MODE
          valueFrom:
            configMapKeyRef: {name: app-config, key: MODE}
      volumeMounts:
        - name: config
          mountPath: /config
          readOnly: true
  volumes:
    - name: config
      configMap: {name: app-config}`, '两份值起初相同；更新 ConfigMap 后文件可延迟更新，已运行容器的 MODE 环境变量保持原值。'),
    sections: [
      { title: '更新传播与重载', body: '普通 ConfigMap/Secret 投射卷可经过 kubelet 同步与缓存传播更新，应用仍需重新读取。环境变量通常需要新建容器才能取得新值；subPath 挂载不会收到自动更新。' },
      { title: 'Secret 仍需保护', body: 'Secret 编码不代表加密。静态加密配置、最小 RBAC、节点与应用访问权限以及外部机密系统共同影响保护效果。避免把真实 Secret 内容写进 Git、日志、截图或排障输出。' },
      { title: '配置也需要发布策略', body: '同一可变 ConfigMap 更新可能影响多个应用。版本化名称、不可变对象或模板校验和等方式可以把配置与发布关联，但都需要团队约定与清理策略；Kubernetes 不自动判断业务兼容性。' },
    ], sources: ['configmap', 'secrets'], related: ['deployment', 'rbac', 'pod-debug', 'api'],
    fault: {
      name: '对象更新了，环境变量没变', nodes: ['新 ConfigMap', '运行中容器', '环境变量', '投射文件'],
      steps: [
        ['更新配置对象', 0, 0, 'MODE=UPDATED', '独立场景：ConfigMap MODE 从 learning 改为 updated，容器已经运行。', 'API 对象已变更', 'local'],
        ['对照注入方式', 1, 2, 'ENV SNAPSHOT', '该容器的环境变量在创建时已确定，不会因 ConfigMap 更新自动改变。', 'env 仍为 learning', 'check'],
        ['卷路径稍后更新', 0, 3, 'EVENTUAL PROJECTION', '假设使用普通完整卷挂载而非 subPath，文件会在后续同步中更新，传播时间依配置而异。', '文件可能先后变更', 'data'],
        ['验证应用读取', 1, 1, 'RELOAD OR RECREATE', '确认应用读取的是 env 还是文件，再选择重载或通过控制器重建；裸 Pod 没有 rollout restart。', '更新策略由注入方式决定', 'local'],
      ], code: ['读取源对象新值', '确认 env / volume / subPath', '验证运行中应用实际读取路径', '按应用方式重载或重新创建'],
      example: sh('比较配置对象与容器输出', '已应用 config.yaml；此处只读取非机密 ConfigMap，不打印 Secret。', `kubectl -n demo get configmap app-config -o yaml
kubectl -n demo logs config-reader --tail=20
kubectl -n demo get pod config-reader -o yaml`, '对照 MODE 环境注入、文件挂载与日志；未更新对象时两者应相同。'),
    },
  },
  {
    id: 'service', group: 1, title: 'Service 与 EndpointSlice', en: 'SERVICE & ENDPOINTSLICE',
    summary: '用稳定服务入口连接可替换的 Pod，追踪选择器、端点条件与数据面。',
    principle: 'Service 提供稳定抽象，EndpointSlice 描述后端；数据面据此实现流量转发。',
    tradeoff: '稳定入口隐藏 Pod 更替，也增加服务发现和转发状态的传播环节。',
    pitfall: 'Service 对象不负责运行应用；有 ClusterIP 或 DNS 记录也不保证存在可用端点。',
    nodes: ['客户端 Pod', 'Service 数据面', 'EndpointSlice', '就绪后端 Pod'],
    steps: [
      ['请求稳定入口', 0, 1, 'CONNECT CLUSTERIP', '假设普通 ClusterIP Service 选择 demo 内的健康 Pod，客户端发出新连接。', '目标是服务地址与端口', 'request'],
      ['依据端点配置', 2, 1, 'ENDPOINT CONFIG', 'kube-proxy 或替代实现根据 Service 与 EndpointSlice 配置转发规则。这是控制关系，不是逐请求查询 API。', '数据面已有后端视图', 'control'],
      ['转发到目标端口', 1, 3, 'FORWARD TARGETPORT', '数据面选择可用后端并按目标端口转发；具体实现与会话行为由数据面和配置决定。', '应用收到请求', 'request'],
      ['观察后端变更', 3, 2, 'READINESS / LIFECYCLE', 'Pod 生命周期和就绪的观察通过相关控制器反映到 EndpointSlice；图中压缩了状态上报环节。', '后端视图持续更新', 'control'],
    ], code: ['selector → Pod 集合', 'Pod 条件 → EndpointSlice', 'Service + endpoints → 数据面规则', '客户端连接 → 后端 targetPort'],
    example: yaml('与入门 Deployment 对应的 Service', 'demo/web Pod 的标签为 app=web，nginx 监听 80；不创建公网负载均衡。', 'service.yaml', `apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: demo
spec:
  type: ClusterIP
  selector:
    app: web
  ports:
    - name: http
      port: 80
      targetPort: 80`, '集群内以 web.demo.svc 的 80 端口访问，实际域后缀取决于集群配置。'),
    sections: [
      { title: 'port 与 targetPort', body: 'port 是 Service 接受连接的端口，targetPort 指向后端应用监听的端口或命名端口。声明 containerPort 不会让程序自动监听；需要从应用监听地址和实际协议核查。' },
      { title: 'EndpointSlice 是后端视图', body: '常见带 selector 的 Service 由控制器维护 EndpointSlice，其中包含地址和 ready、serving、terminating 等条件。无 selector Service、Headless Service 及特殊发布配置具有不同语义，不能套用一个固定流程。' },
      { title: '不要把 API 当作业务代理', body: '转发通常由节点规则或替代数据面完成，不是每个请求都访问 API Server。数据面可能用 iptables、IPVS、nftables 或 eBPF 等方案，课程不将其中一种实现等同于 Service 的全部定义。' },
    ], sources: ['service', 'endpoints', 'architecture'], related: ['labels', 'probes', 'dns', 'service-debug'],
    fault: {
      name: '端点有了，目标端口错了', nodes: ['客户端', 'Service port 80', 'targetPort 8080', '应用监听 80'],
      steps: [
        ['DNS 与入口正常', 0, 1, 'CONNECT SERVICE', '独立场景：Service 能解析，Pod 已就绪，但 Service targetPort 错填成 8080。', '入口存在', 'request'],
        ['按错误端口转发', 1, 2, 'FORWARD :8080', '转发配置只按声明映射，不会自动探测并改成 nginx 实际端口。', '目标端口不正确', 'request'],
        ['端口不提供服务', 2, 3, 'NO LISTENER', '该 Pod 的 8080 没有监听，可能看到拒绝连接或超时，具体取决于网络路径。', '应用未收到有效 HTTP 请求', 'reject'],
        ['逐层核对配置', 1, 3, 'COMPARE PORTS', '对照 Service port、targetPort、EndpointSlice 端口与进程监听，避免把端口错误误诊为 DNS。', '根因在端口映射', 'check'],
      ], code: ['先确认 ready endpoints', '核对 Service targetPort', '确认应用真实监听端口', '修正声明并重测'],
      example: sh('检查服务与端点端口', '已应用入门实验；若配置正确则输出应一致。', `kubectl -n demo get service web -o yaml
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl -n demo logs deployment/web --tail=30`, 'EndpointSlice 的 ports 应与应用实际监听吻合；应用日志无请求也可提示请求未抵达。'),
    },
  },
  {
    id: 'dns', group: 1, title: '集群 DNS 与服务发现', en: 'CLUSTER DNS',
    summary: '从短名称与命名空间出发，理解服务记录、搜索域和 Headless 解析。',
    principle: 'DNS 解决名称到记录的发现问题，不能替代端点健康或连通性检查。',
    tradeoff: '短名称便于同空间调用，跨空间与自定义集群域则需要更明确的名称和配置。',
    pitfall: 'web 默认在调用方命名空间查找；cluster.local 只是常见集群域，不是所有集群的必然配置。',
    nodes: ['客户端 Pod', 'DNS 搜索域', '集群 DNS', 'Service 记录'],
    steps: [
      ['应用请求短名称', 0, 1, 'LOOKUP WEB', '假设调用方也在 demo，使用默认集群 DNS 策略查询 web。', '查询上下文来自 Pod', 'request'],
      ['解析搜索域', 1, 2, 'WEB.DEMO.SVC', '解析器按配置的 search、ndots 等生成候选查询；实际顺序取决于解析器和 resolv.conf。', '补全服务命名空间', 'request'],
      ['查询服务记录', 2, 3, 'SERVICE DNS RECORD', '普通 ClusterIP Service 常返回服务 IP；Headless 的记录语义不同。', '得到对应记录', 'check'],
      ['返回解析结果', 2, 0, 'DNS ANSWER', '应用得到地址后再建立网络连接，DNS 解析成功不会证明 HTTP 请求或后端健康。', '发现完成 · 连通性另查', 'data'],
    ], code: ['短名按调用方搜索域解释', '普通 Service → 服务 IP 记录', 'Headless → 后端相关记录', '解析后再验证服务访问'],
    example: sh('在 Pod 内检查解析', '实验集群能拉取 busybox:1.37 且允许创建 Pod；命令结束后自动删除临时 Pod。', `kubectl -n demo run dns-check --rm -i --restart=Never --image=busybox:1.37 -- sh -c 'cat /etc/resolv.conf; nslookup web; nslookup web.demo.svc'`, '核对 search 域和 nameserver；如果服务存在，查询应得到记录。网络策略可能影响 DNS 请求。'),
    sections: [
      { title: '短名与跨空间调用', body: '同空间可使用 web，跨空间可以使用 web.demo 等形式，完整域名需按集群实际域补全。先在调用方容器查看 resolv.conf，避免把本机或另一命名空间的解析结果当作应用环境。' },
      { title: '普通与无头服务', body: 'ClusterIP Service 把服务发现与后端替换分离。Headless Service 不分配常规 ClusterIP，DNS 可直接提供后端地址，应用需要理解多地址、缓存和变化；就绪发布配置也会影响记录。' },
      { title: '解析链也有依赖', body: 'CoreDNS 等集群 DNS 实现依赖自身 Pod、Service、配置与网络。如果启用出站隔离，应同时考虑 DNS 的 UDP/TCP 访问和实际 DNS 路径，包括可能存在的节点本地 DNS。' },
    ], sources: ['dns', 'service', 'debugservice'], related: ['service', 'statefulset', 'network-policy', 'service-debug'],
    fault: {
      name: '跨空间仍使用短名称', nodes: ['frontend Pod', 'web.frontend', 'web.demo', 'DNS 响应'],
      steps: [
        ['调用方位于 frontend', 0, 1, 'LOOKUP WEB', '独立场景：服务只存在 demo，而应用位于 frontend 并查询短名 web。', '默认搜索调用方空间', 'request'],
        ['当前空间没有服务', 1, 1, 'NAME NOT FOUND', '候选 web.frontend 不对应目标服务；若该空间有同名服务，还可能访问错误对象。', '名称存在歧义', 'local'],
        ['明确目标命名空间', 0, 2, 'LOOKUP WEB.DEMO', '使用含目标命名空间的名称，且按实际集群域和解析器配置验证解析结果。', '目标身份已明确', 'request'],
        ['分开检查连接', 3, 0, 'RESOLVE THEN CONNECT', '成功取得正确记录后仍需检查端口、端点和网络策略；不能据此承诺可访问。', 'DNS 只是排查一层', 'data'],
      ], code: ['确认调用方 namespace', '查看 resolv.conf 的 search', '使用带目标 namespace 的服务名', '对照结果再检查 TCP/HTTP'],
      example: sh('核对服务所在空间', 'demo/web Service 存在；此命令不创建 frontend 命名空间，只检查目标。', `kubectl get services -A
kubectl -n demo get service web
kubectl -n demo run dns-cross-check --rm -i --restart=Never --image=busybox:1.37 -- nslookup web.demo.svc`, '先确认服务所在空间，再从实际调用方环境重复解析，避免在错误空间验证。'),
    },
  },
  {
    id: 'ingress', group: 1, title: 'Ingress 与 Gateway API', en: 'HTTP ROUTING & GATEWAYS',
    summary: '把入口规则、控制器实现与 Service 后端分开，理解域名和路径如何生效。',
    principle: '路由资源是声明；必须有对应控制器和数据面才会实际处理外部流量。',
    tradeoff: '集中入口便于 TLS 和路由管理，也需要明确控制器能力、路由归属与变更权限。',
    pitfall: '创建 Ingress 不会自动安装控制器；Gateway API 是扩展 API，集群需安装相应 CRD 和实现。',
    nodes: ['HTTP 客户端', '入口数据面', '路由规则', 'Service 后端'],
    steps: [
      ['声明 Host 与 Path', 2, 1, 'PROGRAM ROUTE', '假设已安装且配置匹配的 Ingress 控制器，规则指向 demo/web Service。', '控制器观察并编程入口', 'control'],
      ['请求到达入口', 0, 1, 'HOST: WEB.EXAMPLE.TEST', '客户端通过实际入口地址访问，HTTP Host 与规则匹配；DNS 指向和入口可达需另外配置。', '入口已接收请求', 'request'],
      ['匹配路由条件', 1, 2, 'MATCH HOST / PATH', '此处表示路由决策关系，并非每次请求向 API 查询规则；实际转发依实现。', '匹配后端服务', 'check'],
      ['向后端转发', 1, 3, 'PROXY HTTP', '入口数据面把流量交给后端服务相关路径，最终应用能否处理还需端点和网络条件。', '到达后端处理路径', 'request'],
    ], code: ['安装并选择入口控制器', '声明 IngressClass 或 GatewayClass', '配置路由、DNS 与 TLS', '核对 status 与实际 HTTP 请求'],
    example: yaml('标准 Ingress 规则', '已安装 ingressClassName=nginx 的兼容控制器，demo/web Service 存在。示例域名不配置真实 DNS。', 'ingress.yaml', `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
  namespace: demo
spec:
  ingressClassName: nginx
  rules:
    - host: web.example.test
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port: {number: 80}`, '只有匹配的控制器处理规则后才可能生效；先核对实际控制器支持与入口地址。'),
    sections: [
      { title: '规则与实现', body: 'Ingress 主要表达 HTTP(S) 路由，IngressClass 关联实现；注解和高级行为常具有控制器差异。Ingress API 已冻结，新能力主要在 Gateway API 演进，冻结并不等于已从 Kubernetes 删除。' },
      { title: 'Gateway 的角色划分', body: 'Gateway API 用 GatewayClass、Gateway、HTTPRoute 等资源划分基础设施、入口和应用路由职责。CRD、控制器、支持的扩展与跨命名空间授权都需要明确，不能只复制一个 HTTPRoute 就假设可用。' },
      { title: '按流量路径排查', body: '入口地址和 Host、TLS、路径匹配、控制器日志、后端 Service、端点与应用逐层检查。入口返回 404、502 或超时通常反映不同环节，但具体错误码必须结合控制器实现判断。' },
    ], sources: ['ingress', 'gateway', 'service'], related: ['service', 'dns', 'rbac', 'service-debug'],
    fault: {
      name: '规则存在，没人处理', nodes: ['Ingress 对象', 'IngressClass', '控制器实例', '入口状态'],
      steps: [
        ['API 接受路由', 0, 0, 'INGRESS CREATED', '独立场景：集群支持 Ingress 资源，但没有安装匹配的控制器。对象创建成功。', '声明存在', 'local'],
        ['检查类的归属', 0, 1, 'CLASS REFERENCE', 'ingressClassName 指向一个实现约定，不能通过名字自动下载并运行那个实现。', '缺少实际执行组件', 'check'],
        ['没有控制器推进', 2, 2, 'NO RECONCILER', '没有匹配控制器就没有预期的数据面编程过程，API Server 不会承担入口代理。', '规则未变成入口能力', 'local'],
        ['核实而非反复 apply', 3, 1, 'CHECK IMPLEMENTATION', '检查类、控制器和状态；反复提交相同规则不能补齐缺失组件。状态为空也需结合实现判断。', '先满足实现前提', 'check'],
      ], code: ['检查 IngressClass', '确认对应控制器实际运行', '检查控制器选择规则与事件', '再验证入口地址和 Host'],
      example: sh('检查入口前提', '已有 demo/web Ingress；get pods -A 需要相应权限，控制器名称与命名空间依安装方式而异。', `kubectl get ingressclass
kubectl -n demo describe ingress web
kubectl get pods -A
kubectl api-resources --api-group=gateway.networking.k8s.io`, '最后一条帮助确认 Gateway API 资源是否已安装，不意味着某个实现已工作。'),
    },
  },
  {
    id: 'storage', group: 1, title: 'PV、PVC 与动态存储', en: 'PERSISTENT STORAGE',
    summary: '用声明申请持久存储，分清绑定、供给、挂载与数据生命周期。',
    principle: 'PVC 是申请，PV 是存储资源，StorageClass 描述供给方式；数据保护另行设计。',
    tradeoff: '动态供给降低人工管理成本，也依赖驱动、拓扑、配额和后端能力。',
    pitfall: 'PVC Pending 不一定是故障；WaitForFirstConsumer 会等待消费方调度。ReadWriteOnce 也不等于只能被一个 Pod 使用。',
    nodes: ['Pod / PVC', '存储控制器', 'PV / 后端卷', '节点挂载'],
    steps: [
      ['申请所需存储', 0, 1, 'CLAIM 1Gi RWO', '假设已有可用默认 StorageClass，应用请求 1Gi。具体驱动能否供给取决于环境。', 'PVC 等待绑定或消费者', 'request'],
      ['供给并绑定', 1, 2, 'PROVISION / BIND', '控制器选择已有 PV 或调用供给器创建后端卷。延迟绑定模式会结合消费方的调度约束。', 'PVC 与 PV 关联', 'control'],
      ['节点准备挂载', 2, 3, 'ATTACH / MOUNT', '需要时进行挂接与挂载；CSI 等驱动负责相应步骤，并非 Bound 就代表挂载已成功。', '挂载仍可能失败', 'control'],
      ['应用访问目录', 3, 0, 'VOLUME READY', '节点准备好卷后容器可使用挂载目录；持久性不替代应用一致性、备份与恢复演练。', '数据路径可用', 'control'],
    ], code: ['Pod 引用 PVC', 'PVC 按 StorageClass 绑定 PV', '驱动与节点准备卷', '应用写入；另做备份和恢复验证'],
    example: yaml('PVC 消费实验', 'demo 命名空间已存在，需要支持 ReadWriteOnce 的默认 StorageClass 与可用驱动；没有默认类时需选择真实 storageClassName。此实验会申请后端存储。', 'storage.yaml', `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-demo
  namespace: demo
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: volume-reader
  namespace: demo
spec:
  containers:
    - name: reader
      image: busybox:1.37
      command: [sh, -c, 'date >> /data/runs; cat /data/runs; sleep 3600']
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: data-demo`, '正常情况下 PVC Bound、Pod 挂载运行；删除 PVC 前先检查 PV 回收策略和后端数据处理规则。'),
    sections: [
      { title: '从声明到挂载有多个环节', body: 'PVC Pending 先查类、事件、容量和绑定模式；PVC Bound 但 Pod 未启动还可能卡在卷挂接、拓扑或文件系统挂载。PV 是集群作用域资源，PVC 与消费 Pod 关联在命名空间内。' },
      { title: '访问模式与应用互斥', body: 'ReadWriteOnce 通常限制单节点读写挂载，不等于只允许一个 Pod。ReadWriteOncePod 对单 Pod 约束有额外支持条件。访问模式不能替代数据库锁、业务所有权或文件系统一致性设计。' },
      { title: '回收、快照与备份', body: 'Retain 与 Delete 影响 PVC 释放后 PV 和后端卷的处理。后端快照或持久卷并不天然提供应用一致的备份，还需考虑日志、恢复点、依赖顺序和实际恢复测试。' },
    ], sources: ['storage', 'storageclass'], related: ['statefulset', 'scheduling', 'pod-debug', 'backup-upgrade'],
    fault: {
      name: '等待消费者，还是供给失败', nodes: ['Pending PVC', 'StorageClass', '消费 Pod', '供给器事件'],
      steps: [
        ['PVC 显示 Pending', 0, 0, 'PVC PENDING', '独立场景：StorageClass 使用 WaitForFirstConsumer，当前尚未创建消费它的 Pod。', '未绑定不一定异常', 'local'],
        ['检查绑定模式', 0, 1, 'WAIT FOR FIRST CONSUMER', '延迟绑定希望结合消费方调度需求选择正确拓扑，不应只等待 PVC 立刻变 Bound。', '按设计等待消费方', 'check'],
        ['提供消费者上下文', 2, 1, 'POD CONSTRAINTS', '创建正确引用的 Pod 后，调度与供给流程再结合拓扑推进；这里不保证供给一定成功。', '具备后续推进条件', 'control'],
        ['按事件分辨错误', 3, 3, 'PROVISIONING EVIDENCE', '若仍无进展，检查消费 Pod、PVC 与驱动事件，区分正常等待、调度无解和后端失败。', '依据证据分类', 'local'],
      ], code: ['读取 PVC Events', '核对 volumeBindingMode', '确认消费 Pod 已创建且正确引用', '再检查驱动与拓扑错误'],
      example: sh('检查存储绑定与消费方', '已应用 storage.yaml；StorageClass 和 PV 为集群作用域资源。', `kubectl -n demo describe pvc data-demo
kubectl get storageclass -o yaml
kubectl -n demo describe pod volume-reader
kubectl get pv`, 'WaitForFirstConsumer 提示可能是正常阶段；FailedMount 与 ProvisioningFailed 指向不同环节。'),
    },
  },
];
