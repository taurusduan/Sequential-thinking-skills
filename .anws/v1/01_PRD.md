# PRD - Sequential Thinking Protocol + CLI v1

## 1. 背景

当前 `sequential-thinking` 主要以 `SKILL.md` 的静态说明存在，核心约束集中在 JSON 字段示例上。实践中发现，这种纯文档约束不足以稳定驱动 AI 进入结构化顺序思考：模型经常把 JSON 当成参考样式，而不是必须遵守的执行协议。

问题不在于示例数量不够，而在于缺少运行时控制层。AI 被要求“记住如何思考”，但没有外部机制持续提醒当前模式、节奏、收敛时机与记录方式，因此推理容易漂移、发散或提前结束。

## 2. 产品目标

本项目要把 `sequential-thinking` 升级为一个面向 AI 的极简思维运行协议，并以 CLI 作为初版承载方式，实现以下目标：

- 让 AI 在每一步都知道自己当前在做什么、为什么、接下来该怎么走
- 将“顺序思考”从输出格式升级为受控过程
- 用极少输入完成一次完整会话启动
- 默认记录全过程，最终能回放和导出结果
- 保持工具优雅、简单，避免过多参数与命令

## 3. 非目标

以下内容不属于 v1：

- 不构建面向人类的复杂会话管理系统
- 不提供 `resume` 一类恢复命令
- 不支持无限分支树和复杂分支治理
- 不引入复杂的快照管理体系
- 不依赖 MCP 才能运行
- 不做 GUI 或 TUI

## 4. 目标用户

主要用户不是人类操作者，而是调用该工具的 AI Agent。

次级用户是定义、调试和观察该协议的人类作者，但其使用方式应尽量间接，不让工具设计被人类交互心智主导。

## 5. 正式需求编号 (Requirements)

### REQ-001: 最小启动输入

系统必须允许 AI 仅使用 `name`、`goal`、`mode`、`totalSteps` 四个字段启动一次会话。

### REQ-002: 模式驱动引导

系统必须在每一步根据 `mode` 输出对应的阶段引导，而不是只接受自由文本 thought。

### REQ-003: 收敛节奏控制

系统必须按 `totalSteps` 的比例自动提醒收敛：

- 当 `totalSteps = 5` 时，第 4 步开始提醒收敛，第 5 步必须收敛
- 当 `totalSteps = 8` 时，第 6 步开始提醒收敛，第 8 步必须收敛

### REQ-004: 默认自动保存

系统必须在会话启动后自动创建记录，并在每次推进一步后自动保存，在完成时自动归档最终结果。

### REQ-005: 回放与导出

系统必须支持对完整会话进行回放，并支持将回放结果保存到当前文件夹。

### REQ-006: 主路径动作约束

v1 的主路径动作只允许 `start`、`step`、`replay`。

### REQ-007: 非目标动作排除

v1 不实现 `resume`，并将 `snapshot`、`diff` 延后到后续版本评估，不纳入首批实现。

## 6. User Stories

### US-001 [REQ-001] (P0)

**As an** AI Agent, **I want** to start a sequential-thinking session with only `name`、`goal`、`mode`、`totalSteps`, **so that** I can enter the protocol without carrying heavy input burden.

- **涉及系统**: SYS-1 Protocol Definition, SYS-2 Runtime Engine, SYS-4 CLI Shell
- **独立可测**: 可以通过一次 `start` 调用独立演示
- **用户价值**: 降低 AI 启动成本，减少输入复杂度
- **边界情况**: 非法 `mode`、非法 `totalSteps`、缺失字段
- **验收标准**:
  - Given 合法的四字段输入
  - When 调用 `start`
  - Then 成功创建会话并返回初始引导
  - Given 非法 `mode` 或缺失字段
  - When 调用 `start`
  - Then 返回明确错误而不创建会话

### US-002 [REQ-002][REQ-003][REQ-004] (P0)

**As an** AI Agent, **I want** to receive mode-specific guidance, convergence reminders, and automatic persistence at each step, **so that** the reasoning process stays controlled and recoverable.

- **涉及系统**: SYS-1 Protocol Definition, SYS-2 Runtime Engine, SYS-3 Persistence Layer, SYS-4 CLI Shell
- **独立可测**: 可以通过一次 5 步或 8 步会话独立演示
- **用户价值**: 防止推理漂移、提前结束或记录丢失
- **边界情况**: 最后一步未收敛、连续多步保存、模式切换约束
- **验收标准**:
  - Given 一个已启动会话
  - When 连续执行 `step`
  - Then 每步都返回模式对应引导并自动保存
  - Given `totalSteps = 5` 或 `8`
  - When 推进到后半段
  - Then 正确触发收敛提醒与完成态判断

### US-003 [REQ-005][REQ-006] (P1)

**As an** AI Agent, **I want** to replay a completed session and export the replay to the current folder, **so that** the reasoning trace can be reviewed and reused.

