---
name: sequential-thinking
description: 当复杂问题需要系统性逐步推理时使用。适用于多阶段分析、设计规划、问题分解，或初始范围不明确且需要受控收敛的任务。
license: MIT
---

# Sequential Thinking

这个 skill 的核心不是“多写几段 thought”，而是让 AI 在复杂问题里**以受控节奏推进，并在有限步数内形成结论**。CLI 只是执行载体，skill 本身负责定义何时该进入这种思考方式、为何必须收敛，以及如何避免把顺序思考退化成松散输出。

## Mission

这个 skill 用来把复杂问题处理成一个**有边界的推理过程**：

- 先明确目标与模式
- 再按固定步数推进
- 在后半程强制收敛
- 最后保留可回放的推理轨迹

它解决的不是“不会想”，而是“想得太散、太随意、太难复核”。

## When to Use

在以下场景调用：

- 问题需要多个相互关联的推理步骤
- 初始范围或方法不明确，需要先拆问题再收敛
- 需要在有限候选方案之间做比较，而不是无限发散
- 需要审查已有判断、识别漏洞、证据不足与隐含假设
- 需要留下可回放、可导出的推理轨迹

**不适用场景**：

- 简单事实查询
- 单步即可完成的任务
- 路径已经非常明确、无需多步推演的问题
- 纯头脑风暴且暂时不要求收敛的场景

## Core Principles

> [!IMPORTANT]
> 你**必须**把 sequential-thinking 视为“受控收敛协议”，而不是“格式化输出技巧”。
>
> **为什么？** 如果只把它当作写作模板，AI 会很快回到自由发散、重复上下文、迟迟不下结论的旧模式。
>
> **自检示例**：如果你已经在连续补充背景、重复问题定义，却没有形成明确阶段推进与收敛压力，说明你没有真正使用这个 skill。

- **先定边界，再推进**：先定义 `goal`、`mode`、`totalSteps`，再开始思考
- **每一步只做一步的事**：当前步只表达当前推进，不重复整套系统上下文
- **后半程必须收敛**：5 步或 8 步都不是建议值，而是节奏边界
- **最终必须留下结论**：不能把“还可以继续想”当作默认出口
- **轨迹必须可复核**：需要时可生成 replay，供后续审阅与复用

## Modes

- **`explore`**: 拆问题、识别变量、找主矛盾，后半程必须收敛到结论与建议
- **`branch`**: 在有限候选路径之间做比较，最终必须推荐一个方向或明确排序
- **`audit`**: 审查既有判断、识别漏洞、证据不足和隐含假设，最终必须给出修正建议

## Convergence Rhythm

- 当 `totalSteps = 5`
  - Step 1-3：正常推进
  - Step 4：开始收敛
  - Step 5：必须收敛
- 当 `totalSteps = 8`
  - Step 1-5：正常推进
  - Step 6-7：开始收敛
  - Step 8：必须收敛

## Installation & Runtime Model

这个 skill 面向 agent 交付思想与调用约束；CLI 通过 npm 分发。

在使用前，应先确保本地已安装对应 CLI：

```bash
pnpm add -g sequential-thinking-skills
```

安装后，使用 `sthink` 作为命令入口。

## CLI Contract

本 skill 不再要求 AI 手写 thought JSON。执行层应通过 CLI 主路径动作完成：

- `start`
- `step`
- `replay`

### `start`

只接受四个输入：

- `name`
- `goal`
- `mode`
- `totalSteps`

约束：

- `mode` 仅允许 `explore`、`branch`、`audit`
- `totalSteps` 仅允许 `5` 或 `8`

### `step`

只接受：

- `content`

其余上下文应由 runtime 自动恢复并注入。

### `replay`

用于读取已完成会话并生成 replay 文档；如需要，可额外导出到当前目录。

## Recommended Workflow

```text
1. 先判断问题是否真的需要 sequential-thinking，而不是默认套用。
2. 如需要，先安装或确认本地已有 npm CLI。
3. 用 `sthink start` 显式给出 `name`、`goal`、`mode`、`totalSteps`。
4. 用 `sthink step` 逐步推进，每一步只写当前推进内容。
5. 到收敛阶段时，必须输出结论、风险与下一步建议。
6. 完成后按需使用 `sthink replay` 生成与导出回放文档。
```

## Example Flow

```bash
sthink start --name "protocol-review" --goal "澄清 runtime 协议边界" --mode explore --totalSteps 5
sthink step --sessionPath "<session-path>" --content "先拆解协议边界、输入约束和默认行为。"
sthink step --sessionPath "<session-path>" --content "继续识别最容易漂移的能力边界。"
sthink step --sessionPath "<session-path>" --content "整理核心能力与非目标。"
sthink step --sessionPath "<session-path>" --content "开始收敛到 v1 必做与延后项。"
sthink step --sessionPath "<session-path>" --content "输出最终结论、风险和下一步建议。"
sthink replay --sessionPath "<session-path>"
```

## Storage & Export Boundary

> [!IMPORTANT]
> 这个 skill 关注的是思考协议与调用方式，不应把某个仓库内的临时目录结构误写成产品承诺。
>
> **为什么？** 运行时默认状态目录属于 CLI 实现边界，后续可能迁移到更合适的用户级目录；skill 文档不应在这一层提前锁死。

- runtime 会自动保存会话状态与步骤记录
- 完成态可生成 replay 文档
- `replay` 支持导出到当前目录，便于审阅与复用

## Heuristic Reminders

以下提醒仍然有效，但现在由 `mode` 与 runtime 节奏承载，而不是靠手写 JSON 自我约束。

- **问题定义提醒**: 你现在是在描述现象，还是在定位根因？
- **证据提醒**: 当前判断基于事实、观察结果，还是基于猜测与假设？
- **边界提醒**: 当前问题影响的是局部模块、单系统，还是跨系统结构？
- **复杂度提醒**: 你是在消除本质复杂度，还是在增加偶然复杂度？
- **收敛提醒**: 当前是否已经足够形成结论，还是仍在无效发散？

## Tips

- 不要再手写 thought JSON；让 CLI runtime 负责节奏、落盘与收敛约束
- 不要把 sequential-thinking 当成默认模式，只在真正需要多步收敛时调用
- `start` 时就选对 `mode` 与 `totalSteps`，避免运行中漂移任务性质
- `step` 的 `content` 只表达当前推进内容，不要重复补全系统上下文
- 到收敛阶段时，应明确输出结论、风险和下一步动作
- 只有已完成会话才能执行 `replay`

