# HPA 自动扩缩容 · 检查 HPA 输入
# 前提：已有 demo/web HPA；top 在缺少资源指标时会失败，这正是需定位的证据。
# 预期：分别检查 APIService 可用性、指标输出、CPU requests 与 HPA 事件。
kubectl -n demo describe hpa web
kubectl -n demo top pods
kubectl get apiservice v1beta1.metrics.k8s.io
kubectl -n demo get deployment web -o yaml
