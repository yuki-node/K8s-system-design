# 集群架构与组件 · 定位镜像问题
# 前提：将 POD 替换为 demo 中真实的异常 Pod 名；不通过删除 Pod 掩盖首次失败证据。
# 预期：查看 Events 中 Failed、BackOff 的具体原因；没有运行过的容器通常没有应用日志。
POD=replace-me
kubectl -n demo get pod "$POD" -o wide
kubectl -n demo describe pod "$POD"
