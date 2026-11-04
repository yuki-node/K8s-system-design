# Pod 故障定位 · 检查配置引用而不输出机密
# 前提：POD 为异常 Pod；Secret 仅查看对象列表，不打印真实值。
# 预期：描述中的错误可指出缺失对象或键；不要把 Secret 内容复制到工单或日志。
POD=replace-me
kubectl -n demo describe pod "$POD"
kubectl -n demo get configmaps
kubectl -n demo get secrets
