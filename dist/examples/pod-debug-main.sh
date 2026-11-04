# Pod 故障定位 · 最小 Pod 排障顺序
# 前提：POD 替换为真实名称，先确认 current-context 指向实验集群；多容器可按需指定 -c。
# 预期：前三条明确对象与阶段；logs 若报告容器未启动，不应把它视为日志采集系统故障。
POD=replace-me
kubectl config current-context
kubectl -n demo get pod "$POD" -o wide
kubectl -n demo describe pod "$POD"
kubectl -n demo logs "$POD" --tail=100
