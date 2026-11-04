# 节点维护与 PDB · 维护前的只读检查
# 前提：具备节点与 PDB 读取权限；NODE 替换为计划维护的节点。此示例不实际排空节点。
# 预期：先识别 DaemonSet、裸 Pod、卷和预算；真正维护命令应在明确节点与业务窗口后执行。
NODE=replace-me
kubectl get node "$NODE" -o wide
kubectl get pods -A --field-selector spec.nodeName="$NODE" -o wide
kubectl get pdb -A
kubectl describe node "$NODE"
