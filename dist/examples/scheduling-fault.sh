# 调度与节点约束 · 对照节点选择条件
# 前提：POD 为待调度的真实 Pod；这里只观察标签，不更改节点能力声明。
# 预期：节点查询为空且事件提示选择器不匹配时，资源扩容本身未必解决问题。
POD=replace-me
kubectl -n demo get pod "$POD" -o yaml
kubectl get nodes -l disk=ultra
kubectl -n demo describe pod "$POD"
