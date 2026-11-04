# 启动、就绪与存活探针 · 验证就绪与重启分离
# 前提：POD 替换为 Service web 选中的异常 Pod；观察输出而非预设一定是探针问题。
# 预期：对照 Ready、Restart Count 与端点 ready；Running/NotReady 可以同时存在。
POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo get endpointslices -l kubernetes.io/service-name=web -o yaml
kubectl -n demo get pod "$POD" -o wide
