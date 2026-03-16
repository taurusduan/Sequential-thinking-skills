# ADR-002: Sequential Thinking CLI v1 运行协议与动作边界

- **状态**: Accepted
- **日期**: 2026-03-16
- **影响范围**: Protocol Definition, Runtime Engine, CLI Shell, Replay Export

## 背景

`sequential-thinking` 当前最大问题不是缺少示例，而是缺少运行协议。AI 容易把 JSON 当成输出建议，而不是执行约束。为解决这个问题，v1 必须明确对外动作、默认行为和删除项，避免工具继续退化成“提示词包装器”。

## 决策

v1 的主路径动作只保留以下三个：

- `start`
- `step`
- `replay`

并采用以下默认行为：

- 会话自动保存
- 步数驱动的收敛提醒自动生效
- 每一步都注入 `name`、`goal`、`mode` 与当前阶段提示
- 完成后自动产出 `replay.md` 与 `final.md`
- `replay` 支持导出到当前文件夹

以下动作不进入 v1 主路径：

- `resume`
- 复杂会话管理命令
- 多余 flags
- 无限分支控制

以下能力降级为延后评估项，不纳入 v1 核心实现：

- `snapshot`
- `diff`

## 输入契约

### start

只接受：

- `name`
- `goal`
- `mode`
- `totalSteps`

约束：

- `mode` 仅允许 `explore`、`branch`、`audit`
- `totalSteps` 仅允许 `5` 或 `8`

### step

只接受：

- `content`

其余上下文由 runtime 从当前会话状态自动补全。

### replay

接受：

- `name`
- 可选导出目标，默认可保存到当前文件夹

## 模式决策

### explore

职责是拆问题、找变量、识别主矛盾，并在后半段收敛到结论与建议。

### branch

职责是比较有限路径。v1 不支持任意分支树，只允许围绕两个主要候选路径做比较与推荐。

### audit

职责是审查已有判断，识别漏洞、证据不足和隐含假设，最终给出修正建议。

## 收敛决策

- 当 `totalSteps = 5` 时，Step 4 提醒收敛，Step 5 必须收敛
- 当 `totalSteps = 8` 时，Step 6 开始提醒收敛，Step 8 必须收敛

runtime 不依赖模型自行记忆这些规则，而是在每一步主动注入。

## 存储决策

默认运行目录下写入：

```text
.anws/runtime/sequential-thinking/[session-name]/
```

会话目录命名采用以下冲突策略：

- 先将 `name` 规范化为可用目录名
- 若目录不存在，直接使用
- 若目录已存在，则追加递增序号（如 `session-name-2`, `session-name-3`）
- `replay` 导出到当前目录时遵循同样的冲突避免规则，不覆盖已有文件

每次 `step` 都更新：

- `session.json`
- `steps/{NN}.json`

会话完成后生成：

- `replay.md`
- `final.md`

当调用 `replay` 导出时，可生成：

- `./[session-name]-replay.md`

当项目中不存在 `AGENTS.md` 时，后续执行阶段必须以 `.anws/v1/05_TASKS.md` 作为唯一任务源，不再依赖 AGENTS 导航区块承接上下文。

## 备选方案

### 方案 A：保留 `resume`

**放弃原因**:
- 更像人类命令行思维，不是 AI-first 设计
- 容易拉高会话管理复杂度

### 方案 B：保留 `snapshot` / `diff` 作为主能力

**放弃原因**:
- 与当前核心目标不一致
- 先把 `start`、`step`、`replay` 跑通更重要

## 后果

### 正面

- 协议边界非常清晰
- CLI 易于实现
- 用户与 AI 的心智模型简单
- 能先尽快做出可用版本

### 负面

- 一些高级分析能力需要后续版本再引入
- 若未来需求增加，需要通过新版本演进，而不是在 v1 内横向膨胀

## 结论

v1 是一个以 `start`、`step`、`replay` 为核心动作的 AI-first 极简运行协议。其价值在于稳定推进和收敛，而不是功能齐全。
