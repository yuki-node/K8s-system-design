# NetworkPolicy 网络隔离 · 检查两端的策略范围
# 前提：demo 中存在待查策略；此命令只读定义，实际验证需从双方相关 Pod 发起连接。
# 预期：不能仅凭策略存在判定有效；结合 CNI 能力与实际连接测试确认。
kubectl -n demo get networkpolicy
kubectl -n demo describe networkpolicy
kubectl -n demo get pods --show-labels
kubectl get namespaces --show-labels
