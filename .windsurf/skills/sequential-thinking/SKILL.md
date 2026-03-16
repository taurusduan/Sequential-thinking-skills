---
name: sequential-thinking
description: 当复杂问题需要系统性逐步推理时使用。适用于多阶段分析、设计规划、问题分解，或初始范围不明确且需要受控收敛的任务。
license: MIT
---

# Sequential Thinking

通过受控的 `start / step / replay` 协议，帮助 AI 在复杂问题中稳定推进、自动保存并按节奏收敛。

## Core Capabilities

- **受控启动**: 用 `start` 明确会话名称、目标、模式与总步数
- **阶段引导**: 每次 `step` 都自动注入模式提示与收敛压力
- **自动保存**: 每一步自动写入 `session.json` 与 `steps/{NN}.json`
- **收敛控制**: 5 步/8 步会话在后半程自动进入收敛节奏
- **回放导出**: 已完成会话可生成 `replay.md` 并导出到当前目录

## When to Use

在以下场景使用：
- 问题需要多个相互关联的推理步骤
- 初始范围或方法不明确
- 需要在复杂性中找到核心问题
- 需要围绕有限候选路径做比较
- 需要审查既有判断并识别漏洞

**不适用场景**: 简单查询、直接事实、单步任务，或解决路径已经非常明确的问题。

## Basic Usage

本 skill 不再要求 AI 自行维持 thought JSON。应通过 CLI 的三个主路径动作运行：

- `start`
- `step`
- `replay`

### start

只接受四个输入：

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

其余上下文由 runtime 自动从当前会话恢复并注入。

### replay

用于读取已完成会话，生成：

- 会话目录下的 `replay.md`
- 当前目录导出的 `[session-name]-replay.md`

## Workflow Pattern

```text
1. 用 `start` 创建会话，显式给出 `name`、`goal`、`mode`、`totalSteps`。
2. 每一步用 `step --content` 提交当前推进内容。
3. runtime 自动注入当前模式提示、收敛状态和存储路径。
4. 最终步会自动标记完成态，并生成 `final.md`。
5. 完成后可用 `replay` 生成与导出回放文档。
```

## Modes

- **`explore`**: 适合拆问题、识别变量、找主矛盾，后半程必须收敛到结论与建议
- **`branch`**: 适合在有限候选路径之间做比较，最终必须推荐一个方向或明确排序
- **`audit`**: 适合审查既有判断、识别漏洞、证据不足和隐含假设，最终必须给出修正建议

## Convergence Rhythm

- 当 `totalSteps = 5`：
  - Step 1-3 正常推进
  - Step 4 开始收敛
  - Step 5 必须收敛
- 当 `totalSteps = 8`：
  - Step 1-5 正常推进
  - Step 6-7 开始收敛
  - Step 8 必须收敛

## Example Flow

```bash
st start --name "protocol-review" --goal "澄清 runtime 协议边界" --mode explore --totalSteps 5
st step --sessionPath .anws/runtime/sequential-thinking/protocol-review --content "先拆解协议边界、输入约束和默认行为。"
st step --sessionPath .anws/runtime/sequential-thinking/protocol-review --content "继续识别最容易漂移的能力边界。"
st step --sessionPath .anws/runtime/sequential-thinking/protocol-review --content "整理核心能力与非目标。"
st step --sessionPath .anws/runtime/sequential-thinking/protocol-review --content "开始收敛到 v1 必做与延后项。"
st step --sessionPath .anws/runtime/sequential-thinking/protocol-review --content "输出最终结论、风险和下一步建议。"
st replay --sessionPath .anws/runtime/sequential-thinking/protocol-review
```

## Storage

- 运行时默认写入：
  - `.anws/runtime/sequential-thinking/[session-name]/session.json`
  - `.anws/runtime/sequential-thinking/[session-name]/steps/{NN}.json`
  - `.anws/runtime/sequential-thinking/[session-name]/final.md`
  - `.anws/runtime/sequential-thinking/[session-name]/replay.md`
- `replay` 额外导出到当前目录：
  - `./[session-name]-replay.md`

## Heuristic Reminders

以下提醒仍然有效，但现在它们由 mode + runtime 节奏承载，而不是靠手写 JSON 自我约束。

- **问题定义提醒**: 你现在是在描述现象，还是在定位根因？
- **证据提醒**: 当前判断基于事实、观察结果，还是基于猜测与假设？
- **边界提醒**: 当前问题影响的是局部模块、单系统，还是跨系统结构？
- **复杂度提醒**: 你是在消除本质复杂度，还是在增加偶然复杂度？
- **收敛提醒**: 当前是否已经足够形成结论，还是仍在无效发散？

## Tips

- 不要再手写 thought JSON；让 CLI runtime 负责节奏、落盘与收敛约束
- `start` 时就选对 `mode` 与 `totalSteps`，避免运行中漂移任务性质
- `step` 的 `content` 应只表达当前推进内容，不要重复补全系统上下文
- 到收敛阶段时，应明确输出结论、风险和下一步动作
- 只有已完成会话才能执行 `replay`

