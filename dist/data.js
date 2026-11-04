// Audited teaching content. Frames: label, from, to, event, explanation, state, relation kind.
const SOURCES = {
  "fsync_notes": {
    "name": "Linux man-pages · fsync(2)",
    "url": "https://man7.org/linux/man-pages/man2/fsync.2.html",
    "note": "文件数据同步到存储设备的语义、返回值与错误；目录项另有同步要求。",
    "kind": "具体机制资料"
  },
  "csapp": {
    "name": "CMU 15-213 · Computer Systems",
    "url": "https://csapp.cs.cmu.edu/3e/curriculum.html",
    "note": "系统、内存层次、虚拟内存与并发编程",
    "kind": "课程背景"
  },
  "os": {
    "name": "OSTEP · 操作系统教材",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/",
    "note": "虚拟化、并发与持久化",
    "kind": "课程背景"
  },
  "arch": {
    "name": "Berkeley CS 152 · Computer Architecture",
    "url": "https://www2.eecs.berkeley.edu/Courses/CS152/",
    "note": "流水线、存储层次与并行执行",
    "kind": "课程背景"
  },
  "db": {
    "name": "Berkeley CS 186 · 数据库系统",
    "url": "https://cs186berkeley.net/sp25/",
    "note": "索引、事务、并发控制与恢复",
    "kind": "课程背景"
  },
  "pg": {
    "name": "PostgreSQL · 事务隔离",
    "url": "https://www.postgresql.org/docs/18/transaction-iso.html",
    "note": "隔离级别、快照与序列化异常",
    "kind": "官方文档"
  },
  "wal": {
    "name": "PostgreSQL · Write-Ahead Logging",
    "url": "https://www.postgresql.org/docs/18/wal-intro.html",
    "note": "日志先于对应数据页持久化",
    "kind": "官方文档"
  },
  "dist": {
    "name": "MIT 6.5840 · Distributed Systems",
    "url": "https://pdos.csail.mit.edu/6.5840/schedule.html",
    "note": "复制、共识、一致性与分布式事务",
    "kind": "课程背景"
  },
  "raft": {
    "name": "Raft · 原始论文",
    "url": "https://raft.github.io/raft.pdf",
    "note": "领导者选举、日志复制与安全性",
    "kind": "原始论文"
  },
  "retry": {
    "name": "AWS · Timeouts, retries and backoff",
    "url": "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
    "note": "超时、有限重试、指数退避与随机抖动",
    "kind": "官方工程资料"
  },
  "systems": {
    "name": "MIT 6.1800 · Computer Systems Engineering",
    "url": "https://web.mit.edu/6.1800/2025/wwwdocs/index.shtml",
    "note": "系统设计、容错、安全与事务",
    "kind": "课程背景"
  },
  "cache_notes": {
    "name": "CMU 15-213 · Cache Memories",
    "url": "https://www.cs.cmu.edu/~213/lectures/10-cache-memories.pdf",
    "note": "缓存行位于缓存集合内部；未命中后装入数据块。",
    "kind": "具体机制资料"
  },
  "tlb_notes": {
    "name": "OSTEP 第 19 章 · TLB",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-tlbs.pdf",
    "note": "地址翻译缓存、访问权限、TLB 未命中处理。",
    "kind": "具体机制资料"
  },
  "fault_notes": {
    "name": "OSTEP 第 21 章 · 缺页机制",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/vm-beyondphys.pdf",
    "note": "驻留位、缺页异常、页面准备与指令重试。",
    "kind": "具体机制资料"
  },
  "cpu_notes": {
    "name": "Intel · Optimization Reference Manual",
    "url": "https://cdrdv2-public.intel.com/821612/248966-Optimization-Reference-Manual-V1-050.pdf",
    "note": "乱序执行与按序退休；§2.8.2.4 讨论退休及存储。",
    "kind": "具体机制资料"
  },
  "process_notes": {
    "name": "OSTEP 第 4 章 · 进程状态",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-intro.pdf",
    "note": "就绪、运行、阻塞，以及状态转移的不同含义。",
    "kind": "具体机制资料"
  },
  "schedule_notes": {
    "name": "OSTEP 第 8 章 · 多级反馈队列",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-sched-mlfq.pdf",
    "note": "优先级调度、饥饿与优先级提升。",
    "kind": "具体机制资料"
  },
  "memory_order": {
    "name": "Linux 内核 · Memory Barriers",
    "url": "https://kernel.org/doc/html/latest/core-api/wrappers/memory-barriers.html",
    "note": "acquire/release 与内存可见性；具体语言模型仍需各自核对。",
    "kind": "具体机制资料"
  },
  "deadlock_notes": {
    "name": "OSTEP 第 32 章 · 并发错误",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-bugs.pdf",
    "note": "原子性违反、次序违反与死锁等待环。",
    "kind": "具体机制资料"
  },
  "epoll": {
    "name": "Linux man-pages · epoll(7)",
    "url": "https://man7.org/linux/man-pages/man7/epoll.7.html",
    "note": "就绪通知后仍需执行非阻塞 I/O 并处理 EAGAIN。",
    "kind": "具体机制资料"
  },
  "read": {
    "name": "Linux man-pages · read(2)",
    "url": "https://man7.org/linux/man-pages/man2/read.2.html",
    "note": "短读、EOF、错误与非阻塞读取。",
    "kind": "具体机制资料"
  },
  "bounded": {
    "name": "OSTEP 第 30 章 · 条件变量",
    "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/threads-cv.pdf",
    "note": "受同步保护的容量检查、等待和入队。",
    "kind": "具体机制资料"
  },
  "amdahl": {
    "name": "CMU 15-740 · Parallel Architecture",
    "url": "https://www.cs.cmu.edu/afs/cs/academic/class/15740-s18/www/lectures/05-06-parallel.pdf",
    "note": "Amdahl 定律及串行部分对理想加速比的限制。",
    "kind": "具体机制资料"
  },
  "locks_notes": {
    "name": "Berkeley CS186 · Concurrency II",
    "url": "https://cs186berkeley.net/notes/note12/",
    "note": "2PL、严格变体、锁授予和死锁。",
    "kind": "具体机制资料"
  },
  "recovery_notes": {
    "name": "Berkeley CS186 · Recovery",
    "url": "https://cs186berkeley.net/notes/note14/",
    "note": "WAL 的两条持久化规则、pageLSN 与 ARIES 恢复。",
    "kind": "具体机制资料"
  },
  "wal_commit": {
    "name": "PostgreSQL · Transaction implementation",
    "url": "https://github.com/postgres/postgres/blob/master/src/backend/access/transam/README",
    "note": "同步提交刷到提交记录 LSN；与异步提交区别。",
    "kind": "具体机制资料"
  },
  "occ_paper": {
    "name": "Kung & Robinson · OCC 原始论文",
    "url": "https://www.eecs.harvard.edu/~htk/publication/1981-tods-kung-robinson.pdf",
    "note": "读取、验证、写入阶段，以及最终校验和更新的原子边界。",
    "kind": "具体机制资料"
  },
  "bpt": {
    "name": "Berkeley CS186 · B+ Trees",
    "url": "https://cs186berkeley.net/notes/note4/",
    "note": "页式树、叶子、插入与分裂。",
    "kind": "具体机制资料"
  },
  "rocks": {
    "name": "RocksDB · Overview",
    "url": "https://github.com/meta/rocksdb/wiki/RocksDB-Overview",
    "note": "MemTable、SST 与后台压实。",
    "kind": "具体机制资料"
  },
  "stalls": {
    "name": "RocksDB · Write Stalls",
    "url": "https://github.com/meta/rocksdb/wiki/Write-Stalls",
    "note": "压实积压与写入限速、暂停条件。",
    "kind": "具体机制资料"
  },
  "tla": {
    "name": "Lamport · Specifying Systems",
    "url": "https://lamport.azurewebsites.net/tla/book-21-07-04.pdf",
    "note": "第 8、14 章：公平性、安全属性与时序属性检查。",
    "kind": "具体机制资料"
  },
  "idempotent": {
    "name": "AWS · Making retries safe with idempotent APIs",
    "url": "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
    "note": "稳定请求身份、原子记录、参数匹配与保留语义。",
    "kind": "具体机制资料"
  },
  "acks": {
    "name": "RabbitMQ · Acknowledgements and Confirms",
    "url": "https://www.rabbitmq.com/docs/confirms",
    "note": "消费确认、发布确认与故障后的重新投递。",
    "kind": "具体机制资料"
  },
  "migration": {
    "name": "MIT 6.5840 · Sharded KV Lab",
    "url": "https://pdos.csail.mit.edu/6.824/labs/lab-shard1.html",
    "note": "冻结旧分片、安装新状态、发布配置。本例后台预复制加最终冻结为教学综合方案。",
    "kind": "具体机制资料"
  },
  "versioning": {
    "name": "MIT 6.5840 · KV Server Lab",
    "url": "https://pdos.csail.mit.edu/6.824/labs/lab-kvsrv1.html",
    "note": "版本条件写入与操作的实时先后关系。",
    "kind": "具体机制资料"
  },
  "chubby": {
    "name": "Chubby · 原始论文",
    "url": "https://www.usenix.org/legacy/event/osdi06/tech/full_papers/burrows/burrows_html/",
    "note": "§2.1、2.4：延迟请求、锁代际与资源侧校验。本例使用简化的单调令牌协议。",
    "kind": "具体机制资料"
  },
  "outbox_doc": {
    "name": "AWS · Transactional Outbox",
    "url": "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html",
    "note": "本地提交意图、重复发布和下游幂等。",
    "kind": "具体机制资料"
  },
  "authz": {
    "name": "OWASP · Authorization Cheat Sheet",
    "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
    "note": "默认拒绝、每次请求和具体对象的授权检查。",
    "kind": "具体机制资料"
  },
  "health": {
    "name": "AWS · Implementing health checks",
    "url": "https://aws.amazon.com/builders-library/implementing-health-checks/",
    "note": "存活、应用行为与有条件的故障恢复。",
    "kind": "具体机制资料"
  }
};
const GROUPS = [
  {
    "id": "execution",
    "name": "执行与性能",
    "en": "EXECUTION & PERFORMANCE",
    "color": "#164bc4",
    "question": "怎样让有限的资源做更多工作？"
  },
  {
    "id": "state",
    "name": "状态与正确性",
    "en": "STATE & CORRECTNESS",
    "color": "#087e7f",
    "question": "并发和崩溃之后，结果仍然正确吗？"
  },
  {
    "id": "distributed",
    "name": "分布式协作",
    "en": "DISTRIBUTED COORDINATION",
    "color": "#8052c7",
    "question": "消息不可靠时，机器如何一起工作？"
  }
];
const LESSONS = [
  {
    "group": 0,
    "id": "cache",
    "title": "缓存与局部性",
    "en": "CACHE & LOCALITY",
    "summary": "把经常使用、即将再次使用的数据，放到离计算更近的地方。",
    "nodes": [
      "CPU",
      "缓存控制器",
      "缓存存储阵列",
      "主存 DRAM"
    ],
    "steps": [
      [
        "发出读取",
        0,
        1,
        "LOAD A",
        "CPU 发出对 A 的读取请求；缓存控制器用索引和标签检查存储阵列中的行。本例省略地址翻译，并用单级缓存说明过程。",
        "A 的读取尚未完成",
        "request"
      ],
      [
        "未命中后取整行",
        1,
        3,
        "READ LINE",
        "缓存中没有 A 所在的行，控制器向主存请求该行。真实系统通常先检查更低一级缓存。",
        "第 1 次访问未命中",
        "request"
      ],
      [
        "填入缓存阵列",
        3,
        2,
        "FILL 64B",
        "主存返回包含 A 的数据行，填入缓存阵列；随后所需字返回 CPU，完成第一次读取。64 字节只是本例行大小。",
        "A 所在行已缓存 · 首次读取完成",
        "data"
      ],
      [
        "再次访问命中",
        2,
        0,
        "HIT A+4",
        "CPU 随后读取同一行内的 A+4；控制器命中后从缓存阵列返回所需字，不必再次访问主存。缓存行是缓存内部的存储单位。",
        "2 次访问：1 miss / 1 hit",
        "data"
      ]
    ],
    "principle": "时间局部性复用最近访问；空间局部性利用相邻数据。",
    "tradeoff": "提高命中率通常要同时考虑布局、工作集、替换策略和维护一致性的成本。",
    "pitfall": "缓存行不同于对象；不同线程写同一行中的不同变量，也可能产生伪共享。",
    "code": [
      "entry = cache.lookup(address)",
      "if entry.missing:",
      "  block = lowerLevel.readLine(lineBase(address))",
      "  entry = cache.install(block)",
      "return entry.readWord(offset(address))"
    ],
    "sources": [
      "cache_notes",
      "csapp"
    ],
    "related": [
      "vm",
      "pipeline",
      "measure"
    ],
    "fault": {
      "name": "工作集超过容量",
      "nodes": [
        "CPU",
        "缓存控制器",
        "缓存阵列 · 2 行",
        "主存 DRAM"
      ],
      "steps": [
        [
          "先装入 A 与 B",
          3,
          2,
          "FILL A,B",
          "用一个初始为空、仅能容纳两行的全相联 LRU 缓存举例。CPU 依次读取 A、B，两次冷未命中都从主存装入；A、B、C 分别位于不同缓存行。",
          "缓存 [A,B] · A 最久未用",
          "data"
        ],
        [
          "继续读取 C",
          0,
          1,
          "LOAD C / MISS",
          "CPU 循环访问 A、B、C；现在请求 C。C 不在缓存中，且两行空间都已占用。",
          "缓存 [A,B] · C 未命中",
          "request"
        ],
        [
          "替换 A 装入 C",
          3,
          2,
          "EVICT A / FILL C",
          "LRU 选择 A 为牺牲行，主存返回 C 后缓存变为 B、C。本例只读，不涉及脏行写回。",
          "缓存 [B,C] · A 已被替换",
          "data"
        ],
        [
          "下一轮 A 再次未命中",
          0,
          1,
          "LOAD A / MISS",
          "下一轮又需要 A，但 A 已被替换。三行工作集反复轮转超过两行容量，持续产生容量未命中；应测量后考虑分块或缩小工作集。",
          "缓存 [B,C] · 再次请求主存 A",
          "request"
        ]
      ],
      "code": [
        "cache = FullyAssociativeLRU(capacityLines=2)",
        "for address in cycle(A, B, C):",
        "  entry = cache.lookup(address)",
        "  if entry.missing:",
        "    entry = cache.install(memory.readLine(address))",
        "  consume(entry)"
      ]
    }
  },
  {
    "group": 0,
    "id": "vm",
    "title": "虚拟内存与 TLB",
    "en": "VIRTUAL MEMORY",
    "summary": "用地址翻译隔离进程，同时将有限物理内存映射成可管理的地址空间。",
    "nodes": [
      "CPU / MMU",
      "TLB",
      "页表",
      "物理内存"
    ],
    "steps": [
      [
        "查询地址翻译",
        0,
        1,
        "LOOKUP VPN",
        "MMU 用虚拟页号查询 TLB，页内偏移保持不变。TLB 缓存页号映射和访问权限；本例采用硬件管理的 TLB。",
        "VA = VPN + 页内偏移",
        "check"
      ],
      [
        "TLB 未命中后遍历",
        0,
        2,
        "PAGE WALK",
        "TLB 未命中时，硬件页表遍历器读取页表。这里找到合法、已驻留且允许本次访问的映射；TLB 未命中本身不等于缺页。",
        "PTE 有效 · present = 1",
        "check"
      ],
      [
        "缓存有效翻译",
        2,
        1,
        "FILL VPN→PFN",
        "页表项中的物理页框号及权限被填入 TLB。页表描述映射，不把页面内容传送到 TLB。",
        "TLB 保存 VPN→PFN 与权限",
        "data"
      ],
      [
        "使用物理地址访问",
        0,
        3,
        "ACCESS PA",
        "MMU 将 PFN 与原页内偏移组成物理地址，完成内存访问。后续 TLB 命中可跳过页表遍历，但仍要检查访问权限。",
        "物理地址已生成 · 访问获准",
        "request"
      ]
    ],
    "principle": "地址空间隔离依赖页表、权限与正确的 TLB 管理。",
    "tradeoff": "大页可降低 TLB 压力，但增大分配粒度，并可能浪费内存。",
    "pitfall": "TLB 未命中不等于缺页。缺页也不一定读磁盘，还可能是按需分配或写时复制。",
    "code": [
      "translation = tlb.lookup(vpn)",
      "if missing: translation = walkPageTable(vpn)",
      "if !translation.valid || !translation.present || !permitted:",
      "  return trapAndRetryOrFail()",
      "tlb.cacheValidTranslation(translation)",
      "return access(translation.pfn, offset)"
    ],
    "sources": [
      "tlb_notes",
      "fault_notes"
    ],
    "related": [
      "cache",
      "schedule"
    ],
    "fault": {
      "name": "合法页尚未驻留",
      "nodes": [
        "CPU / MMU",
        "页表",
        "内核缺页处理",
        "物理页"
      ],
      "steps": [
        [
          "发现页面不在内存",
          0,
          1,
          "PRESENT = 0",
          "CPU 访问一个合法匿名映射中的尚未分配页面；TLB 未命中后，页表遍历发现当前没有可用的驻留页映射。此例不是非法地址访问。",
          "映射合法 · 尚无驻留物理页",
          "check"
        ],
        [
          "进入内核处理",
          0,
          2,
          "PAGE FAULT",
          "硬件触发缺页异常，进入内核。内核检查地址范围与访问权限，再决定是否可以补齐映射；非法访问可能终止任务。",
          "原指令暂停 · 内核验证映射",
          "control"
        ],
        [
          "分配并准备物理页",
          2,
          3,
          "ALLOC / ZERO",
          "本例由内核分配并清零物理页，然后安装页表映射，因此不必读取磁盘。若页面来自后备存储，则可能需要 I/O 并阻塞当前线程。",
          "物理页已准备 · PTE 已更新",
          "data"
        ],
        [
          "返回并重试指令",
          2,
          0,
          "RETRY",
          "映射与必要的 TLB 状态处理完成后返回，重新执行触发缺页的指令。只有成功处理的缺页才能沿此路径继续。",
          "重试翻译与访问 · 并非所有缺页都可恢复",
          "control"
        ]
      ],
      "code": [
        "onPageFault(address, access):",
        "  require validMappingAndPermission(address, access)",
        "  frame = allocateAndZeroPage() // 本例：匿名按需分配",
        "  installPTEAndMaintainTLB(address, frame)",
        "  returnAndRetryFaultingInstruction()"
      ]
    }
  },
  {
    "group": 0,
    "id": "pipeline",
    "title": "流水线与投机执行",
    "en": "PIPELINE & SPECULATION",
    "summary": "重叠多个指令的执行阶段，并在分支结果确定之前预测后续工作。",
    "nodes": [
      "取指 / 预测",
      "译码 / 发射",
      "执行单元",
      "按序提交"
    ],
    "steps": [
      [
        "预测控制流",
        0,
        1,
        "PREDICT A",
        "分支预测器选择路径 A，使取指与译码能够继续。预测允许先做工作，并不保证结果最终可以提交。",
        "预测路径 A · 尚未验证",
        "control"
      ],
      [
        "发射并重叠执行",
        1,
        2,
        "ISSUE",
        "相互独立的指令可重叠执行；数据依赖、资源冲突和访存限制并行。本例采用具有按序提交机制的乱序处理器。",
        "多条指令在途 · 结果仍可被丢弃",
        "control"
      ],
      [
        "完成并验证预测",
        2,
        3,
        "RESULT / RESOLVE",
        "执行单元得到结果并验证分支。本例预测正确，结果等待较早指令完成及提交条件满足。",
        "预测正确 · 尚未提交",
        "data"
      ],
      [
        "按序提交架构状态",
        3,
        3,
        "RETIRE",
        "常见乱序处理器按程序顺序提交已满足条件的指令，支持精确异常。存储对其他核心何时可见，还受存储缓冲与内存序约束。",
        "本线程架构状态已提交",
        "local"
      ]
    ],
    "principle": "执行可以提前，架构状态的提交必须满足程序语义。",
    "tradeoff": "更深流水线和更大执行窗口提高潜在吞吐，也增加错预测与恢复成本。",
    "pitfall": "撤销未提交的架构状态，不意味着所有微架构痕迹都被清除。",
    "code": [
      "predictAndFetch(branch)",
      "issueReadyInstructions()",
      "executeAndResolve()",
      "if predictionWrong: squashYoungerAndRedirect()",
      "retireReadyInstructionsInProgramOrder()"
    ],
    "sources": [
      "cpu_notes",
      "arch"
    ],
    "related": [
      "cache",
      "sync",
      "measure"
    ],
    "fault": {
      "name": "分支预测错误",
      "nodes": [
        "取指 / 预测",
        "译码 / 发射",
        "执行单元",
        "按序提交"
      ],
      "steps": [
        [
          "预测走路径 A",
          0,
          1,
          "PREDICT A",
          "分支尚未求值，预测器选择路径 A，沿该路径继续取指和译码。",
          "预测 A · 分支结果未知",
          "control"
        ],
        [
          "执行预测路径",
          1,
          2,
          "SPECULATE A",
          "比该分支年轻的指令沿路径 A 开始执行；这些结果仍是推测性的，尚不能成为已提交架构状态。",
          "路径 A 的年轻指令在途",
          "control"
        ],
        [
          "发现实际应走 B",
          2,
          0,
          "SQUASH / REDIRECT B",
          "分支求值表明应走 B。处理器丢弃错误路径上尚未提交的年轻指令，恢复正确取指位置；已提交的较早指令不回滚。",
          "错误路径被丢弃 · 重定向到 B",
          "control"
        ],
        [
          "重新填充正确路径",
          0,
          1,
          "REFETCH B",
          "从路径 B 重新取指并填充流水线。已经消耗的时间无法收回，缓存等微架构痕迹也不保证全部消失。",
          "开始正确路径 · 仍须执行后按序提交",
          "control"
        ]
      ],
      "code": [
        "prediction = predict(branch)",
        "executeYoungerInstructions(prediction)",
        "if resolve(branch) != prediction:",
        "  squashUnretiredYoungerInstructions()",
        "  redirectFetch(correctPC)",
        "retireReadyInstructionsInProgramOrder()"
      ]
    }
  },
  {
    "group": 0,
    "id": "schedule",
    "title": "线程与任务调度",
    "en": "SCHEDULING",
    "summary": "在可运行任务之间分配 CPU；就绪、运行和阻塞是不同的状态。",
    "nodes": [
      "就绪队列",
      "CPU 核心",
      "I/O 等待",
      "调度器"
    ],
    "steps": [
      [
        "加入可运行任务",
        3,
        0,
        "ENQUEUE READY",
        "A 与 B 已满足运行条件，被加入就绪队列。就绪表示具备运行资格，不表示此时正在使用 CPU。",
        "A: READY · B: READY",
        "control"
      ],
      [
        "选择 A 运行",
        3,
        1,
        "DISPATCH A",
        "调度器从就绪任务中选择 A，恢复所需执行上下文并让它运行。本例只有一个 CPU 核心。",
        "A: RUNNING · B: READY",
        "control"
      ],
      [
        "A 等待 I/O",
        1,
        2,
        "BLOCK A",
        "A 发起需要等待的 I/O 并进入阻塞状态。调度器随后可选择 B，本例让 B 使用腾出的 CPU。",
        "A: BLOCKED · B: RUNNING",
        "control"
      ],
      [
        "I/O 完成后唤醒 A",
        2,
        0,
        "WAKE A",
        "I/O 完成使 A 重新进入就绪队列；是否立即抢占 B 取决于调度策略。本例让 A 等待下一次调度。",
        "A: READY · B: RUNNING",
        "control"
      ]
    ],
    "principle": "只调度已经就绪的工作，明确区分“被唤醒”和“已执行”。",
    "tradeoff": "抢占提高响应性；过多上下文切换与线程竞争会降低吞吐。",
    "pitfall": "增加线程数不会自动增加 CPU 容量；还可能放大锁竞争和缓存抖动。",
    "code": [
      "while systemRunning:",
      "  task = chooseReadyTask()",
      "  runUntilBlockYieldOrPreemption(task)",
      "  if stillRunnable(task): requeue(task)",
      "onIOComplete(task): makeReady(task)"
    ],
    "sources": [
      "process_notes",
      "schedule_notes"
    ],
    "related": [
      "async",
      "backpressure",
      "sync"
    ],
    "fault": {
      "name": "高优先级任务持续到来",
      "nodes": [
        "就绪队列",
        "CPU 核心",
        "高优先级到达流",
        "调度器"
      ],
      "steps": [
        [
          "低优先级 A 已就绪",
          3,
          0,
          "READY A,B",
          "A 与 B 都可运行，A 优先级较低，B 优先级较高。本反例采用没有老化或公平性补偿的严格优先级策略。",
          "A: READY 低优先级 · B: READY 高优先级",
          "control"
        ],
        [
          "优先运行 B",
          3,
          1,
          "RUN B",
          "调度器选择更高优先级的 B。A 仍留在就绪队列，它不是在等待 I/O。",
          "B: RUNNING · A: READY",
          "control"
        ],
        [
          "新的高优先级任务到达",
          2,
          0,
          "ARRIVE C,D",
          "B 结束前后，C、D 等高优先级任务继续变为就绪；高优先级队列始终有工作。",
          "A 仍可运行 · 高优先级队列非空",
          "control"
        ],
        [
          "A 继续被推迟",
          3,
          1,
          "RUN HIGH AGAIN",
          "调度器再次选择高优先级任务。如果这种到达持续，A 可能无限等待。老化、配额或公平调度可限制这种饥饿。",
          "A: READY · 等待时间持续增加",
          "control"
        ]
      ],
      "code": [
        "while readyTasksExist:",
        "  task = highestPriorityReadyTask()",
        "  run(task)",
        "  requeueIfRunnable(task)",
        "// 若高优先级工作持续存在，低优先级任务可能饥饿"
      ]
    }
  },
  {
    "group": 0,
    "id": "sync",
    "title": "锁、原子操作与内存序",
    "en": "SYNCHRONIZATION",
    "summary": "同时约束谁能修改共享数据，以及其他线程何时能看见这些修改。",
    "nodes": [
      "线程 A",
      "共享状态",
      "线程 B",
      "互斥锁 m"
    ],
    "steps": [
      [
        "A 获取互斥锁",
        0,
        3,
        "LOCK / ACQUIRE",
        "A 成功获取 m；所有可能冲突的访问都必须遵循同一同步约定。锁的 acquire 语义约束之后的相关内存访问。",
        "owner(m) = A",
        "control"
      ],
      [
        "在锁内维护不变量",
        0,
        1,
        "UPDATE",
        "A 在临界区内更新多个相关字段，并保证释放锁前恢复不变量。遵循同一锁协议的线程不会观察到不完整的中间状态。",
        "balance 与 ledger 已一致更新",
        "data"
      ],
      [
        "A 释放并发布",
        0,
        3,
        "UNLOCK / RELEASE",
        "A 释放 m；release 语义将临界区中的写入与随后成功获取同一锁的线程同步。单独的无关原子操作不会自动发布所有数据。",
        "owner(m) = none · A 的写入待同步读取",
        "control"
      ],
      [
        "B 获取同一锁",
        2,
        3,
        "LOCK / ACQUIRE",
        "B 成功获取 m 后，在保护下读取共享状态。A 的 release 与 B 对同一锁的 acquire 建立必要的顺序与可见性。",
        "owner(m) = B · B 可见 A 的受保护写入",
        "control"
      ]
    ],
    "principle": "互斥限制谁能进入临界区；同步关系约束可见性与重排序。原子性和内存排序是不同保证。",
    "tradeoff": "阻塞互斥锁可能挂起等待者，自旋锁会消耗 CPU；CAS 循环可能重试或活锁，也不会自动解决 ABA 与内存回收。",
    "pitfall": "relaxed 原子操作不自动为其他内存位置建立发布关系；单个原子操作也不保护跨变量不变量。无数据竞争仍不等于业务正确。",
    "code": [
      "A: lock(m)",
      "   updateRelatedFields(state)",
      "   assert invariant(state)",
      "   unlock(m)",
      "B: lock(m); readRelatedFields(state); unlock(m)"
    ],
    "sources": [
      "memory_order",
      "deadlock_notes"
    ],
    "related": [
      "txn",
      "occ",
      "schedule"
    ],
    "fault": {
      "name": "两个线程反序拿锁",
      "nodes": [
        "线程 A",
        "锁 X",
        "线程 B",
        "锁 Y"
      ],
      "steps": [
        [
          "A 先持有 X",
          0,
          1,
          "LOCK X",
          "A 按自己的获取顺序先成功拿到 X，但完成操作还需要 Y。",
          "owner(X) = A · Y 空闲",
          "control"
        ],
        [
          "B 先持有 Y",
          2,
          3,
          "LOCK Y",
          "B 采用相反顺序，先成功拿到 Y；它稍后还需要 X。",
          "owner(X) = A · owner(Y) = B",
          "control"
        ],
        [
          "A 持 X 等待 Y",
          0,
          3,
          "WAIT Y",
          "A 未释放 X 就尝试获取 Y。Y 由 B 持有，因此 A 阻塞等待。",
          "A 等 Y · A 仍持 X",
          "control"
        ],
        [
          "B 持 Y 等待 X",
          2,
          1,
          "WAIT X",
          "B 又等待 A 持有的 X，形成 A→Y→B→X→A 的等待环。统一锁顺序，或使用可回退的获取协议，可打破循环等待条件。",
          "A 与 B 循环等待 · DEADLOCK",
          "control"
        ]
      ],
      "code": [
        "parallel:",
        "  A: lock(X); lock(Y)",
        "  B: lock(Y); lock(X)",
        "// 若各自先拿到第一把锁，再等第二把锁，就会形成环",
        "// 修复示例：所有线程都先拿 X，再拿 Y"
      ]
    }
  },
  {
    "group": 0,
    "id": "async",
    "title": "异步 I/O 与事件循环",
    "en": "ASYNC I/O",
    "summary": "将“发起操作”和“结果就绪”分开，让线程在等待期间继续处理其他任务。",
    "nodes": [
      "任务 A",
      "非阻塞套接字 I/O",
      "就绪事件队列",
      "事件循环"
    ],
    "steps": [
      [
        "尝试读取并等待",
        0,
        1,
        "TRY READ / EAGAIN",
        "本例采用就绪通知式非阻塞 I/O。A 尝试读取，暂时没有数据而返回 EAGAIN；运行时登记可读兴趣并挂起 A 的继续执行。",
        "A: WAITING · 没有读取结果",
        "request"
      ],
      [
        "执行其他已就绪工作",
        3,
        3,
        "RUN OTHER",
        "事件循环处理其他可运行任务，或等待下一批事件。单个回调长时间占用线程，仍会拖住同一循环中的其他任务。",
        "A 仍等待 · 线程可服务其他任务",
        "local"
      ],
      [
        "系统报告可读",
        1,
        2,
        "READABLE",
        "系统把套接字可读事件加入就绪列表。这是再次尝试 I/O 的信号，不是完整业务结果，也不保证能一次读完消息。",
        "有就绪事件 · 业务尚未完成",
        "control"
      ],
      [
        "分派后再次尝试读取",
        3,
        0,
        "DISPATCH / READ",
        "事件循环取出事件并恢复 A，A 再执行非阻塞读取；可能得到部分数据、EOF、错误或再次 EAGAIN。只有满足完整消息等业务条件后才算完成。",
        "A: RUNNING · 可能再次 WAITING",
        "control"
      ]
    ],
    "principle": "把等待变为显式状态，完成、取消、超时和迟到结果都要有处理分支。",
    "tradeoff": "异步减少等待线程的成本，但状态分散、错误传播和取消语义更复杂。",
    "pitfall": "取消本地等待不代表远端操作已停止；迟到回调仍可能到达。",
    "code": [
      "result = emptyBuffer()",
      "while !messageComplete(result):",
      "  read = tryRead(socket)",
      "  if read.wouldBlock: await readable(socket); continue",
      "  if read.eof || read.error: return handleTerminalIO(read, result)",
      "  result.append(read.bytes)",
      "commitIfCurrent(version, result)"
    ],
    "sources": [
      "epoll",
      "read"
    ],
    "related": [
      "schedule",
      "ordering",
      "backpressure"
    ],
    "fault": {
      "name": "取消后旧回调迟到",
      "nodes": [
        "任务 · version 7",
        "事件循环",
        "当前任务状态",
        "旧事件队列"
      ],
      "steps": [
        [
          "旧任务登记等待",
          0,
          1,
          "WAIT version 7",
          "旧任务以 version 7 登记读取等待，回调绑定该执行身份；旧事件可能已进入系统或运行时队列。",
          "currentVersion = 7 · version 7: WAITING",
          "request"
        ],
        [
          "取消并推进版本",
          2,
          2,
          "CANCEL 7 / START 8",
          "用户发起新意图，当前版本推进到 8，并将旧任务标为取消。取消本地等待不保证已经排队的事件消失，也不保证外部操作停止。",
          "currentVersion = 8 · version 7 已取消",
          "local"
        ],
        [
          "旧事件仍被分派",
          3,
          1,
          "LATE EVENT v7",
          "先前排队的 version 7 就绪事件随后到达事件循环。事件到达并不能恢复旧任务的提交资格。",
          "收到 v7 回调 · 当前仍为 v8",
          "control"
        ],
        [
          "在写入边界拒绝旧版本",
          1,
          2,
          "REJECT v7",
          "回调先检查身份以快速退出；任何结果写入都必须与版本、取消状态校验处在同一原子或串行边界。旧回调被丢弃，不能覆盖 v8。",
          "v7 不提交 · v8 状态保持有效",
          "reject"
        ]
      ],
      "code": [
        "onReady(event):",
        "  if !isCurrent(event.version): return",
        "  result = tryRead(event.socket)",
        "  atomicOrSerialized:",
        "    if cancelled || event.version != currentVersion: return",
        "    applyIfComplete(result)"
      ]
    }
  },
  {
    "group": 0,
    "id": "backpressure",
    "title": "有界队列与背压",
    "en": "BOUNDED QUEUES",
    "summary": "当到达速度超过处理能力，把过载显式反馈给上游。",
    "nodes": [
      "生产者",
      "有界队列 K=3",
      "工作线程",
      "接入控制 / 预算"
    ],
    "steps": [
      [
        "接收三个任务",
        0,
        1,
        "ENQUEUE A,B,C",
        "用容量 K=3 的队列举例；A、B、C 被依次成功加入。检查容量与入队必须由有界队列原子地执行。",
        "排队 [A,B,C] · 3 / 3",
        "data"
      ],
      [
        "工作线程取出 A",
        1,
        2,
        "DEQUEUE A",
        "一个工作线程取出 A 执行，队列留下 B、C。排队数、运行中任务数和每秒吞吐量是不同指标。",
        "排队 [B,C] · 2 / 3 · 运行 A",
        "data"
      ],
      [
        "新任务 D 填满空位",
        0,
        1,
        "ENQUEUE D",
        "A 尚未完成时 D 到达并占用唯一空位；队列重新达到容量，但不会因此增加处理能力。",
        "排队 [B,C,D] · 3 / 3",
        "data"
      ],
      [
        "E 的入队被拒绝",
        0,
        1,
        "FULL / SLOW DOWN",
        "E 的原子入队尝试返回满；本例由接入控制拒绝它并反馈上游。也可按业务选择有期限的阻塞、丢弃或合并；队列容量必须保持受控。",
        "E 未入队 · 队列仍 3 / 3",
        "reject"
      ]
    ],
    "principle": "让缓冲有界，把过载处理写进协议。",
    "tradeoff": "更大队列能吸收突发，也增加排队时间；隔离资源池可避免单类任务拖垮所有业务。",
    "pitfall": "限流、背压和熔断解决的问题不同，不能用无限重试抵消拒绝信号。",
    "code": [
      "accepted = queue.tryPush(task) // 原子有界入队",
      "if !accepted: rejectWithOverload(task)",
      "worker.takeWhenReady()",
      "// 可选择有期限的阻塞入队，但不能先查大小再无条件 push"
    ],
    "sources": [
      "bounded",
      "systems"
    ],
    "related": [
      "measure",
      "retries",
      "schedule"
    ],
    "fault": {
      "name": "无界排队",
      "nodes": [
        "生产者",
        "无界队列",
        "工作线程",
        "延迟 / 内存指标"
      ],
      "steps": [
        [
          "改用无界队列接收突发",
          0,
          1,
          "ENQUEUE A,B,C",
          "反例从一开始就使用没有容量限制的队列。A、B、C 到达后全部被接收，尚未产生上游反馈。",
          "排队 [A,B,C] · 无容量上限",
          "data"
        ],
        [
          "只能取出一个执行",
          1,
          2,
          "DEQUEUE A",
          "一个工作线程取出 A，B 与 C 留在队列中；工作线程的处理能力没有随队列长度增加。",
          "排队 [B,C] · 运行 A",
          "data"
        ],
        [
          "到达持续快于消费",
          0,
          1,
          "ENQUEUE D,E,F",
          "A 执行期间又到达 D、E、F，无界队列继续全部接收。若这种到达速度持续高于服务速度，积压会不断增长。",
          "排队 [B,C,D,E,F] · 5 个等待",
          "data"
        ],
        [
          "积压暴露为延迟与内存",
          1,
          3,
          "QUEUE AGE / MEMORY",
          "监测到排队任务年龄与内存占用上升；等待可能耗尽请求截止时间。应限制容量与总在途工作，并让过载信号返回上游。",
          "积压增加 · 部分 deadline 将耗尽",
          "data"
        ]
      ],
      "code": [
        "queue = UnboundedQueue()",
        "onRequest(task): queue.push(task)",
        "worker: process(queue.take())",
        "// 持续 arrivalRate > serviceRate → backlog 增长",
        "// 接收成功不等于能在截止时间内处理"
      ]
    }
  },
  {
    "group": 0,
    "id": "measure",
    "title": "性能测量与瓶颈",
    "en": "PERFORMANCE ANALYSIS",
    "summary": "先定义工作负载与指标，再区分 CPU、I/O、锁和排队造成的时间。",
    "nodes": [
      "请求负载",
      "CPU / I/O / 锁",
      "指标与追踪",
      "优化实验"
    ],
    "steps": [
      [
        "建立可比较基线",
        0,
        1,
        "LOAD",
        "固定工作负载、并发度与测量窗口，明确端到端测量边界；记录吞吐、错误率与资源利用率。",
        "同一工作负载 · 保留基线",
        "request"
      ],
      [
        "观察分布与等待",
        1,
        2,
        "PROFILE",
        "查看 p50、p95、p99、排队长度和追踪，并区分处理时间与等待时间。平均值可能掩盖少量极慢请求。",
        "尾延迟、队列与资源数据齐备",
        "data"
      ],
      [
        "形成可验证假设",
        2,
        3,
        "HYPOTHESIS",
        "用剖析与追踪提出假设，例如锁等待占主导。理想 Amdahl 加速比为 1/(s+(1−s)/N)：s 是基线串行耗时比例，假设其余工作理想均分且无额外开销。",
        "假设：锁等待限制收益",
        "check"
      ],
      [
        "控制变量比较",
        3,
        3,
        "COMPARE",
        "修改一个关键因素，再用同样的负载比较基线与候选方案的吞吐、尾延迟、错误率和资源成本，决定假设是否成立。",
        "基线与候选结果比较 · 检查回归",
        "local"
      ]
    ],
    "principle": "优化的目标是可测量的系统行为，而不是局部代码看起来更快。",
    "tradeoff": "吞吐、延迟、内存和成本常互相制约；先确定服务目标。",
    "pitfall": "高 CPU 不一定是瓶颈，低 CPU 也不代表系统空闲：可能在等锁或 I/O。",
    "code": [
      "baseline = measure(workload, latencyDistribution, errors)",
      "hypothesis = profileAndLocateBottleneck()",
      "changeOneFactor()",
      "candidate = measure(sameWorkload, latencyDistribution, errors)",
      "compare(candidate, baseline)"
    ],
    "sources": [
      "amdahl",
      "systems"
    ],
    "related": [
      "cache",
      "backpressure",
      "observability"
    ],
    "fault": {
      "name": "只看平均延迟",
      "nodes": [
        "请求负载",
        "被测服务",
        "平均值报表",
        "完整样本 / 分布"
      ],
      "steps": [
        [
          "产生快慢不一的请求",
          0,
          1,
          "LOAD",
          "同一测量窗口内，多数请求很快，少数请求因排队或依赖等待而明显变慢。收集端到端耗时样本。",
          "存在少量慢请求",
          "request"
        ],
        [
          "报表只汇总均值",
          1,
          2,
          "MEAN ONLY",
          "监控只展示平均延迟，没有展示分位数、错误率或等待中的请求年龄；大量快请求可能让均值仍符合表面目标。",
          "平均延迟看似正常 · 尾部未知",
          "data"
        ],
        [
          "据均值过早判定健康",
          2,
          2,
          "INCOMPLETE CHECK",
          "仅凭均值就宣布服务健康，没有证据说明慢请求比例或最差等待符合目标。此结论超出了现有指标能支持的范围。",
          "遗漏慢请求体验与超时风险",
          "local"
        ],
        [
          "用分布揭示隐藏尾部",
          3,
          2,
          "ADD P95 / P99",
          "补看完整样本分布、请求年龄和队列长度，发现尾部已经恶化。均值与分位数分别回答不同问题，不能互相替代。",
          "平均正常 · 尾部恶化被确认",
          "compare"
        ]
      ],
      "code": [
        "samples = measureEndToEnd(workload)",
        "mean = average(samples)",
        "if mean < meanTarget: declareHealthy() // 证据不足",
        "// 补查分位数、错误率、队列长度与未完成请求年龄"
      ]
    }
  },
  {
    "group": 1,
    "id": "txn",
    "title": "事务与原子提交",
    "en": "TRANSACTIONS",
    "summary": "把一组相关修改作为一个业务动作提交或回滚。",
    "nodes": [
      "客户端",
      "事务执行器",
      "账户 A 与 B",
      "提交记录"
    ],
    "steps": [
      [
        "定义事务边界",
        0,
        1,
        "BEGIN",
        "例：A 向 B 转账 10。业务要求两边修改一起生效；先明确哪些数据属于同一原子边界。",
        "A=100 · B=100",
        "request"
      ],
      [
        "更新关联数据",
        1,
        2,
        "WRITE",
        "事务执行器在同一事务内写入 A=90、B=110。隔离机制控制其他事务能看见什么。",
        "事务内总额仍为 200 · 尚未提交",
        "data"
      ],
      [
        "提交并持久化",
        1,
        3,
        "COMMIT",
        "按照数据库的提交与持久化配置完成提交；原子性、隔离性、持久性分别需要机制支持。",
        "提交决定已记录",
        "control"
      ],
      [
        "对外返回",
        1,
        0,
        "ACK",
        "事务执行器返回业务成功。事务之外的邮件、消息、HTTP 调用不会自动随数据库回滚。",
        "对外可见：A=90 · B=110",
        "control"
      ]
    ],
    "principle": "业务不变量决定事务边界；ACID 的不同保证不能互相代替。",
    "tradeoff": "更大的事务更易表达原子性，也可能增加锁等待、冲突和恢复负担。",
    "pitfall": "可串行化讨论并发执行顺序；持久性讨论崩溃后保留，两者独立。",
    "code": [
      "begin()",
      "try:",
      "  debit(A, 10)",
      "  credit(B, 10)",
      "  commit()",
      "on error before commit:",
      "  rollback()"
    ],
    "sources": [
      "db",
      "recovery_notes"
    ],
    "related": [
      "isolation",
      "wal",
      "outbox"
    ],
    "fault": {
      "name": "第二次写入失败",
      "nodes": [
        "客户端",
        "事务执行器",
        "账户 A 与 B",
        "提交记录"
      ],
      "steps": [
        [
          "开始原子转账",
          0,
          1,
          "BEGIN",
          "客户端请求 A 向 B 转账 10；本次故障轨迹从两个账户均为 100 开始。",
          "A=100 · B=100",
          "request"
        ],
        [
          "第一笔写入成功",
          1,
          2,
          "DEBIT A",
          "事务内先将 A 扣为 90，此时 B 仍为 100；整个事务尚未提交。",
          "事务内 A=90 · B=100 · 未提交",
          "data"
        ],
        [
          "第二笔写入被拒绝",
          1,
          2,
          "CREDIT FAILED",
          "给 B 入账时发生错误。本例选择中止整个转账事务，不能继续返回成功。",
          "B=100 · 整个事务待回滚",
          "reject"
        ],
        [
          "中止整个事务",
          1,
          0,
          "ABORT",
          "数据库撤销修改或使本事务版本不可见，确认事务中止后向客户端返回失败。没有只扣款、未入账的已提交结果。",
          "对外 A=100 · B=100",
          "control"
        ]
      ],
      "code": [
        "begin()",
        "debit(A, 10)",
        "try credit(B, 10) -> error",
        "rollbackWholeTransaction()",
        "return failure"
      ]
    }
  },
  {
    "group": 1,
    "id": "isolation",
    "title": "隔离级别与两阶段锁",
    "en": "ISOLATION & 2PL",
    "summary": "限制并发交错，使事务不会读到或产生不允许的中间结果。",
    "nodes": [
      "事务 T1",
      "锁管理器",
      "共享记录 A",
      "事务 T2"
    ],
    "steps": [
      [
        "申请所需锁",
        0,
        1,
        "LOCK X(A)",
        "两阶段锁的增长阶段获取锁；读、写锁是否兼容由锁模式决定。本例采用把所有锁保留到事务结束的严格变体。",
        "T1 获得 X(A)",
        "request"
      ],
      [
        "冲突访问等待",
        3,
        1,
        "WAIT X(A)",
        "T2 想写同一记录，需要等待 T1 释放排他锁。锁范围也可能需要覆盖查询谓词或范围。",
        "T2: BLOCKED",
        "request"
      ],
      [
        "修改并提交",
        0,
        2,
        "WRITE A=90",
        "T1 在 X(A) 保护下修改记录并完成提交。将排他锁持有到提交或中止，可防止其他事务读到未提交写入。",
        "T1 已提交 A=90 · 即将释放锁",
        "data"
      ],
      [
        "释放并授予等待者",
        1,
        3,
        "GRANT X(A)",
        "T1 释放锁后，锁管理器把锁授予 T2。基础 2PL 进入释放阶段后不能再获取新锁；它保证冲突可串行化，但仍可能死锁。",
        "T2 获得 X(A) · 可以继续",
        "control"
      ]
    ],
    "principle": "隔离级别约束允许的异常；具体实现可能是锁、版本或依赖检测。",
    "tradeoff": "更强隔离减少应用推理负担，但可能引入等待、死锁或需要重试的事务中止。",
    "pitfall": "两阶段锁 2PL 是并发控制；两阶段提交 2PC 是跨参与者提交协议。",
    "code": [
      "acquireRequiredLocks()",
      "readAndWrite()",
      "commitOrAbort()",
      "releaseAllLocksAtTransactionEnd()"
    ],
    "sources": [
      "locks_notes",
      "pg"
    ],
    "related": [
      "txn",
      "mvcc",
      "occ"
    ],
    "fault": {
      "name": "读已提交下的不可重复读",
      "nodes": [
        "事务 T1",
        "每条语句的新快照",
        "共享记录 A",
        "事务 T2"
      ],
      "steps": [
        [
          "第一条查询读到 100",
          2,
          0,
          "READ 100",
          "这是独立的 PostgreSQL 读已提交示例。T1 的第一条普通 SELECT 读取当时已提交的 A=100，不持有阻止后续更新的读锁。",
          "T1 首次读到 100",
          "data"
        ],
        [
          "另一事务写入",
          3,
          2,
          "WRITE 90",
          "T2 更新 A=90，修改尚未提交；T1 不能把这个未提交值当作普通查询结果。",
          "T2 未提交 A=90",
          "data"
        ],
        [
          "另一事务提交",
          3,
          3,
          "COMMIT",
          "T2 完成提交。之后开始的新语句快照可以看到 A=90。",
          "已提交值 A=90",
          "local"
        ],
        [
          "第二条查询看到新值",
          2,
          0,
          "READ 90",
          "T1 在同一事务里再次执行 SELECT，但读已提交为该语句使用新快照，所以返回 90。这是该级别允许的不可重复读，不是绕过已经持有的排他锁。",
          "T1 两次读到 100 → 90",
          "data"
        ]
      ],
      "code": [
        "T1.begin(isolation = READ_COMMITTED)",
        "first = T1.select(A)  // 100",
        "T2.updateAndCommit(A, 90)",
        "second = T1.select(A) // 90 is permitted"
      ]
    }
  },
  {
    "group": 1,
    "id": "mvcc",
    "title": "MVCC 与快照",
    "en": "MULTI-VERSION CONCURRENCY",
    "summary": "保留数据版本，使读取者能看到符合自身快照规则的数据。",
    "nodes": [
      "读事务 R",
      "版本 v1: 100",
      "写事务 W",
      "版本 v2: 90"
    ],
    "steps": [
      [
        "建立快照并读取",
        1,
        0,
        "READ v1",
        "R 建立快照并读取可见的 v1。快照何时建立、是否每条语句刷新，由隔离级别与实现决定。",
        "R 可见值 = 100",
        "data"
      ],
      [
        "写入新版本",
        2,
        3,
        "NEW VERSION",
        "W 产生新版本，旧版本仍可能被较早的快照使用。",
        "v1 与未提交的 v2 共存",
        "data"
      ],
      [
        "提交新版本",
        2,
        2,
        "COMMIT",
        "W 完成提交后，满足可见性规则的新快照可读 v2；旧快照不必跟着变化。",
        "新快照可见 90",
        "local"
      ],
      [
        "旧快照继续读",
        1,
        0,
        "READ v1",
        "本例使用事务级快照：R 再读仍为 100。没有活跃快照需要的旧版本才具备回收条件。",
        "R 仍读 100 · 稍后清理 v1",
        "data"
      ]
    ],
    "principle": "版本解决“读哪个状态”，可串行化还要控制事务之间的依赖。",
    "tradeoff": "读写冲突可减少，但旧版本占空间；长事务会拖慢垃圾回收。",
    "pitfall": "MVCC 不自动保证可串行化；快照隔离可能出现写偏差。",
    "code": [
      "snapshot = beginTransactionSnapshot()",
      "first = readNewestVisibleVersion(snapshot)",
      "writer.createNewVersion(90)",
      "writer.commit()",
      "again = readNewestVisibleVersion(snapshot) // 100",
      "reclaimOnlyWhenNoSnapshotNeedsIt()"
    ],
    "sources": [
      "pg",
      "db"
    ],
    "related": [
      "isolation",
      "occ",
      "invariants"
    ],
    "fault": {
      "name": "两个医生同时下班",
      "nodes": [
        "医生 A 的事务",
        "快照 A=值班 B=值班",
        "医生 B 的事务",
        "值班记录 A / B"
      ],
      "steps": [
        [
          "A 看到 B 在值班",
          1,
          0,
          "READ B=ON",
          "A、B 两个事务都采用快照隔离，并在任一方提交前建立快照。A 看到 B 在值班，计划只更新自己的记录。",
          "A 计划下班 · B=值班",
          "data"
        ],
        [
          "B 看到 A 在值班",
          1,
          2,
          "READ A=ON",
          "B 在自己的旧快照中也看到 A 值班，计划只更新 B 的记录。两次判断都基于两人仍值班的状态。",
          "两事务都认为另一人会留守",
          "data"
        ],
        [
          "A 提交下班",
          0,
          3,
          "COMMIT A=OFF",
          "A 将自己的记录改为下班并提交；B 的快照仍然显示 A 在值班。",
          "当前 A=下班 · B=值班",
          "data"
        ],
        [
          "B 也提交下班",
          2,
          3,
          "COMMIT B=OFF",
          "B 写的是另一条记录，单纯检测同一记录写冲突的快照隔离可以让两者都提交，最终违反至少一人值班的不变量。可串行化执行应拒绝这种结果。",
          "A=下班 · B=下班 · 写偏差",
          "data"
        ]
      ],
      "code": [
        "A.beginSnapshot(); B.beginSnapshot()",
        "A.read(B.onCall) == true",
        "B.read(A.onCall) == true",
        "A.updateOwnRow(false); A.commit()",
        "B.updateOwnRow(false); B.commit()",
        "// Snapshot isolation can permit both commits."
      ]
    }
  },
  {
    "group": 1,
    "id": "occ",
    "title": "乐观并发控制",
    "en": "OPTIMISTIC CONCURRENCY",
    "summary": "先基于读取状态计算，提交时验证其仍然有效。",
    "nodes": [
      "事务 T1",
      "记录及版本",
      "事务 T2",
      "原子提交检查"
    ],
    "steps": [
      [
        "读取基线",
        1,
        0,
        "READ v7",
        "本例展示单记录版本条件更新。T1 读取值与版本号，在本地计算新状态。",
        "expectedVersion = 7",
        "data"
      ],
      [
        "并发修改",
        2,
        1,
        "WRITE v8",
        "T2 原子提交值与新版本号，将记录版本推进到 8。",
        "currentVersion = 8",
        "data"
      ],
      [
        "校验前置条件",
        0,
        3,
        "REJECT v7",
        "T1 已尝试以版本仍为 7 为前提提交。原子检查发现版本为 8，拒绝写入；检查与更新之间不能留下竞争窗口。",
        "7 ≠ 8 · T1 未写入",
        "reject"
      ],
      [
        "重读并重算",
        0,
        1,
        "READ FRESH",
        "T1 放弃旧计算，重新读取 v8 后重算并重试。多记录 OCC 还需要验证完整的相关读写依赖，包括必要的范围或谓词依赖。",
        "重新读取 v8 · 不复用旧结果",
        "request"
      ]
    ],
    "principle": "提交时验证决定正确性的前置条件，并原子地完成条件检查与更新。",
    "tradeoff": "低冲突时避免长时间持锁；高冲突下重试浪费算力，可能导致饥饿。",
    "pitfall": "只检查单个版本号，不能自动保护跨记录条件或范围查询。",
    "code": [
      "base = readValueAndVersion()",
      "next = compute(base.value)",
      "ok = atomicUpdateIfVersion(",
      "  expected = base.version,",
      "  value = next, version = base.version + 1)",
      "if !ok: retryFromFreshState()"
    ],
    "sources": [
      "occ_paper",
      "versioning"
    ],
    "related": [
      "sync",
      "mvcc",
      "ordering"
    ],
    "fault": {
      "name": "忽略冲突强行写入",
      "nodes": [
        "事务 T1",
        "记录及版本",
        "事务 T2",
        "T1 的本地计算"
      ],
      "steps": [
        [
          "T1 读取旧值",
          1,
          0,
          "READ 100 / v7",
          "共享值初始为 100，版本为 7。T1 计划在读到的值上增加 10。",
          "T1 基线 = 100 / v7",
          "data"
        ],
        [
          "计算但尚未提交",
          0,
          3,
          "COMPUTE 110",
          "T1 在本地得到 110，还没有更新共享记录。",
          "待写结果 = 110",
          "data"
        ],
        [
          "T2 提交减 10",
          2,
          1,
          "COMMIT 90 / v8",
          "T2 把共享值减为 90，原子提交新值和版本 8。",
          "共享值 = 90 / v8",
          "data"
        ],
        [
          "旧计算盲目覆盖",
          0,
          1,
          "BLIND WRITE 110",
          "T1 不检查版本就写入旧计算 110，覆盖了 T2 的减 10。两个加减操作若串行执行应得到 100，而不是 110。",
          "丢失 T2 更新 · 最终 110",
          "data"
        ]
      ],
      "code": [
        "base = read()                 // 100, v7",
        "next = base.value + 10        // 110",
        "T2.commit(value = 90, version = 8)",
        "writeWithoutVersionCheck(next)",
        "// T2's decrement is lost."
      ]
    }
  },
  {
    "group": 1,
    "id": "wal",
    "title": "预写日志 WAL",
    "en": "WRITE-AHEAD LOGGING",
    "summary": "先保证恢复所需的日志持久化，再允许对应的数据页落盘。",
    "nodes": [
      "事务与内存页",
      "WAL 缓冲区",
      "持久化日志",
      "磁盘数据页"
    ],
    "steps": [
      [
        "记录页面修改",
        0,
        1,
        "UPDATE LSN 42",
        "修改内存页面并产生日志记录 42。WAL 不要求修改内存页之前先刷盘，但数据页写回必须先有对应的持久日志。",
        "pageLSN=42 · 内存页已脏",
        "data"
      ],
      [
        "提交记录与日志持久化",
        1,
        2,
        "FLUSH THROUGH 43",
        "事务完成写入后追加提交记录 43，再把日志刷到 43。仅刷到页面修改记录 42，不足以证明事务已经持久提交。",
        "durableLSN=43 ≥ commitLSN=43",
        "data"
      ],
      [
        "确认持久提交",
        0,
        0,
        "COMMIT ACK",
        "本例要求同步持久提交；确认日志已持久到本事务的提交记录之后，才向客户端返回成功。数据页可稍后写回。",
        "提交记录已持久化 · 可以确认成功",
        "local"
      ],
      [
        "稍后刷数据页",
        0,
        3,
        "FLUSH PAGE",
        "将脏页写回前核对 durableLSN ≥ pageLSN。WAL 允许数据页滞后；是否允许提交前刷页还取决于恢复协议。",
        "durableLSN ≥ pageLSN=42",
        "data"
      ]
    ],
    "principle": "正确的“先”是日志先于对应数据页持久化，并非日志先于内存修改。",
    "tradeoff": "顺序日志与组提交能降低持久化成本；同步策略影响延迟及故障时的数据丢失窗口。",
    "pitfall": "开启 WAL 本身不等于所有成功响应都绝不丢失，还要核对提交和存储持久化语义。",
    "code": [
      "page.LSN = updateBufferAndAppendLog()",
      "commitLSN = appendCommitRecord()",
      "flushLogThrough(commitLSN)",
      "ackCommit() // synchronous durability in this example",
      "beforeFlush(page): require durableLSN >= page.LSN",
      "flushDataPageLater()"
    ],
    "sources": [
      "wal",
      "wal_commit",
      "recovery_notes"
    ],
    "related": [
      "txn",
      "recovery",
      "outbox"
    ],
    "fault": {
      "name": "提交记录持久化前崩溃",
      "nodes": [
        "事务与内存页",
        "WAL 缓冲区",
        "持久化日志",
        "恢复后的可见状态"
      ],
      "steps": [
        [
          "生成修改日志",
          0,
          1,
          "UPDATE LSN 42",
          "事务把值从 100 改为 90，并为页面修改产生日志 42；事务尚未提交。",
          "内存值 90 · pageLSN=42",
          "data"
        ],
        [
          "只刷出修改记录",
          1,
          2,
          "FLUSH THROUGH 42",
          "日志 42 已持久化，但提交记录尚未持久化。更新日志可用于恢复，不代表业务已成功提交。",
          "durableLSN=42 · 无持久提交证据",
          "data"
        ],
        [
          "确认成功前崩溃",
          0,
          0,
          "CRASH",
          "系统在提交记录持久化、返回成功之前崩溃。内存状态丢失；客户端没有本次成功确认。",
          "事务结果不能判为已提交",
          "local"
        ],
        [
          "恢复时排除未提交结果",
          2,
          3,
          "RECOVER UNCOMMITTED",
          "恢复协议可能先重做物理修改，再撤销或用可见性规则排除未提交事务。本例没有持久提交记录，不能将 90 作为成功结果。",
          "本例可见值仍为 100",
          "data"
        ]
      ],
      "code": [
        "updateLSN = logUpdate(100, 90)",
        "flushLogThrough(updateLSN)",
        "crashBeforeCommitRecordIsDurable()",
        "recoverUsingTransactionStatus()",
        "assert !isCommitted(transaction)"
      ]
    }
  },
  {
    "group": 1,
    "id": "recovery",
    "title": "崩溃恢复与检查点",
    "en": "CRASH RECOVERY",
    "summary": "从持久化记录重建可继续运行的状态，区分已提交与未完成的工作。",
    "nodes": [
      "检查点元数据",
      "持久化日志",
      "恢复管理器",
      "数据库状态"
    ],
    "steps": [
      [
        "找到恢复起点",
        0,
        2,
        "CHECKPOINT",
        "读取有效检查点元数据，按恢复协议确定需要扫描的日志范围；检查点不必表示所有页面在同一瞬间落盘。",
        "定位必要日志 · 不假定检查点前全已完成",
        "data"
      ],
      [
        "分析与重做",
        1,
        2,
        "REDO",
        "根据恢复协议重建必要状态，并重做尚未体现在页面上的日志记录；某些协议会先重演包含未提交修改的历史。",
        "页面和事务状态逐步重建",
        "data"
      ],
      [
        "处理未完成事务",
        2,
        3,
        "UNDO / INVISIBLE",
        "需要时撤销未提交更新，或用事务状态和版本可见性排除它们。不同数据库并不都采用 ARIES 的物理 UNDO 路径。",
        "未提交结果不能作为成功结果",
        "data"
      ],
      [
        "继续运行",
        2,
        2,
        "OPEN DATABASE",
        "页面、事务状态和恢复元数据满足一致性条件后，恢复管理器重新开放数据库服务。",
        "服务恢复 · 保留安全状态",
        "local"
      ]
    ],
    "principle": "恢复必须有明确的持久化依据；不能用“进程启动了”代替“状态正确了”。",
    "tradeoff": "更频繁检查点缩短部分恢复工作，但增加运行时 I/O；保留日志还要考虑备份与复制。",
    "pitfall": "WAL、检查点和备份职责不同；单机恢复不能替代异地备份。",
    "code": [
      "start = locateValidRecoveryPoint()",
      "replayRequiredLog(start)",
      "resolveUncommittedTransactionsByProtocol()",
      "openDatabaseWhenConsistent()"
    ],
    "sources": [
      "recovery_notes",
      "wal"
    ],
    "related": [
      "wal",
      "invariants",
      "messaging"
    ],
    "fault": {
      "name": "重放期间再次崩溃",
      "nodes": [
        "检查点元数据",
        "持久化日志",
        "恢复管理器",
        "数据库页面"
      ],
      "steps": [
        [
          "开始第一次恢复",
          0,
          2,
          "START RECOVERY",
          "读取有效检查点并发现页面仍停留在 LSN 40；持久日志中包含需要重做的更新 42。",
          "磁盘 pageLSN=40 · 需要重做 42",
          "data"
        ],
        [
          "重做并写回一页",
          1,
          3,
          "REDO 42",
          "按协议重做记录 42，并把修改后的页面及其 pageLSN 一起可靠写回。数据库整体恢复仍未结束。",
          "该页持久 pageLSN=42",
          "data"
        ],
        [
          "恢复进程再次崩溃",
          2,
          2,
          "CRASH AGAIN",
          "恢复管理器在处理其余日志前再次崩溃；刚才已持久化的页面和原始日志仍在。",
          "服务尚未开放 · 恢复未完成",
          "local"
        ],
        [
          "重启并跳过已完成修改",
          0,
          2,
          "RESTART RECOVERY",
          "从有效恢复起点再扫描。支持 pageLSN 判定的重做协议可识别该页已包含记录 42，跳过它并继续其余工作；其他实现也必须提供等价的可重入保证。",
          "记录 42 不重复产生额外效果",
          "data"
        ]
      ],
      "code": [
        "startRecoveryFromValidCheckpoint()",
        "redoAndPersistPage(recordLSN = 42)",
        "crash()",
        "restartRecovery()",
        "skipAlreadyAppliedRedoUsingPageLSN()",
        "continueRemainingRecovery()"
      ]
    }
  },
  {
    "group": 1,
    "id": "index",
    "title": "B+ 树与 LSM 树",
    "en": "STORAGE INDEXES",
    "summary": "用不同的数据布局，在查询成本、写入成本和空间占用之间取舍。",
    "nodes": [
      "访问需求",
      "B+ 树页",
      "LSM MemTable",
      "有序 SST 文件"
    ],
    "steps": [
      [
        "方案 A：B+ 树路径",
        0,
        1,
        "OPTION A",
        "这里比较两种替代方案。本例的页式 B+ 树按键定位叶页并更新；有序叶子适合点查询和范围扫描，页满时可能分裂。",
        "独立方案 A · 修改叶页",
        "compare"
      ],
      [
        "方案 B：LSM 路径",
        0,
        2,
        "OPTION B",
        "现在改看另一种实现，不是把上一步写入再执行一次。LSM 先写入内存结构，通常辅以日志保护，累积后刷成有序文件。",
        "独立方案 B · MemTable 累积",
        "compare"
      ],
      [
        "LSM 后续刷盘与合并",
        2,
        3,
        "FLUSH / COMPACT",
        "沿方案 B 继续：刷盘产生 SST；后台压实合并文件、处理旧版本与删除标记，同时消耗 I/O。",
        "此步骤仅属于 LSM 路径",
        "data"
      ],
      [
        "比较查询与写入成本",
        1,
        3,
        "TRADEOFF",
        "比较两个方案的读、写和空间成本。LSM 查询可能访问多个结构；布隆过滤器等可减少无效读取。选择取决于真实读写模式。",
        "读放大 / 写放大 / 空间放大",
        "compare"
      ]
    ],
    "principle": "索引结构决定数据访问路径，不能脱离缓存、持久化与工作负载比较。",
    "tradeoff": "B+ 树与 LSM 都有工程变体；LSM 压实以写放大换取查询与空间效率。",
    "pitfall": "LSM 不是“每个字节只写一次”；compaction 可能重复搬运数据。",
    "code": [
      "if engine == B_PLUS_TREE:",
      "  updateLeafAndSplitIfNeeded()",
      "else if engine == LSM:",
      "  appendWALAndUpdateMemtable()",
      "  if memtableFull: flushSortedRun()",
      "  compactRunsInBackground()"
    ],
    "sources": [
      "bpt",
      "rocks",
      "stalls"
    ],
    "related": [
      "cache",
      "wal",
      "measure"
    ],
    "fault": {
      "name": "压实跟不上写入",
      "nodes": [
        "写入请求",
        "LSM MemTable",
        "后台压实与限速",
        "有序 SST 文件"
      ],
      "steps": [
        [
          "持续接收 LSM 写入",
          0,
          1,
          "LSM WRITE",
          "本故障轨迹只讨论 LSM。写入持续进入 MemTable，日志按所选持久化策略保护修改。",
          "写入速率持续较高",
          "data"
        ],
        [
          "刷出更多有序文件",
          1,
          3,
          "FLUSH SST",
          "MemTable 到达阈值后刷成新的 SST；新文件生成速度持续高于后台处理速度。",
          "待处理 SST 持续增加",
          "data"
        ],
        [
          "后台压实积压",
          3,
          2,
          "COMPACTION BACKLOG",
          "文件需要压实，但后台 I/O 或 CPU 预算不足。积压增加查询与空间成本，逼近限速阈值。",
          "待压实字节 / 文件数量过高",
          "control"
        ],
        [
          "限制新写入",
          2,
          0,
          "WRITE STALL",
          "存储引擎延迟或暂停新写入，为后台刷盘和压实留出资源；积压下降到恢复条件后再继续接收。",
          "写入受限 · 后台继续消化积压",
          "control"
        ]
      ],
      "code": [
        "appendWALAndUpdateMemtable()",
        "flushWhenMemtableFull()",
        "if tooManyFiles || pendingCompactionTooLarge:",
        "  delayOrStopNewWrites()",
        "keepBackgroundCompactionRunning()",
        "resumeWhenBacklogDrops()"
      ]
    }
  },
  {
    "group": 1,
    "id": "invariants",
    "title": "不变量与状态机验证",
    "en": "INVARIANTS & VERIFICATION",
    "summary": "先写明所有合法执行都必须满足什么，再用模型与故障测试寻找反例。",
    "nodes": [
      "规范与假设",
      "有限状态模型",
      "模型检查器",
      "反例 / 验证结果"
    ],
    "steps": [
      [
        "定义安全属性",
        0,
        1,
        "SAFETY",
        "例如：同一任务版本最多有一个有效提交结果。把状态、事件和提交前置条件表达清楚。",
        "坏事永远不发生",
        "control"
      ],
      [
        "定义活性条件",
        0,
        1,
        "LIVENESS",
        "例如：在依赖最终可用且调度公平等假设下，任务最终完成。把环境、故障范围与公平性假设写进规范。",
        "好事最终会发生 · 假设明确",
        "control"
      ],
      [
        "探索状态与执行循环",
        1,
        2,
        "MODEL CHECK",
        "模型包含崩溃、重复、乱序和分区转移。检查可达状态中的安全属性；验证活性时，还需检查满足假设却无法进展的执行循环。",
        "状态图 + 活性循环检查",
        "data"
      ],
      [
        "用结果修复并回归",
        2,
        3,
        "RESULT",
        "读取反例以改进协议、模型和测试。通过检查的结论仅覆盖该模型、假设与检查范围，仍需核对实现。",
        "反例可重现 · 规范与实现需对应",
        "data"
      ]
    ],
    "principle": "把正确性写成可检查的属性，围绕关键事件和故障交错验证。",
    "tradeoff": "模型越贴近实现越复杂；抽象需要保留决定正确性的状态和顺序。",
    "pitfall": "测试没发现问题不等于证明正确；心跳正常也不等于系统持续取得业务进展。",
    "code": [
      "model = defineFiniteStateModel()",
      "checkInvariantInEveryReachableState(model)",
      "checkLivenessWithExplicitFairness(model)",
      "if counterexample: reviseAndCheckAgain()",
      "verifyImplementationMatchesModel()"
    ],
    "sources": [
      "tla",
      "deadlock_notes"
    ],
    "related": [
      "fencing",
      "occ",
      "observability"
    ],
    "fault": {
      "name": "仅检查进程存活",
      "nodes": [
        "任务 A",
        "任务 B",
        "锁状态 X / Y",
        "健康与进度监控"
      ],
      "steps": [
        [
          "A 先取得 X",
          0,
          2,
          "LOCK X",
          "任务 A 取得锁 X，准备继续取得 Y；此时没有持有全部所需资源。",
          "X 归 A · Y 空闲",
          "request"
        ],
        [
          "B 先取得 Y",
          1,
          2,
          "LOCK Y",
          "任务 B 取得 Y，随后需要 X。两个任务的锁获取顺序不同。",
          "X 归 A · Y 归 B",
          "request"
        ],
        [
          "形成循环等待",
          2,
          2,
          "WAIT CYCLE",
          "A 请求 Y 被 B 阻塞，B 请求 X 被 A 阻塞。若没有超时中止、死锁处理或其他恢复，两者都无法继续；公平调度不能让被锁阻塞的动作自动成功。",
          "A 等 B · B 等 A · 无任务进展",
          "local"
        ],
        [
          "心跳掩盖业务停滞",
          3,
          3,
          "HEARTBEAT ≠ PROGRESS",
          "独立健康检查仍可返回成功，但业务任务没有推进。结合等待关系、任务年龄与阶段变化才能识别阻塞，并按协议恢复。",
          "进程存活 · 任务死锁",
          "local"
        ]
      ],
      "code": [
        "schedule(A.acquire(X), B.acquire(Y))",
        "schedule(A.request(Y), B.request(X))",
        "assert heartbeatEndpoint() == OK",
        "assert detectWaitForCycle(A, B)",
        "// No completion without a recovery transition."
      ]
    }
  },
  {
    "group": 2,
    "id": "retries",
    "title": "超时、重试与退避",
    "en": "TIMEOUTS & RETRIES",
    "summary": "超时只表示在期限内未得到结果，不能证明远端没有执行。",
    "nodes": [
      "客户端 / 重试预算",
      "网络",
      "服务端",
      "结果查询"
    ],
    "steps": [
      [
        "发送逻辑请求",
        0,
        1,
        "REQUEST K",
        "客户端为一次逻辑操作生成稳定的 K，并设置覆盖所有尝试的总截止时间。",
        "同一逻辑操作使用同一 K",
        "request"
      ],
      [
        "服务提交、响应丢失",
        1,
        2,
        "EXECUTE K",
        "请求到达服务端并提交；本例中成功响应在返回途中丢失，客户端尚不知道结果。",
        "服务端已提交 · 客户端尚未知",
        "request"
      ],
      [
        "本地等待超时",
        0,
        0,
        "TIMEOUT",
        "客户端自己的计时器到期。超时不能证明服务端没有执行，也不会自动撤销远端效果。",
        "UNKNOWN ≠ FAILED",
        "local"
      ],
      [
        "退避后有限重试",
        0,
        1,
        "RETRY K",
        "确认接口支持所需幂等语义后，在总预算内退避并加入随机抖动，以相同 K 和参数重试；也可按协议查询结果。",
        "相同 K · 有限尝试 · 结果待确认",
        "request"
      ]
    ],
    "principle": "把超时看成不确定性，用协议解决结果查询与重复副作用。",
    "tradeoff": "更积极重试可掩盖短暂故障，也会放大已过载服务的压力。",
    "pitfall": "无限重试不是可靠性；各层分别重试会乘法放大请求数量。",
    "code": [
      "key = stableIdForLogicalOperation()",
      "deadline = monotonicNow() + totalBudget",
      "while attemptsRemain() && before(deadline):",
      "  result = request(key, sameParameters, deadline)",
      "  if result.success || result.permanentFailure: return result",
      "  if !safeAndRetryable(result): return UNKNOWN",
      "  waitWithinDeadline(backoffWithJitter())",
      "return UNKNOWN"
    ],
    "sources": [
      "retry",
      "idempotent"
    ],
    "related": [
      "idempotency",
      "backpressure",
      "observability"
    ],
    "fault": {
      "name": "反例：立即、无限重试",
      "nodes": [
        "客户端群",
        "网络",
        "过载服务",
        "重试策略"
      ],
      "steps": [
        [
          "同时发起请求",
          0,
          1,
          "REQUEST Kᵢ",
          "多个客户端各自发送逻辑请求 Kᵢ；本反例故意不设置重试次数和总预算。",
          "多个请求同时在途",
          "request"
        ],
        [
          "请求到达，响应未达",
          1,
          2,
          "EXECUTE / NO RESPONSE",
          "图中请求到达服务端；服务端可能已经产生部分业务效果，但高负载使返回的响应延迟或丢失。",
          "部分效果可能已生效",
          "request"
        ],
        [
          "客户端同时超时",
          0,
          0,
          "TIMEOUT",
          "这些客户端在相近时间超时；每个调用者掌握的仍是不确定结果。",
          "UNKNOWN · 不能当作未执行",
          "local"
        ],
        [
          "立即连续重发",
          0,
          2,
          "RETRY STORM",
          "错误策略让客户端不退避、不限次地反复重发，放大服务压力；即使按 Kᵢ 去重，重复请求也会消耗资源。",
          "重试放大 · 恢复更困难",
          "request"
        ]
      ],
      "code": [
        "// Counterexample: no deadline, limit, or backoff",
        "while true:",
        "  result = request(sameLogicalId, sameParameters)",
        "  if result.isKnown: return result",
        "  continue"
      ]
    }
  },
  {
    "group": 2,
    "id": "idempotency",
    "title": "幂等键与结果去重",
    "en": "IDEMPOTENCY",
    "summary": "让同一逻辑请求的重复到达，复用同一个业务效果。",
    "nodes": [
      "客户端",
      "服务实例 A",
      "数据库：业务 + 去重",
      "服务实例 B"
    ],
    "steps": [
      [
        "建立稳定身份",
        0,
        1,
        "KEY K",
        "客户端发送 K 和参数；K 在调用者与操作的约定作用域内标识一次意图，重试沿用它。",
        "K 绑定调用者、操作与参数",
        "request"
      ],
      [
        "原子执行并记录",
        1,
        2,
        "ATOMIC TX K",
        "数据库通过唯一键与事务串行化同一 K 的竞争，核对参数，并把业务修改、完成状态和结果 R 一起提交。",
        "业务效果与 K→R 一起持久提交",
        "data"
      ],
      [
        "重复请求到达另一实例",
        0,
        3,
        "RETRY K",
        "首次响应未被客户端收到，它以相同 K 和参数重试，负载均衡把请求送到实例 B。",
        "逻辑身份不随尝试或实例改变",
        "request"
      ],
      [
        "返回已保存结果",
        2,
        3,
        "SAVED R",
        "B 查询共享的已提交记录；数据库返回 R，B 再向客户端返回同义结果，不再执行该业务效果。",
        "完成记录命中 · 业务效果仍只有一次",
        "data"
      ]
    ],
    "principle": "幂等的核心是重复操作不增加额外业务效果，关键在原子边界与身份稳定。",
    "tradeoff": "去重记录需要存储与保留策略；过期后重新出现的请求仍要有明确语义。",
    "pitfall": "事务名本身不能消除“先查再写”的竞争；还需唯一约束或等价串行化协议。事务外部副作用和去重记录过期必须另行定义语义。",
    "code": [
      "transaction:",
      "  row = claimOrLockUnique(caller, key, parameters)",
      "  require row.parameters == parameters",
      "  if row.completed: return row.savedResult",
      "  result = applyBusinessMutation()",
      "  saveCompletedResult(row, result)",
      "// Commit effect, identity, and result together"
    ],
    "sources": [
      "idempotent",
      "db"
    ],
    "related": [
      "retries",
      "txn",
      "outbox"
    ],
    "fault": {
      "name": "反例：查重与执行未原子化",
      "nodes": [
        "相同逻辑请求 K",
        "服务实例 A",
        "共享数据库",
        "服务实例 B"
      ],
      "steps": [
        [
          "A 查到键不存在",
          1,
          2,
          "LOOKUP K: MISS",
          "两个实例已收到相同 K 的并发请求。本反例没有唯一占位或覆盖查重与修改的事务；A 先查到记录不存在。",
          "A 判断 K 未处理",
          "request"
        ],
        [
          "B 也查到不存在",
          3,
          2,
          "LOOKUP K: MISS",
          "A 尚未记录完成时，B 的独立查询也得到不存在；两个判断都不能保留执行权。",
          "A、B 都准备执行",
          "request"
        ],
        [
          "A 执行第一次修改",
          1,
          2,
          "APPLY K",
          "A 根据先前查询执行业务修改并记录结果；查询和写入之间没有隔离条件。",
          "业务效果计数 = 1",
          "data"
        ],
        [
          "B 执行第二次修改",
          3,
          2,
          "DUPLICATE EFFECT",
          "B 继续使用自己的旧查询结果执行修改，重复业务效果已经产生；事后补写 K 不能撤销它。",
          "业务效果计数 = 2",
          "data"
        ]
      ],
      "code": [
        "// Counterexample: check and effect can race",
        "if lookup(key) == ABSENT:",
        "  applyBusinessMutation()",
        "  saveCompletedResult(key, result)",
        "// Two workers may both pass the lookup"
      ]
    }
  },
  {
    "group": 2,
    "id": "messaging",
    "title": "消息、确认与重放",
    "en": "DELIVERY & ACKNOWLEDGMENT",
    "summary": "区分“消息到达”“业务提交”和“消费确认”，在崩溃后安全重放。",
    "nodes": [
      "消息队列",
      "消费者",
      "业务存储",
      "恢复后的消费者"
    ],
    "steps": [
      [
        "投递消息",
        0,
        1,
        "DELIVER M",
        "队列把 M 交给消费者，并等待消费确认。投递成功不代表业务已提交。",
        "M: IN FLIGHT",
        "data"
      ],
      [
        "原子提交业务与去重",
        1,
        2,
        "COMMIT M",
        "消费者在同一事务中写业务结果和 M 的已处理记录，并用唯一约束或等价协议处理并发重复。",
        "业务效果与消费记录已持久提交",
        "data"
      ],
      [
        "向队列发送确认",
        1,
        0,
        "ACK M",
        "提交成功后，消费者向队列发送 ACK。ACK 可能在途中丢失，消费者不能据此假定永远不会重投。",
        "ACK 已发送 · 队列尚待处理",
        "data"
      ],
      [
        "队列记录确认",
        0,
        0,
        "ACKNOWLEDGED",
        "队列收到并处理 ACK，按其协议移除未确认投递或推进消费位置；消费端仍保留所需去重语义。",
        "本次投递已确认",
        "local"
      ]
    ],
    "principle": "至少一次投递与幂等消费配合，才能在重放时控制业务副作用。",
    "tradeoff": "批量确认提高吞吐，但扩大重放范围；顺序消费会限制并行度。",
    "pitfall": "“恰好一次”必须说明边界；队列保证不自动覆盖外部 HTTP、邮件或支付效果。",
    "code": [
      "message = receive()",
      "transaction:",
      "  if claimUnprocessedUnique(message.id):",
      "    applyBusinessEffect()",
      "    markProcessed(message.id)",
      "ackAfterCommit(message)"
    ],
    "sources": [
      "acks",
      "idempotent"
    ],
    "related": [
      "idempotency",
      "outbox",
      "recovery"
    ],
    "fault": {
      "name": "安全恢复：提交后、ACK 前崩溃",
      "nodes": [
        "消息队列",
        "崩溃消费者",
        "业务存储",
        "恢复后的消费者"
      ],
      "steps": [
        [
          "投递消息",
          0,
          1,
          "DELIVER M",
          "队列发送 M，使用需要显式确认的投递协议。",
          "M: IN FLIGHT",
          "data"
        ],
        [
          "提交业务与消费记录",
          1,
          2,
          "COMMIT M",
          "消费者把业务效果和 M 的去重记录原子地持久提交。",
          "M 已处理 · 尚未 ACK",
          "data"
        ],
        [
          "确认前进程崩溃",
          1,
          1,
          "CRASH BEFORE ACK",
          "消费者在发送 ACK 前崩溃。队列在连接关闭、故障检测或可见性超时后，按协议允许再次投递。",
          "业务已提交 · 队列仍未确认",
          "local"
        ],
        [
          "重投后复用结果",
          0,
          3,
          "REDELIVER M",
          "恢复后的消费者收到同一 M，核对已提交消费记录后跳过业务修改，再发送 ACK；后续 ACK 丢失仍可按同样方式重放。",
          "重复投递 · 没有第二次业务效果",
          "data"
        ]
      ],
      "code": [
        "commitEffectAndProcessedIdAtomically(M)",
        "crashBeforeAck()",
        "// After restart or redelivery:",
        "if processed(M.id): skipBusinessMutation()",
        "ack(M)"
      ]
    }
  },
  {
    "group": 2,
    "id": "ordering",
    "title": "序号、版本与任期",
    "en": "ORDERING & VERSIONS",
    "summary": "用有明确作用域的版本信息，识别迟到消息和过期执行。",
    "nodes": [
      "权威目标 / 提交存储",
      "当前任务 run=8",
      "旧任务 run=7",
      "提交处理器"
    ],
    "steps": [
      [
        "推进目标与有效执行",
        0,
        0,
        "VERSION 2 / RUN 8",
        "控制器原子地把当前目标设为 v2、有效执行设为 run=8；新任务绑定这两个身份。",
        "current = (goal=2, run=8)",
        "local"
      ],
      [
        "旧结果迟到",
        2,
        3,
        "RESULT (1,7)",
        "旧任务仍可能继续运行，向提交处理器发送目标 v1、run=7 的结果。",
        "到达时间不代表新旧顺序",
        "data"
      ],
      [
        "在写入边界核对身份",
        3,
        0,
        "CHECK / REJECT",
        "提交存储原子检查目标版本、当前 run 与任务状态；(1,7) 不满足当前 (2,8)，不改变业务状态。",
        "旧结果被拒绝",
        "reject"
      ],
      [
        "提交当前结果",
        1,
        0,
        "COMMIT (2,8)",
        "run=8 的结果通过同一原子条件更新目标 v2 的状态；同一执行的重复完成也按状态或请求 ID 去重。",
        "v2 得到有效执行的结果",
        "data"
      ]
    ],
    "principle": "版本的比较规则与作用域必须清楚，提交前置条件要在实际写入边界执行。",
    "tradeoff": "版本协议增加状态，但让取消、重试和迁移的竞争可以被检测。",
    "pitfall": "序号只在定义的序列中有序；墙上时钟不能自动提供跨机器全序。",
    "code": [
      "result = run(goalVersion, runId)",
      "storage.atomicCommitIf(",
      "  result.goalVersion == currentGoalVersion &&",
      "  result.runId == currentRunId &&",
      "  taskState == expectedTaskState, result)",
      "// Repeated completion must also be defined"
    ],
    "sources": [
      "versioning",
      "dist"
    ],
    "related": [
      "occ",
      "async",
      "fencing"
    ],
    "fault": {
      "name": "反例：按到达时间覆盖状态",
      "nodes": [
        "权威目标 / 提交存储",
        "当前任务 run=8",
        "旧任务 run=7",
        "无版本检查的处理器"
      ],
      "steps": [
        [
          "新目标已经生效",
          0,
          0,
          "CURRENT (2,8)",
          "当前目标已更新为 v2，有效执行为 run=8；旧任务的取消消息未必已经生效。",
          "current = (goal=2, run=8)",
          "local"
        ],
        [
          "旧任务返回结果",
          2,
          3,
          "LATE RESULT (1,7)",
          "run=7 为旧目标 v1 生成的结果晚到，进入未实现提交条件的处理器。",
          "旧结果仍可能到达",
          "data"
        ],
        [
          "错误地按最后到达处理",
          3,
          3,
          "LATEST ARRIVAL",
          "本反例处理器只比较接收时间，不检查权威目标、有效执行和任务状态。",
          "缺少版本与状态条件",
          "local"
        ],
        [
          "旧结果覆盖新状态",
          3,
          0,
          "STALE OVERWRITE",
          "处理器无条件写入旧结果，把目标 v2 的业务状态覆盖为 v1 的结果。发送取消不能替代提交边界的检查。",
          "旧意图覆盖新意图",
          "data"
        ]
      ],
      "code": [
        "// Counterexample: arrival order is not goal order",
        "result = receiveAnyRunResult()",
        "storage.unconditionalWrite(result)",
        "// Missing goal, run, and state preconditions"
      ]
    }
  },
  {
    "group": 2,
    "id": "raft",
    "title": "Raft 与复制日志",
    "en": "CONSENSUS & REPLICATION",
    "summary": "通过任期、选举约束和日志复制规则，让副本对一串命令达成一致。",
    "nodes": [
      "客户端",
      "Leader · T4",
      "Follower B",
      "Follower C"
    ],
    "steps": [
      [
        "追加当前任期命令",
        0,
        1,
        "APPEND x",
        "Leader 在任期 4 接收命令，并将 index=12、term=4 的条目持久写入自己的日志；仅有这一份还不能提交。",
        "持久副本 = Leader",
        "request"
      ],
      [
        "复制到 B",
        1,
        2,
        "APPEND ENTRIES",
        "Leader 发送日志；B 校验前一条目的索引和任期，按规则修复冲突，并在成功应答前持久保存条目。",
        "持久副本 = Leader + B",
        "data"
      ],
      [
        "B 返回持久化确认",
        2,
        1,
        "ACK · QUORUM 2/3",
        "B 的成功应答让 Leader 知道当前任期条目已存于多数节点，因而可以推进 commitIndex；C 可以仍然落后。",
        "Leader 已知 index 12 达到多数",
        "data"
      ],
      [
        "按序应用并回复",
        1,
        0,
        "APPLY / RESULT",
        "Leader 按日志顺序应用已提交命令并向客户端回复。后续 AppendEntries 传播提交位置，使副本继续应用。",
        "index 12 已提交并应用",
        "data"
      ]
    ],
    "principle": "安全性来自多数交集、任期与日志规则的组合，不是“投票多就正确”。",
    "tradeoff": "多数派可用时才能推进提交；复制提升容错但增加网络与持久化延迟。",
    "pitfall": "复制到多数不能任意提交旧任期条目；线性一致读也需要额外的领导权与读协议。",
    "code": [
      "persistLeaderLog(currentTerm, command)",
      "replicateWithLogMatchingAndDurableAcks()",
      "if majorityStored(N) && log[N].term == currentTerm:",
      "  commitIndex = max(commitIndex, N)",
      "applyCommittedInOrder()",
      "replyAfterApplicationAsRequired()"
    ],
    "sources": [
      "raft"
    ],
    "related": [
      "consistency",
      "fencing",
      "messaging"
    ],
    "fault": {
      "name": "安全停止：复制前发生网络分区",
      "nodes": [
        "客户端",
        "孤立 Leader · T4",
        "Follower B",
        "Follower C"
      ],
      "steps": [
        [
          "仅 Leader 持久追加",
          0,
          1,
          "APPEND index 12",
          "任期 4 的 Leader 收到命令，把 index=12 存入本地；本分支的网络分区发生在任何 Follower 保存该条目前。",
          "index 12 仅有 1/3 份",
          "request"
        ],
        [
          "复制请求无法送达",
          1,
          2,
          "APPEND LOST",
          "Leader 到 B、C 的链路被切断。本次复制未在 Follower 上落盘，也没有成功 ACK。",
          "仍只有 1/3 · 无多数",
          "lost"
        ],
        [
          "不推进提交位置",
          1,
          1,
          "NO QUORUM",
          "Leader 不能仅凭本地追加宣称 index=12 已提交，也不能返回该命令的成功结果。",
          "commitIndex 不包含 index 12",
          "local"
        ],
        [
          "客户端收到未确认结果",
          1,
          0,
          "UNCONFIRMED",
          "本例旧 Leader 返回未确认/不可用状态；客户端不能把它解释为操作必然未执行，超时也不能提供这样的证明。B、C 可在满足选举约束后产生新 Leader。",
          "本次写入没有成功确认",
          "control"
        ]
      ],
      "code": [
        "persistLocal(currentTerm, command)",
        "attemptReplication()",
        "if !haveMajorityEvidence():",
        "  doNotAdvanceCommitIndex()",
        "  waitOrReturnUnconfirmed()",
        "// Never turn a timeout into successful commit"
      ]
    }
  },
  {
    "group": 2,
    "id": "consistency",
    "title": "线性一致性与读协议",
    "en": "CONSISTENCY MODELS",
    "summary": "定义并发操作看起来以什么顺序发生，以及读取允许有多旧。",
    "nodes": [
      "客户端 A",
      "主副本",
      "落后副本",
      "客户端 B"
    ],
    "steps": [
      [
        "写入成功响应已到达",
        1,
        0,
        "ACK x=2",
        "A 此前发出了 x=2 的写请求。主副本完成所需提交后向 A 返回成功；本步展示成功响应，且本例没有后续写入覆盖 x。",
        "写入已完成",
        "data"
      ],
      [
        "观察副本落后",
        2,
        2,
        "REPLICA x=1",
        "落后副本尚未应用这次更新。复制中的传输与应用延迟不会自行提供线性一致读。",
        "主 x=2 · 落后副本 x=1",
        "local"
      ],
      [
        "之后发起读取",
        3,
        1,
        "READ x",
        "B 在 A 收到写入成功之后才向主副本发起读；正确结果必须尊重这一实时先后。",
        "读必须包含已完成的写入",
        "request"
      ],
      [
        "读屏障后返回",
        1,
        3,
        "READ x=2",
        "本例用 Raft 读协议：确认当前任期提交与领导权，取得读位置并等状态机应用到该位置，然后返回 x=2。",
        "返回 x=2 · 满足本例的实时顺序",
        "data"
      ]
    ],
    "principle": "线性一致性把每个操作看作在调用与返回之间某一瞬间生效，并尊重实时先后。",
    "tradeoff": "允许陈旧读取可降低延迟、提高部分故障下的读可用性，但语义更弱。",
    "pitfall": "读到自己的写入只是较弱的会话保证。有 Raft 不代表任意副本可直接提供线性一致读；租约读还需要满足其明确的时间和时钟假设。",
    "code": [
      "// Reader starts after the writer received success",
      "ensureCommittedEntryInCurrentTerm()",
      "readIndex = confirmReadAuthorityWithQuorum()",
      "await lastApplied >= readIndex",
      "return state[x]"
    ],
    "sources": [
      "raft",
      "versioning"
    ],
    "related": [
      "raft",
      "sharding",
      "txn"
    ],
    "fault": {
      "name": "反例：完成写入后直接读落后副本",
      "nodes": [
        "客户端 A",
        "主副本",
        "落后副本",
        "客户端 B"
      ],
      "steps": [
        [
          "写入成功响应已到达",
          1,
          0,
          "ACK x=2",
          "A 此前发出了 x=2 的写请求。主副本完成所需提交后向 A 返回成功；本步展示成功响应，且本例没有后续写入覆盖 x。",
          "已完成的写入是 x=2",
          "data"
        ],
        [
          "副本尚未应用更新",
          2,
          2,
          "REPLICA x=1",
          "异步复制落后，副本仍保留旧值 x=1。",
          "落后副本 x=1",
          "local"
        ],
        [
          "后发读请求走到副本",
          3,
          2,
          "READ x",
          "B 在写入完成之后向这个落后副本发起读取；本反例没有执行领导权确认或所需读屏障。",
          "读的目标是落后副本",
          "request"
        ],
        [
          "返回旧值",
          2,
          3,
          "STALE x=1",
          "该副本直接返回 x=1，违反本例的线性一致性承诺。只有较弱、允许陈旧值的读契约才可能接受此结果。",
          "x=1 · 违反已声明的读语义",
          "data"
        ]
      ],
      "code": [
        "writeAndAwaitSuccess(x, 2)",
        "// Later, with no intervening write:",
        "return laggingReplica.localRead(x)",
        "// Counterexample: returns 1 without a read barrier"
      ]
    }
  },
  {
    "group": 2,
    "id": "sharding",
    "title": "分片与数据迁移",
    "en": "SHARDING & MIGRATION",
    "summary": "把不同键分给不同节点，并在迁移期间维护明确的所有权和路由版本。",
    "nodes": [
      "迁移控制器 / 路由",
      "旧分片 A",
      "新分片 B",
      "客户端"
    ],
    "steps": [
      [
        "查找当前所有者",
        3,
        0,
        "ROUTE key · epoch 5",
        "客户端读取当前配置，在 epoch=5 时由 A 服务这个键。配置版本须有明确作用域和比较规则。",
        "owner(key)=A · epoch=5",
        "request"
      ],
      [
        "复制并冻结切换点",
        1,
        2,
        "COPY · FREEZE · FINAL DELTA",
        "先复制快照并追赶更新，再通过协议持久冻结 A 的写入，传送冻结点之前的最终增量和所需去重状态；B 此时尚未服务该分片。",
        "A 已冻结 · B 具有完整切换状态",
        "data"
      ],
      [
        "启用 B 并发布新路由",
        0,
        2,
        "ACTIVATE epoch 6",
        "确认 A 已停止旧所有权写入、B 已安装切换状态后，启用 B 并发布 epoch=6 路由；失败恢复也必须遵守同一所有权协议。",
        "owner(key)=B · A 不再接受旧写入",
        "control"
      ],
      [
        "旧路由被拒绝",
        3,
        1,
        "STALE epoch 5",
        "持旧配置的客户端仍请求 A；A 在写入边界拒绝旧所有权请求，客户端刷新配置后再联系 B。",
        "旧请求未写入 · 客户端将刷新路由",
        "reject"
      ]
    ],
    "principle": "迁移要转移数据和所需去重状态，并在最终增量与新所有者启用之间建立写入边界；更新路由本身不能撤销旧节点的写入权。",
    "tradeoff": "更多分片增加扩展能力，也增加跨分片查询、事务和运维成本。",
    "pitfall": "把数据复制到新机器不等于完成迁移；切换期间的写入不能漏或双写失控。",
    "code": [
      "copySnapshotAndStreamChanges(A, B)",
      "barrier = freezeWritesDurably(A, nextEpoch)",
      "copyFinalChangesAndDedupStateThrough(barrier)",
      "installAndActivate(B, nextEpoch)",
      "publishRoute(B, nextEpoch)",
      "rejectOldOwnerWritesAndRefreshClients()"
    ],
    "sources": [
      "migration"
    ],
    "related": [
      "ordering",
      "fencing",
      "consistency"
    ],
    "fault": {
      "name": "反例：只改路由，未冻结旧分片",
      "nodes": [
        "只改路由的控制器",
        "仍接受写入的 A",
        "新分片 B",
        "持旧配置的客户端"
      ],
      "steps": [
        [
          "客户端缓存旧路由",
          3,
          0,
          "ROUTE epoch 5",
          "客户端得到 owner(key)=A 并缓存 epoch=5；本反例中的迁移协议没有旧所有者冻结或写入隔离步骤。",
          "客户端缓存 A / epoch 5",
          "request"
        ],
        [
          "复制当时的数据",
          1,
          2,
          "COPY x=1",
          "把 A 的快照复制到 B，此时两边都是 x=1；A 仍可以接收新的写入。",
          "A x=1 · B x=1",
          "data"
        ],
        [
          "只发布新配置",
          0,
          2,
          "ROUTE ONLY · epoch 6",
          "控制器把新路由指向 B 并启用 B，但没有停止 A 或传送之后发生的更新。",
          "B 被启用 · A 也仍可写",
          "control"
        ],
        [
          "旧客户端继续写 A",
          3,
          1,
          "STALE WRITE x=2",
          "旧客户端按 epoch=5 向 A 写 x=2，A 错误地接受；B 保持 x=1，新路由读不到这次已确认写入。",
          "A x=2 · B x=1 · 状态分叉",
          "request"
        ]
      ],
      "code": [
        "// Counterexample: copying + routing is insufficient",
        "copySnapshot(A, B)",
        "publishRouteAndActivate(B, epoch + 1)",
        "// A was never frozen or fenced",
        "A.acceptWrite(staleEpoch, x = 2)"
      ]
    }
  },
  {
    "group": 2,
    "id": "fencing",
    "title": "租约与隔离令牌",
    "en": "LEASES & FENCING TOKENS",
    "summary": "租约决定谁应当工作；资源端的单调令牌检查阻止旧令牌覆盖已接受的新令牌写入。",
    "nodes": [
      "旧 Worker · token 7",
      "租约服务",
      "新 Worker · token 8",
      "目标存储"
    ],
    "steps": [
      [
        "授予租约与令牌",
        1,
        0,
        "TOKEN 7",
        "W1 得到针对同一受保护资源的租约和单调令牌 7。令牌须来自可信的授予协议。",
        "当前租约持有者 W1",
        "control"
      ],
      [
        "过期后重新授予",
        1,
        2,
        "TOKEN 8",
        "W1 暂停超过租约期限，W2 获得更大的令牌 8；旧进程及其在途请求可能仍存在。",
        "当前租约持有者 W2",
        "control"
      ],
      [
        "资源接受新令牌",
        2,
        3,
        "WRITE token 8",
        "目标资源把令牌比较、最高令牌更新和业务写入放在同一原子边界，接受 8 后记录 maxToken=8。",
        "目标资源 maxToken=8",
        "data"
      ],
      [
        "拒绝旧令牌写入",
        0,
        3,
        "WRITE 7 · REJECT",
        "W1 恢复并携带 7 写入；目标资源发现 7<8，拒绝这次请求，旧写入不能覆盖已经接受的 8。",
        "旧请求被拒绝 · 新结果保留",
        "reject"
      ]
    ],
    "principle": "真正接收副作用的资源必须原子校验并持久保存隔离令牌。比较最高已见令牌可以阻止更旧持有者覆盖已接受的新持有者写入。",
    "tradeoff": "租约便于故障后接管；实际隔离保证取决于存储支持和副作用边界。",
    "pitfall": "资源尚未见到 8 时，最高令牌比较不等于知道 7 的租约已到期。允许相同令牌多次写入也不提供操作去重或同一持有者内部的顺序保证。",
    "code": [
      "token = acquireMonotonicToken(resource)",
      "resource.atomicWrite(token, value):",
      "  require token >= highestSeen",
      "  highestSeen = max(highestSeen, token)",
      "  persistTokenAndValueTogether()",
      "// Same-token ordering/dedup needs its own protocol"
    ],
    "sources": [
      "chubby",
      "dist"
    ],
    "related": [
      "ordering",
      "invariants",
      "raft"
    ],
    "fault": {
      "name": "反例：目标存储完全不校验令牌",
      "nodes": [
        "旧 Worker · token 7",
        "租约服务",
        "新 Worker · token 8",
        "未实现隔离的存储"
      ],
      "steps": [
        [
          "W1 获得租约",
          1,
          0,
          "TOKEN 7",
          "W1 得到 token=7；本反例的目标存储从一开始就没有令牌校验与原子隔离逻辑。",
          "有租约 · 资源侧无隔离",
          "control"
        ],
        [
          "W2 在到期后接管",
          1,
          2,
          "TOKEN 8",
          "W1 长时间暂停，租约服务让 W2 取得 token=8；租约服务无法自行停止 W1 的进程或撤销在途请求。",
          "当前租约持有者 W2",
          "control"
        ],
        [
          "W2 写入新结果",
          2,
          3,
          "WRITE newValue",
          "W2 把新结果写入存储。该存储接受写入，但没有保存并约束 maxToken。",
          "存储 = newValue",
          "data"
        ],
        [
          "W1 的旧写入覆盖",
          0,
          3,
          "STALE WRITE",
          "W1 恢复后发来的旧结果被同一个未实施隔离的写入接口接受，覆盖新结果。",
          "旧结果覆盖新结果",
          "data"
        ]
      ],
      "code": [
        "// Counterexample: lease status is not enforced here",
        "token = acquireLeaseToken()",
        "resource.write(value)",
        "// Resource ignores token and permits old writers"
      ]
    }
  },
  {
    "group": 2,
    "id": "outbox",
    "title": "跨系统原子性与 Outbox",
    "en": "TRANSACTIONAL OUTBOX",
    "summary": "把业务修改与待发消息放进同一个本地事务，再可靠地转发。",
    "nodes": [
      "业务事务",
      "数据库 + Outbox",
      "消息转发器",
      "消息系统"
    ],
    "steps": [
      [
        "提交业务与发送意图",
        0,
        1,
        "BUSINESS + EVENT E",
        "在同一个数据库事务中更新业务状态并插入带稳定 eventId 的 E；事务提交后，两者一起持久化。",
        "业务状态与事件 E 一起提交",
        "data"
      ],
      [
        "读取已提交事件",
        1,
        2,
        "READ OUTBOX E",
        "转发器扫描或订阅已提交的 Outbox，取得尚未确认发送的 E。未提交或已回滚的事件不能发出。",
        "事件 E 待发送",
        "data"
      ],
      [
        "发布并等待确认",
        2,
        3,
        "PUBLISH E",
        "转发器用同一 eventId 发布 E，并等待消息系统按约定持久化语义给出成功确认；发送到 socket 本身不够。",
        "E 已被消息系统确认接收",
        "data"
      ],
      [
        "记录发送进度",
        2,
        1,
        "MARK SENT E",
        "只有确认成功后才记录或清理 Outbox。下游处理另按 eventId 原子去重，发布完成不等于整个跨系统业务已完成。",
        "已记录发送进度 · 下游另行消费",
        "control"
      ]
    ],
    "principle": "Outbox 原子化的是本地业务数据与发送意图，不是整个跨系统业务瞬时完成。",
    "tradeoff": "2PC 协调跨参与者提交但增加耦合与故障处理；补偿流程需要定义可补偿的业务语义。",
    "pitfall": "补偿不是时间倒流；已经发送的邮件或不可逆副作用未必能完全撤销。",
    "code": [
      "transaction:",
      "  updateBusinessState()",
      "  insertOutbox(stableEventId, payload)",
      "event = readCommittedPendingOutbox()",
      "publishAndAwaitBrokerConfirmation(event)",
      "markSent(event.id)",
      "// Consumer commits dedup + business effect together"
    ],
    "sources": [
      "outbox_doc",
      "acks"
    ],
    "related": [
      "txn",
      "messaging",
      "idempotency"
    ],
    "fault": {
      "name": "安全重放：发布后、记录进度前崩溃",
      "nodes": [
        "业务事务",
        "数据库 + Outbox",
        "消息转发器",
        "消息系统"
      ],
      "steps": [
        [
          "业务和事件一起提交",
          0,
          1,
          "COMMIT E",
          "本地事务成功提交业务状态与稳定 ID 的事件 E；Outbox 中 E 仍标为待发送。",
          "本地业务与发送意图都已持久化",
          "data"
        ],
        [
          "发布事件 E",
          2,
          3,
          "PUBLISH E",
          "转发器读取已提交的待发事件并发布；消息系统已持久接收并确认 E。",
          "E 已发布 · Outbox 仍待发送",
          "data"
        ],
        [
          "写进度前崩溃",
          2,
          2,
          "CRASH BEFORE MARK",
          "转发器在记录发送成功前崩溃。数据库中的发送意图仍在，重启后无法仅凭待发标记断定消息从未发布。",
          "发送进度未保存 · 结果存在歧义",
          "local"
        ],
        [
          "重启后重复发布",
          2,
          3,
          "REPUBLISH SAME E",
          "恢复后的转发器重读待发记录，用相同 eventId 再次发布 E；下游通过原子去重避免重复业务效果。",
          "消息可能重复 · 发送意图未丢失",
          "data"
        ]
      ],
      "code": [
        "commitBusinessAndOutboxAtomically(E)",
        "publishAndAwaitBrokerConfirmation(E)",
        "crashBeforeMarkSent()",
        "// Restart reads the same pending E:",
        "republish(E.sameEventId)",
        "consumeWithAtomicDedup(E.sameEventId)"
      ]
    }
  },
  {
    "group": 2,
    "id": "security",
    "title": "身份、权限与故障隔离",
    "en": "TRUST & RESOURCE BOUNDARIES",
    "summary": "识别调用者，并在真正执行操作的边界核对权限与资源预算。",
    "nodes": [
      "调用者",
      "认证入口",
      "授权与预算",
      "目标资源"
    ],
    "steps": [
      [
        "验证调用身份",
        0,
        1,
        "AUTHENTICATE",
        "入口验证凭证及其有效期，建立可信主体；客户端自报的用户或租户字段不能直接当作认证结果。",
        "已验证主体 user:A",
        "request"
      ],
      [
        "检查具体权限",
        1,
        2,
        "AUTHORIZE",
        "把可信主体、请求操作和真实目标对象交给授权逻辑；根据策略核对租户、对象和动作，默认拒绝未获授权的请求。",
        "检查 principal + action + resource",
        "check"
      ],
      [
        "执行前落实约束",
        2,
        3,
        "ADMIT",
        "本请求授权通过且满足预算。目标执行边界落实授权结果与参数检查，并按限流、配额等策略约束资源使用。",
        "已授权 · 资源预算允许",
        "control"
      ],
      [
        "执行并返回结果",
        3,
        0,
        "RESULT / AUDIT",
        "资源执行被允许的操作，向调用者返回结果；服务端另记录必要审计信息，并避免把凭证等秘密写入日志。",
        "操作成功 · 已记录审计",
        "data"
      ]
    ],
    "principle": "认证回答“你是谁”，授权回答“你能对这个资源做什么”。",
    "tradeoff": "更细的权限与隔离降低故障影响面，也增加策略、运维与资源成本。",
    "pitfall": "登录成功不代表有权访问所有对象；前端隐藏按钮不是服务端授权。",
    "code": [
      "principal = authenticate(credential)",
      "require authorize(principal, action, resource)",
      "require withinTenantBudget(principal)",
      "result = executeWithBoundaryChecks()",
      "auditWithoutSecrets(principal, action, resource)",
      "return result"
    ],
    "sources": [
      "authz",
      "systems"
    ],
    "related": [
      "backpressure",
      "fencing",
      "observability"
    ],
    "fault": {
      "name": "安全拒绝：身份有效，但对象未获授权",
      "nodes": [
        "租户 A 的调用者",
        "认证入口",
        "授权检查",
        "租户 B 的目标资源"
      ],
      "steps": [
        [
          "认证确实成功",
          0,
          1,
          "AUTHENTICATE",
          "调用者提供有效凭证，身份为租户 A 的普通用户；该用户没有跨租户访问权限。",
          "身份有效 · 权限仍待判断",
          "request"
        ],
        [
          "请求访问 B 的对象",
          1,
          2,
          "READ object:B",
          "授权逻辑收到可信主体及目标对象，发现请求指向租户 B；对象归属取自服务端可信状态。",
          "待检查具体对象权限",
          "check"
        ],
        [
          "授权策略拒绝",
          2,
          2,
          "DENY",
          "本请求不满足对象级授权策略。系统在执行前拒绝它，不访问受保护内容，也不因已登录而放行。",
          "未授权 · 目标资源未执行",
          "local"
        ],
        [
          "返回拒绝并审计",
          2,
          0,
          "FORBIDDEN",
          "向调用者返回按服务策略定义的拒绝结果，并记录必要安全审计；没有把请求继续发给目标资源。",
          "拒绝完成 · 无越权效果",
          "control"
        ]
      ],
      "code": [
        "principal = authenticate(validCredential)",
        "if !authorize(principal, READ, objectB):",
        "  auditDeniedWithoutSecrets()",
        "  return FORBIDDEN",
        "// Resource execution is never reached"
      ]
    }
  },
  {
    "group": 2,
    "id": "observability",
    "title": "可观测性与进度检查",
    "en": "OBSERVABILITY & PROGRESS",
    "summary": "从日志、指标和追踪还原行为，并确认业务状态持续向目标推进。",
    "nodes": [
      "任务执行器",
      "日志 / 指标",
      "任务状态 / 追踪",
      "恢复控制器"
    ],
    "steps": [
      [
        "记录关联身份",
        0,
        1,
        "TASK / RUN / VERSION",
        "执行器记录 taskId、runId 和目标版本，连接跨进程事件，区分一次逻辑任务与不同执行尝试。",
        "执行记录可以关联",
        "data"
      ],
      [
        "汇总用户与业务指标",
        1,
        2,
        "RATE / ERROR / AGE",
        "监测吞吐、错误、延迟和队列年龄，并结合任务阶段与完成数量判断实际业务状态。",
        "系统指标与业务状态可对照",
        "data"
      ],
      [
        "向控制器报告进展停滞",
        2,
        3,
        "NO PROGRESS",
        "超过约定期限没有阶段推进；监测把这一事实和上下文交给控制器，不能仅凭心跳认定业务正常。",
        "阶段超过期限未推进",
        "control"
      ],
      [
        "在提交约束下恢复",
        3,
        0,
        "GUARDED RECOVERY",
        "控制器先建立新执行的有效身份与资源侧隔离条件，再在预算内重试、接管或告警，并继续确认业务是否推进。",
        "恢复受控 · 仍需验证业务进展",
        "control"
      ]
    ],
    "principle": "可观测性让系统行为可解释；恢复协议决定干预是否安全。",
    "tradeoff": "更细粒度观测消耗存储与性能，采样与保留策略应保留排障所需关联信息。",
    "pitfall": "Watchdog 发现卡住不代表可以随意再启动一个执行者；要先约束重复和旧写入。",
    "code": [
      "observe(taskId, runId, version)",
      "if noProgressWithin(progressBudget):",
      "  establishNewRunAndCommitFence()",
      "  recoverWithinRetryBudgetOrAlert()",
      "verifyBusinessProgressResumes()"
    ],
    "sources": [
      "health",
      "systems"
    ],
    "related": [
      "invariants",
      "fencing",
      "measure"
    ],
    "fault": {
      "name": "安全检测：心跳正常但任务没有进展",
      "nodes": [
        "仍发心跳的执行器",
        "日志 / 心跳指标",
        "任务状态 / 追踪",
        "恢复控制器"
      ],
      "steps": [
        [
          "心跳持续到达",
          0,
          1,
          "HEARTBEAT OK",
          "执行器的心跳线程仍能发送信号，这只能证明该路径当时还在运行。",
          "组件可报告存活",
          "data"
        ],
        [
          "任务状态长期不变",
          2,
          2,
          "PROGRESS AGE EXCEEDED",
          "权威任务状态显示阶段、完成数量和最后进展时间长期不变，超过当前任务的进展预算。",
          "任务仍未推进",
          "local"
        ],
        [
          "报告停滞与证据",
          2,
          3,
          "STALLED",
          "监测把任务身份、阻塞阶段和进展年龄交给恢复控制器；健康心跳不能覆盖这些业务证据。",
          "已识别心跳与进展不一致",
          "control"
        ],
        [
          "先诊断并约束接管",
          3,
          3,
          "RECOVERY GATE",
          "控制器检查依赖与所有权；只有建立幂等、有效执行版本和资源侧隔离后才接管，否则保留告警和诊断，不能直接再起一个无约束执行者。",
          "停滞已发现 · 尚不宣称恢复成功",
          "local"
        ]
      ],
      "code": [
        "heartbeat = recentHeartbeat()",
        "progress = inspectTaskProgress(taskId)",
        "if progress.age > progressBudget:",
        "  alertWithTaskAndRunContext()",
        "  recoverOnlyAfterCommitFenceAndDedup()",
        "  verifyActualProgress()"
      ]
    }
  }
];
