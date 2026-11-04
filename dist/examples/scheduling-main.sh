# 调度与节点约束 · 读取 FailedScheduling 证据
# 前提：将 POD 替换为实际待调度 Pod；节点详情可能包含集群运维信息，仅在自己实验集群查看。
# 预期：Events 说明资源不足、选择器不匹配或污点等原因；Allocated resources 可与实时使用率对照。
POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl get nodes --show-labels
kubectl describe nodes
