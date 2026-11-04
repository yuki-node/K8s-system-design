import type { Lesson } from './course-types';
import { foundations } from './lessons/foundations';
import { applications } from './lessons/applications';
import { operations } from './lessons/operations';

export const COURSE_META = {
  title: 'K8s Systems Design',
  audience: '具备 Linux 与容器基础的开发者和初级运维',
  reviewed: '2026-11-05',
  scope: '稳定的 Kubernetes API 与通用机制；具体版本、插件与托管服务差异以对应官方文档为准。',
};
export const GROUPS = [
  { name: '基础与架构', color: '#164bc4', question: '从一次声明出发，理解控制面如何驱动 Pod 运行，以及状态何时才算就绪。' },
  { name: '应用与流量', color: '#137f85', question: '选择工作负载，连接配置、网络与存储，理解流量如何到达应用。' },
  { name: '运维与排障', color: '#7951ab', question: '用证据定位故障，理解访问边界、扩缩容与节点维护的条件。' },
];
const doc = (name: string, path: string, note: string) => ({ name: `Kubernetes · ${name}`, url: `https://kubernetes.io/docs/${path}/`, note, kind: '官方文档' });
export const SOURCES = {
  architecture: doc('集群架构', 'concepts/architecture', '控制面、工作节点与组件职责。'),
  api: doc('Kubernetes 对象', 'concepts/overview/working-with-objects', 'spec、status 与声明式资源。'),
  apply: doc('声明式对象管理', 'tasks/manage-kubernetes-objects/declarative-config', 'apply、清单与配置管理。'),
  controllers: doc('控制器', 'concepts/architecture/controller', '控制循环与期望状态。'),
  pods: doc('Pod', 'concepts/workloads/pods', '共享网络、存储与调度单元。'),
  lifecycle: doc('Pod 生命周期', 'concepts/workloads/pods/pod-lifecycle', '阶段、条件、容器状态与重启。'),
  namespace: doc('Namespace', 'concepts/overview/working-with-objects/namespaces', '命名边界与集群作用域资源。'),
  quota: doc('ResourceQuota', 'concepts/policy/resource-quotas', '命名空间资源用量与准入限制。'),
  labels: doc('标签与选择器', 'concepts/overview/working-with-objects/labels', '集合选择、标签与资源关联。'),
  scheduling: doc('将 Pod 分配给节点', 'concepts/scheduling-eviction/assign-pod-node', '节点选择、亲和性与调度约束。'),
  taints: doc('污点与容忍', 'concepts/scheduling-eviction/taint-and-toleration', '容忍解除排斥，不保证调度。'),
  resources: doc('容器资源管理', 'concepts/configuration/manage-resources-containers', 'requests、CPU 限流、内存限制与调度。'),
  probes: doc('配置存活、就绪与启动探针', 'tasks/configure-pod-container/configure-liveness-readiness-startup-probes', '三种探针的不同效果及配置。'),
  deployment: doc('Deployment', 'concepts/workloads/controllers/deployment', 'ReplicaSet、滚动更新与回滚。'),
  statefulset: doc('StatefulSet', 'concepts/workloads/controllers/statefulset', '稳定身份、顺序语义与存储。'),
  daemonset: doc('DaemonSet', 'concepts/workloads/controllers/daemonset', '在符合条件的节点运行守护 Pod。'),
  jobs: doc('Job', 'concepts/workloads/controllers/job', '任务完成、重试与业务幂等。'),
  cronjob: doc('CronJob', 'concepts/workloads/controllers/cron-jobs', '定时、并发策略与漏调度。'),
  configmap: doc('ConfigMap', 'concepts/configuration/configmap', '配置注入与更新传播的边界。'),
  secrets: doc('Secret', 'concepts/configuration/secret', '机密对象、权限与存储加密。'),
  service: doc('Service', 'concepts/services-networking/service', '服务发现与流量入口。'),
  endpoints: doc('EndpointSlice', 'concepts/services-networking/endpoint-slices', '端点、就绪状态与服务后端。'),
  dns: doc('Service 与 Pod 的 DNS', 'concepts/services-networking/dns-pod-service', '服务 DNS 记录与搜索域。'),
  ingress: doc('Ingress', 'concepts/services-networking/ingress', 'HTTP 路由规则依赖入口控制器。'),
  gateway: doc('Gateway API', 'concepts/services-networking/gateway', 'Gateway API 扩展及角色划分。'),
  storage: doc('持久卷', 'concepts/storage/persistent-volumes', 'PV、PVC、绑定、访问模式与回收策略。'),
  storageclass: doc('StorageClass', 'concepts/storage/storage-classes', '动态供给与 WaitForFirstConsumer。'),
  network: doc('NetworkPolicy', 'concepts/services-networking/network-policies', '依赖网络插件，入站和出站规则分别叠加。'),
  rbac: doc('RBAC 授权', 'reference/access-authn-authz/rbac', 'Role、ClusterRole 与绑定作用域。'),
  security: doc('Pod 安全准入', 'concepts/security/pod-security-admission', 'enforce、audit 与 warn 的作用。'),
  standards: doc('Pod 安全标准', 'concepts/security/pod-security-standards', 'Privileged、Baseline 与 Restricted。'),
  hpa: doc('水平自动扩缩容', 'tasks/run-application/horizontal-pod-autoscale', '指标来源、资源请求与扩缩容行为。'),
  observability: doc('可观测性', 'concepts/cluster-administration/observability', '指标、日志与追踪的不同用途。'),
  logging: doc('日志架构', 'concepts/cluster-administration/logging', '容器日志、轮转与集群级采集。'),
  debug: doc('调试 Pod', 'tasks/debug/debug-application/debug-pods', '状态、事件、容器日志与诊断。'),
  debugservice: doc('调试 Service', 'tasks/debug/debug-application/debug-service', '逐层验证 DNS、端点与服务流量。'),
  drain: doc('安全排空节点', 'tasks/administer-cluster/safely-drain-node', 'cordon、驱逐、DaemonSet 与维护流程。'),
  pdb: doc('Pod 干扰预算', 'concepts/workloads/pods/disruptions', '自愿中断、PDB 与可用性条件。'),
  etcd: doc('管理 etcd', 'tasks/administer-cluster/configure-upgrade-etcd', '快照、恢复与控制面状态。'),
  upgrade: doc('kubeadm 集群升级', 'tasks/administer-cluster/kubeadm/kubeadm-upgrade', '逐节点升级与前置检查。'),
  skew: doc('版本偏差策略', 'setup/release/version-skew-policy', '组件版本与支持范围。'),
};
const lessons = [...foundations, ...applications, ...operations];
// Associations are undirected: either author's reference is sufficient to connect two topics.
export const LESSONS: Lesson[] = lessons.map(lesson => ({
  ...lesson,
  related: [...new Set([...lesson.related, ...lessons.filter(other => other.related.includes(lesson.id)).map(other => other.id)])],
}));
