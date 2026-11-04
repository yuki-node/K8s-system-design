# 备份、恢复与升级 · 升级前盘点版本
# 前提：只读盘点；不执行升级或恢复。自管 kubeadm、其他发行版和托管服务的后续流程不同。
# 预期：记录组件与驱动版本并查对应升级文档；版本偏差不能简单假设为“相差一版都可以”。
kubectl version -o yaml
kubectl get nodes -o wide
kubectl get apiservices
kubectl -n kube-system get pods -o wide
kubectl get storageclasses
