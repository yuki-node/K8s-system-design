# PV、PVC 与动态存储 · 检查存储绑定与消费方
# 前提：已应用 storage.yaml；StorageClass 和 PV 为集群作用域资源。
# 预期：WaitForFirstConsumer 提示可能是正常阶段；FailedMount 与 ProvisioningFailed 指向不同环节。
kubectl -n demo describe pvc data-demo
kubectl get storageclass -o yaml
kubectl -n demo describe pod volume-reader
kubectl get pv