- **涉及系统**: SYS-1 Protocol Definition, SYS-3 Persistence Layer, SYS-4 CLI Shell
- **独立可测**: 可以基于一个已完成会话独立演示
- **用户价值**: 让推理过程可审阅、可导出、可复用
- **边界情况**: 会话不存在、会话不完整、导出文件名冲突
- **验收标准**:
  - Given 一个已完成会话
  - When 调用 `replay`
  - Then 成功生成回放内容并可导出到当前目录
  - Given 会话不存在或记录缺失
  - When 调用 `replay`
  - Then 返回清晰错误而不是生成残缺输出

### US-004 [REQ-006][REQ-007] (P1)

**As a** workflow maintainer, **I want** the v1 capability boundary to stay aligned with the real CLI behavior, **so that** the follow-up skill rewrite does not drift from implementation.

- **涉及系统**: SYS-1 Protocol Definition, SYS-4 CLI Shell
- **独立可测**: 可通过对照 CLI 行为与 skill 文档独立验证
- **用户价值**: 防止文档承诺超出真实能力边界
- **边界情况**: 文档仍保留 `resume`、误写 `snapshot/diff` 为主能力
- **验收标准**:
  - Given CLI 主路径已实现
  - When 对照 skill 文档检查
  - Then 文档只描述 `start`、`step`、`replay`
  - Given v1 能力边界固定
  - When 检查文档与任务清单
  - Then 不存在与 `resume`、`snapshot`、`diff` 相关的错误承诺

## 7. 核心使用场景

### 场景 A：问题探索

当 AI 面对边界不清、变量较多的问题时，以 `explore` 模式启动会话，用 5 步或 8 步逐步拆解问题，并在后半段收到收敛提醒。

### 场景 B：方案比较

当 AI 需要在两个主要路径之间做权衡时，以 `branch` 模式推进分析。系统持续提醒其不要无限发散，而应在固定步数内完成比较并给出推荐方案。

### 场景 C：审计已有判断

当 AI 需要审视已有方案、发现漏洞、隐含假设和证据不足时，以 `audit` 模式运行。重点不是重新发散，而是识别缺陷并收敛到修正建议。

### 场景 D：全过程记录与回放

当一次顺序思考完成后，系统自动将记录保存在预设目录。后续可通过 `replay` 回放整个过程，并支持将回放内容保存到当前文件夹。

## 8. 输入契约

v1 启动一次会话时，只允许以下最小输入：

- `name`: 本次推理名称，用于命名与持续提醒目标上下文
- `goal`: 本次推理目标，用于防止 thought 漂移
- `mode`: `explore` / `branch` / `audit`
- `totalSteps`: 固定为 5 或 8

除以上字段外，v1 不新增复杂参数。

## 9. 核心能力

### 7.1 模式驱动引导

系统必须根据 `mode` 在每一步提供不同的引导语，而不是仅要求 AI 输出 thought。

### 7.2 节奏控制

系统必须根据 `totalSteps` 在后半程自动提醒收敛：

- 当 `totalSteps = 5` 时，第 4 步开始提醒收敛，第 5 步必须收敛
- 当 `totalSteps = 8` 时，第 6 步开始提醒收敛，第 8 步必须收敛

### 7.3 默认自动保存

会话启动后自动创建记录；每次推进一步都自动保存；完成后自动归档。

### 7.4 回放

系统支持对完整会话进行回放，并支持将回放结果保存到当前文件夹。

## 10. 产品收敛结论

### 8.1 v1 主路径能力

- `start`
- `step`
- `replay`
- 自动保存

### 8.2 延后能力

- `snapshot`
- `diff`

这两项不纳入 v1 核心实现。如未来证明确有价值，应在后续版本单独评估，而不是在 v1 中横向膨胀。

### 8.3 明确移除

- `resume`
- 面向人类的复杂命令管理
- 多余 flags 和参数

## 11. 技术与实现约束

- 运行时采用 `Node.js`
- 语言采用 `TypeScript`
- 包管理器采用 `pnpm`
- 输入与状态校验采用 `Zod`
- 持久化采用本地文件系统，记录格式为 `JSON + Markdown`
- 测试采用 `Vitest`
- v1 不引入复杂 CLI 框架，维持极简外部动作集

## 12. v1 工程目标

v1 的工程交付目标不是只写一份协议文档，而是完成可进入实现阶段的 CLI 骨架设计，至少覆盖以下模块：

- CLI 入口层
- 协议与类型定义层
- 运行时状态推进层
- 自动保存与持久化层
- 回放与导出层

## 13. 验收标准

- AI 能以不超过 4 个输入字段启动一次会话
- AI 每推进一步，都能收到模式相关的阶段引导
- 系统能在 5 步 / 8 步模式下按比例提醒收敛
- 会话记录默认自动保存
- 完成后可回放全过程
- 设计中不存在 `resume` 与复杂命令树
- 技术栈、动作边界、存储策略已在 ADR 中定稿
