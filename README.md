# LLM & Harness

面向 LLM 与 Harness 的私有学习、研究与实践知识库。

## 目的

- 系统整理 LLM、Agent、Harness、工具调用与评测相关知识
- 将零散的探讨和交流沉淀为可查询的文档、案例与实验记录
- 逐步形成可复用的课程、学习路径和实践方法

## 内容规划

- `site/`：书的站点源码（Next.js 静态站，发布到 https://am5188.github.io/llm-harness/）
- `courses/`：课程与学习路径（研究档案）
- `notes/`：主题笔记与讨论记录（规划中）
- `experiments/`：实验、原型和结果（规划中）
- `references/`：证据卡片、来源索引与研究规范
- `projects/`：可复用项目与实践案例（规划中）
- `timeline/`：时间线档案

## 这本书

《从图灵到 Harness：大语言模型的前世今生》是 [Harness 工程指南](https://am5188.github.io/harness-guide/) 的前置课：讲 LLM 从 1950 年图灵之问到 2026 年的发展史，最后交接给主课。

- 章节以 MDX 编写：`site/src/content/chapters/`（新章 = 写 MDX + 在 manifest.ts 登记一行）
- 证据卡片留在 `references/`，站点构建期读取渲染到证据附录
- 本地开发：`cd site && npm run dev`（URL 带 `/llm-harness` 前缀）
- 发布：`cd site && npm run deploy`（构建并推送到 gh-pages 分支）

## 状态

本仓库暂为私有仓库，内容结构和课程体系将随着讨论持续迭代。
