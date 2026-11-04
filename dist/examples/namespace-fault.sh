# Namespace 与配额 · 确认查询范围
# 前提：只读命令；-A 的可见性受当前身份权限限制，不输出 kubeconfig 凭据。
# 预期：对比资源的 NAMESPACE 列，识别集群级与命名空间级资源。
kubectl config current-context
kubectl get deployments -A
kubectl -n demo get deployment web
kubectl api-resources --namespaced=false
