# 指标、日志与事件 · 收集入门实验的基本证据
# 前提：demo/web 已部署；top 需要资源指标 API，logs 只包含能访问到的容器输出。
# 预期：事件说明资源操作，日志说明应用输出，top 提供短期资源样本；它们互不替代。
kubectl -n demo get deployment,pods,service
kubectl -n demo get events --sort-by=.metadata.creationTimestamp
kubectl -n demo logs deployment/web --all-containers=true --tail=100
kubectl -n demo top pods
