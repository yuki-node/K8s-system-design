# Pod 安全与准入 · 查找实际拒绝位置
# 前提：已有 demo/web；安全标签可能未设置，本命令不会改动策略。
# 预期：FailedCreate 的具体 message 可显示准入原因；Deployment 创建成功不能排除这种错误。
kubectl get namespace demo --show-labels
kubectl -n demo describe replicasets
kubectl -n demo get events --sort-by=.metadata.creationTimestamp
