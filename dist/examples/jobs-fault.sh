# Job 与 CronJob · 查看失败与重试实例
# 前提：已存在 Job；将 clock-once 换成需要调查的 Job。成功的示例可能只有一个 Pod。
# 预期：按 Job 标签找关联 Pod；需要时分别读取每个 Pod 日志，单份日志不代表所有尝试。
kubectl -n demo describe job clock-once
kubectl -n demo get pods -l batch.kubernetes.io/job-name=clock-once
kubectl -n demo logs job/clock-once --tail=100
