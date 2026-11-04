# 指标、日志与事件 · 围绕容器实例收集证据
# 前提：POD 替换为发生过重启的实际 Pod；多容器 Pod 应增加 -c 指定容器。
# 预期：对齐时间戳与退出时间；previous 不是永久历史日志存储。
POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo logs "$POD" --tail=100 --timestamps
kubectl -n demo logs "$POD" --previous --tail=100 --timestamps
