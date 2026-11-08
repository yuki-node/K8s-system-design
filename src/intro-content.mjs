// Original beginner explanations. References verify concepts, rather than supply lesson text.
export const INTRO_CHAPTERS = [
  {
    short: '镜像与容器', title: '先从你熟悉的 Docker 开始',
    lead: '镜像是运行应用的模板，容器是它的运行实例。',
    paragraphs: [
      '假设你写好了一个网站。把程序和需要的运行环境打包成 web:v1 镜像，就可以在兼容的容器环境里启动它。镜像本身不会接收请求，运行起来的容器才会。',
      '同一个镜像可以启动多个彼此隔离的容器。它们使用相同的程序版本，但各有自己的进程和运行状态。容器不是一台完整虚拟机，通常与宿主机共享操作系统内核。',
    ],
    takeaway: '镜像回答“用什么运行”，容器回答“现在运行着什么”。',
    caption: '一个 web:v1 镜像，可以启动多个容器实例。',
    source: ['容器与镜像', 'https://kubernetes.io/zh-cn/docs/concepts/containers/'],
    next: '容器多起来以后呢？',
  },
  {
    short: '为什么需要 K8s', title: '容器会启动，还需要 Kubernetes 吗？',
    lead: '当应用跨越多台机器，难点变成了持续管理。',
    paragraphs: [
      '一个网站只有一个容器时，你可以手动启动、查看日志、重启。现在需要运行多个副本：放在哪台机器？有实例故障谁来补？更新版本时，怎样逐步替换？这些工作会不断重复。',
      'Kubernetes（简称 K8s）是管理容器化应用的开源平台。你描述希望运行什么、需要多少副本，它通过一组控制过程，持续让实际状态接近期望状态。',
      '这不是把 Docker 的知识推倒重来：你仍可以用 Docker 构建镜像，再把镜像交给 K8s 集群运行。',
    ],
    takeaway: '它负责协调应用的部署与运行；镜像仍需你构建，业务代码仍需你编写。',
    caption: '从手动照看每个实例，到声明目标、持续协调。',
    source: ['Kubernetes 概述', 'https://kubernetes.io/zh-cn/docs/concepts/overview/'],
    next: '先认识它工作的地方',
  },
  {
    short: '集群与节点', title: '把一组机器，组织成一个集群',
    lead: '控制平面负责决策与协调，工作节点承载应用。',
    paragraphs: [
      '集群是由控制平面和工作节点组成的运行环境。节点可以是物理机，也可以是虚拟机。你不用先指定每个应用实例必须放在哪台机器，K8s 会结合资源和约束选择节点。',
      '工作节点上的代理组件配合容器运行时落实这些安排。先记住“控制平面管目标，节点跑应用”即可，具体组件的名字和分工，会在后续的架构主题中展开。',
    ],
    takeaway: 'K8s 管理已有的节点资源；它本身不等于购买机器或创建虚拟机的服务。',
    caption: '这是职责示意；学习环境可以把不同角色放在同一台机器上。',
    source: ['Kubernetes 组件', 'https://kubernetes.io/zh-cn/docs/concepts/overview/components/'],
    next: '应用以什么单位运行？',
  },
  {
    short: '认识 Pod', title: '在 K8s 里，容器住进 Pod',
    lead: 'Pod 是 Kubernetes 创建和调度应用的最小单位。',
    paragraphs: [
      '先把 Pod 理解为容器的运行单元。最常见的起点是一个 Pod 运行一个网站容器；需要紧密协作的容器也可以放在同一个 Pod 中，共享网络，并按配置共享存储卷。',
      'Pod 会被安排到一个节点。它不是永久存在的机器：一个 Pod 被删除或失效后，后续创建的是有新身份的新 Pod，IP 也可能变化。扩容通常是增加 Pod 副本，而不是往同一个 Pod 里不断塞入网站容器。',
    ],
    takeaway: '本例：一个 web Pod 包含一个网站容器；多个副本就是多个这样的 Pod。',
    caption: '外层是 Pod，里面是运行 web:v1 的容器。',
    source: ['Pod 概念', 'https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/'],
    next: '谁来维持这些副本？',
  },
  {
    short: '认识 Deployment', title: '你声明目标，控制器持续协调',
    lead: '“让 web:v1 保持两个副本”，就是一个期望状态。',
    paragraphs: [
      'Deployment 描述一组 Pod 的模板和期望副本数。对于这里的无状态网站，通常创建 Deployment，由它管理 ReplicaSet，再由副本控制器维持 Pod 数量，而不是手动逐个创建 Pod。',
      '把副本数从 2 改为 3，控制器会请求补足 Pod，后续还需要调度、拉取镜像、启动和就绪检查。修改模板还可以触发滚动更新。提交目标成功，并不表示所有副本已经可用。',
    ],
    takeaway: '期望状态是目标；观测状态是当前结果。两者之间需要时间，也可能遇到错误。',
    caption: '虚线表示管理关系，省略了 API 和 ReplicaSet 等中间环节。',
    source: ['Deployment', 'https://kubernetes.io/zh-cn/docs/concepts/workloads/controllers/deployment/'],
    next: 'Pod 更换后，怎样继续访问？',
  },
  {
    short: '认识 Service', title: '副本会变化，访问入口保持稳定',
    lead: 'Service 为一组后端 Pod 提供稳定的访问抽象。',
    paragraphs: [
      '如果网站有多个 Pod，客户端不应该记住每个 Pod 的 IP。常见做法是创建 Service，用标签选择目标 Pod，再通过集群内的 Service 名称或虚拟 IP 访问就绪后端。',
      '后端变化时，发现信息与数据面规则会随之更新。实际流量由 kube-proxy 或替代数据面处理，不是由 Service API 对象亲自转发。普通 ClusterIP Service 也不会自动让公网用户访问网站。',
    ],
    takeaway: 'Pod 运行容器；Deployment 管理副本与更新；Service 提供稳定的服务入口。',
    caption: '示意集群内客户端访问就绪 Pod，实际转发实现已省略。',
    source: ['Service', 'https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/'],
    next: '把这些概念连起来试试',
  },
  {
    short: '动手试一试', title: '让这个网站，多一个副本',
    lead: '改变目标，再观察就绪数量怎样追上来。',
    paragraphs: [
      '这里是教学模拟，不会连接真实集群。先扩容，再确认新 Pod 就绪；也可以让一个 Pod 故障，观察控制器如何用新身份的 Pod 替代它。',
      '这个例子假设资源充足、镜像可用，并已配置就绪检查。实际恢复包含异步检测与协调；存活容器的重启和整个 Pod 的替代也不同，K8s 不保证任意故障都能无中断恢复。',
    ],
    takeaway: '先理解目标、资源和协调的关系，再进入组件内部的机制。',
    caption: '所有 Pod 都匹配同一个 Service；只有就绪后端参与常规流量。',
    source: ['官方基础教程', 'https://kubernetes.io/zh-cn/docs/tutorials/kubernetes-basics/'],
    next: '进入集群架构',
  },
];
