# Deployment 与滚动发布 · 检查发布卡在哪个修订
# 前提：已存在 demo/web；命令均为观察，不执行回滚。
# 预期：超时只是观察窗口结束；结合 conditions、事件和 revision 确认发布状态。
kubectl -n demo rollout status deployment/web --timeout=30s
kubectl -n demo rollout history deployment/web
kubectl -n demo describe deployment web
kubectl -n demo get pods -l app=web -o wide
