# 节点维护与 PDB · 检查 PDB 阻塞证据
# 前提：应用存在 PDB 时使用；本示例不绕过预算，不执行删除。
# 预期：核对 selector 是否确实匹配目标 Pod，以及预算、健康副本和可调度余量。
kubectl -n demo get pdb
kubectl -n demo describe pdb
kubectl -n demo get deployment web
kubectl -n demo get pods -l app=web -o wide
