# Architecture Overview - Sequential Thinking Protocol + CLI v1

## 1. 系统目标

本系统不是传统面向人类的命令行工具，而是一个服务于 AI Agent 的极简思维运行器。它的职责不是让 AI 自由输出，而是在每一步为 AI 提供阶段感、模式感和收敛压力，使顺序思考从“静态提示词”变成“受控执行过程”。

## 1.1 已采纳决策

- 技术栈以 `ADR-001` 为准
- 运行协议与动作边界以 `ADR-002` 为准
- 本文负责系统拆解与实现边界，不重复 ADR 中的决策理由

## 2. 系统拆解

### SYS-1 Protocol Definition

**职责**:
- 定义 `sequential-thinking` 的世界观、准入条件、输入契约与输出边界
- 规定支持的模式、步数节奏与收敛规则
- 为 `SKILL.md` 提供权威协议定义

**边界**:
- 不负责保存文件
- 不负责命令解析
- 不负责执行 AI 模型调用

### SYS-2 Runtime Engine

**职责**:
- 维护当前会话状态
- 根据模式生成当前步的引导信息
- 根据步数比例触发收敛提醒
- 在每一步完成后更新记录并触发自动保存

**边界**:
- 不负责复杂会话恢复
- 不负责多用户管理

### SYS-3 Persistence Layer

**职责**:
- 将会话记录保存到预设目录
- 会话完成后归档最终结果
- 为 `replay` 提供读取能力
- 支持将回放结果导出到当前文件夹

**边界**:
- 不负责业务逻辑判断
- 不负责协议解释

### SYS-4 CLI Shell

**职责**:
- 提供极简外部入口
- 将外部调用转换为 runtime 行为
- 暴露有限动作：`start`、`step`、`replay`
- 如保留 `snapshot` 或 `diff`，也仅作为次级能力

**边界**:
- 不承载复杂参数系统
- 不模拟面向人的复杂交互流程

## 2.1 最小工程结构

建议工程根目录采用以下结构：

```text
cli/
  index.ts
src/
  protocol/
  runtime/
  storage/
  replay/
  types/
tests/
```

其中：

- `protocol/` 负责输入契约、模式约束与收敛规则
- `runtime/` 负责会话推进与阶段引导
- `storage/` 负责自动保存、会话落盘与最终归档
- `replay/` 负责回放文本拼装与导出
- `types/` 负责共享类型与 schema
- `cli/` 负责最小入口与参数转发

## 3. 关键设计原则

### 3.1 AI-first

工具首先服务 AI，而不是服务人类终端用户。任何设计都应优先减少 AI 的输入负担，而不是增加人类可玩性。

### 3.2 默认简单

复杂性应收敛到运行时默认行为中，而不是暴露为参数。例如自动保存、阶段引导、收敛提醒都应由系统内部完成。

### 3.3 模式即认知轨道

`explore`、`branch`、`audit` 不是标签，而是三种不同的推进轨道。runtime 必须根据模式提供不同引导。

### 3.4 收敛优先

顺序思考的价值不在于走得久，而在于有节奏地收敛。后半程必须施加收敛压力，防止空转。

## 4. 输入与状态模型

### 4.1 启动输入

- `name`
- `goal`
- `mode`
- `totalSteps`

### 4.2 会话状态

建议状态模型至少包含：

- `name`
- `goal`
- `mode`
- `totalSteps`
- `currentStep`
- `shouldConverge`
- `steps[]`
- `createdAt`
- `updatedAt`
- `storagePath`

### 4.3 单步记录

每一步记录至少包含：

- `stepNumber`
- `content`
- `mode`
- `phaseHint`
- `shouldConverge`
- `savedAt`

## 5. 模式行为

### 5.1 explore

- 前段用于问题拆解、边界识别、关键变量澄清
- 中段用于识别主矛盾、候选方向与未知项
- 后段必须开始收敛到结论、风险与建议

### 5.2 branch

- 仅支持有限对比，不鼓励无限派生分支
- 引导重点是比较维度，而非单纯展开更多路径
- 最终必须推荐一个方向或给出明确排序

### 5.3 audit

- 目标是查错、找漏洞、识别隐含假设与证据不足
- 不应退化成从头重新探索问题
- 最终输出必须聚焦缺陷与修正建议

## 6. 收敛控制

### totalSteps = 5

- Step 1-3: 正常推进
- Step 4: 提醒开始收敛
- Step 5: 强制输出结论

### totalSteps = 8

- Step 1-5: 正常推进
- Step 6-7: 提醒开始收敛
- Step 8: 强制输出结论

## 7. 存储策略

建议保存路径：

```text
.anws/runtime/sequential-thinking/[session-name]/
```

建议文件：

- `session.json`
- `steps/01.json` ...
- `replay.md`
- `final.md`

如需保存回放到当前目录，可额外导出：

- `./[session-name]-replay.md`

### 7.1 重名冲突策略

- 会话目录名由 `name` 规范化得到
- 如目录已存在，使用递增序号避免覆盖
- 当前目录导出的 replay 文件使用相同策略，确保不会覆盖已有产物

## 8. 实现边界

- v1 必须先跑通 `start`、`step`、`replay`
- `snapshot` 与 `diff` 不进入首批实现任务
- `SKILL.md` 的重写以后置方式进行，需基于 CLI 的真实能力反推
- 所有持久化行为默认发生，不要求 AI 显式调用 `save`
- 若项目中没有 `AGENTS.md`，后续执行阶段以 `.anws/v1/05_TASKS.md` 作为唯一任务源

## 9. 后续设计入口

- 若继续深化协议文档，应进入 `SKILL.md` 重写
- 若继续细化实现边界，应进入 `/design-system`
- 若准备拆实现任务，应进入 `/blueprint`
