# .anws v1 - 版本清单

**创建日期**: 2026-03-16
**状态**: Active
**前序版本**: 无

## 版本目标

本版本用于将 `sequential-thinking` 从纯提示词技能升级为面向 AI 的极简思维运行协议，并为后续 CLI 骨架实现建立文档基础。

## 主要变更

- 将 `sequential-thinking` 的定位从“JSON 输出格式示例”升级为“受控思维协议”
- 定义 AI-first 的极简输入契约：`name`、`goal`、`mode`、`totalSteps`
- 约束初版模式为 `explore`、`branch`、`audit`
- 将自动保存、步数驱动的收敛提醒、会话回放作为主能力
- 明确移除 `resume`，弱化复杂命令层，避免人类交互式 CLI 心智污染
- 为后续 CLI 骨架实现准备最小架构边界

## 文档清单

- [x] 00_MANIFEST.md (本文件)
- [x] 01_PRD.md
- [x] 02_ARCHITECTURE_OVERVIEW.md
- [x] 03_ADR/
- [ ] 04_SYSTEM_DESIGN/
- [x] 05_TASKS.md (由 /blueprint 生成)
- [x] 06_CHANGELOG.md
