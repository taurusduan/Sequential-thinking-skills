# ADR-001: Sequential Thinking CLI v1 技术栈决策

- **状态**: Accepted
- **日期**: 2026-03-16
- **影响范围**: CLI Shell, Runtime Engine, Persistence Layer, Replay Export

## 背景

本项目需要为 `sequential-thinking` 建立一个面向 AI Agent 的极简 CLI 运行器。该运行器不追求复杂交互，而追求稳定、简单、可落盘、可回放。技术栈必须满足以下要求：

- 适合构建本地 CLI
- 易于建模输入契约与状态结构
- 易于读写 JSON 和 Markdown 文件
- 对后续扩展 `SKILL.md` 与协议实现友好
- 不引入不必要的运行时复杂度

## 决策

v1 采用以下技术栈：

- **运行时**: Node.js
- **语言**: TypeScript
- **包管理器**: pnpm
- **CLI 入口**: 原生 Node CLI 入口，自建极简参数解析
- **数据校验**: Zod
- **持久化格式**: 本地文件系统 + JSON / Markdown
- **测试框架**: Vitest
- **构建输出**: `dist/` 可执行 CLI

## 理由

### 1. TypeScript + Node.js

这是实现本地 CLI、状态机、文件持久化的最稳妥组合。相比 Python，TypeScript 在定义协议类型、状态结构和后续 CLI 对外接口时更统一，也更方便约束输入与输出形状。

### 2. pnpm

符合当前默认包管理偏好，也适合后续快速建立小型 CLI 工程骨架。

### 3. 原生极简 CLI 入口

v1 不采用复杂 CLI 框架。原因不是做不到，而是没必要。当前动作极少，主路径只围绕 `start`、`step`、`replay` 展开。此时引入复杂命令框架只会把偶然复杂度前置。

### 4. Zod

需要一个轻量而明确的 schema 工具来约束启动输入、会话状态和单步记录。Zod 足够简单，也方便在运行时给出清晰错误。

### 5. 本地文件系统 + JSON / Markdown

会话状态适合 JSON，回放与最终摘要适合 Markdown。这个组合兼顾机器读取与人类审阅，且无需数据库。

### 6. Vitest

适合小型 TypeScript 工程，足以覆盖协议校验、收敛规则和存储逻辑。

## 备选方案

### 方案 A：Python CLI

**优点**:
- 快速实现
- 文件操作简单

**缺点**:
- 与后续协议类型建模的统一性较弱
- 在 CLI + schema + typed runtime 的组合上不如 TypeScript 顺手

### 方案 B：引入 Commander 等 CLI 框架

**优点**:
- 命令定义规范
- Help 与参数管理现成

**缺点**:
- 当前动作过少，属于过度设计
- 容易把工具心智拉回“人类命令行应用”

## 后果

### 正面

- 工程结构清晰
- 类型与协议统一
- 持久化简单直接
- 后续实现成本低

### 负面

- 需要手写少量参数解析逻辑
- 未来如果动作增加，可能需要再评估是否引入 CLI 框架

## 结论

v1 采用 `Node.js + TypeScript + pnpm + Zod + 本地 JSON/Markdown 持久化 + Vitest`。CLI 保持极简，不引入复杂命令框架。
