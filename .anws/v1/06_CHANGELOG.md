# 变更日志 - .anws v1

> 此文件记录本版本迭代过程中的微调变更（由 /change 处理）。新增功能/任务需创建新版本（由 /genesis 处理）。

## 格式说明
- **[CHANGE]** 微调已有任务（由 /change 处理）
- **[FIX]** 修复问题
- **[REMOVE]** 移除内容

---

## 2026-03-16 - 初始化
- [ADD] 创建 `.anws/v1` 版本
- [ADD] 建立 `sequential-thinking` 协议 + CLI 骨架改造的 PRD 初稿
- [ADD] 建立系统架构总览初稿
- [ADD] 明确初版采用极简 AI-first 运行器方向
- [REMOVE] 从主路径中移除 `resume` 设计
- [CHANGE] 将 `snapshot` / `diff` 降级为可选附加能力
- [CHANGE] 将 `replay + 保存到当前文件夹` 提升为主能力候选
- [ADD] 新增 `ADR-001`，确定 v1 技术栈与工程实现基础
- [ADD] 新增 `ADR-002`，确定 `start` / `step` / `replay` 为主路径动作
- [CHANGE] 将 PRD 中的未决项正式收敛为 v1 已决策边界
- [CHANGE] 补强架构总览中的工程结构与实现边界
- [CHANGE] 在 PRD 中补正式 `REQ-001` ~ `REQ-007` 与 `US-001` ~ `US-004`，建立原生追溯锚点
- [FIX] 修正 `05_TASKS.md` 中 `T2.3.1` 的输入来源，消除未来产物依赖矛盾
- [CHANGE] 在 ADR 与架构总览中补充会话重名冲突策略
- [CHANGE] 明确无 `AGENTS.md` 时，后续执行阶段以 `.anws/v1/05_TASKS.md` 为唯一任务源
