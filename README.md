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

《从图灵到 Harness：大语言模型的前世今生》是 [Harness 工程指南](https://am5188.github.io/harness-guide/) 的前置课：讲 LLM 从 1950 年图灵之问到 2026-10-01 的可验证历史，最后交接给主课。

课程以 2026-10-01 两段访谈提出的“六大条件”为**解释框架**：失败经验、算力硬件、Transformer 架构、资本与组织、数据/标注/反馈、互联网与产业生态。它们不是公认的必要/充分条件；具体史实仍以论文、官方公告、监管文件和可复核证据卡为准。全书最终回答：模型为什么能生成语言，以及它为什么仍需要 RAG、工具、Agent 和 Harness 承担真实世界的状态、执行、权限与验证。

- 章节以 MDX 编写：`site/src/content/chapters/`（新章 = 写 MDX + 在 manifest.ts 登记一行）
- 证据卡片留在 `references/`，站点构建期读取渲染到证据附录
- 本地开发：`cd site && npm run dev`（URL 带 `/llm-harness` 前缀）
- 发布：`cd site && npm run deploy`（构建并推送到 gh-pages 分支）

## 状态

本仓库的课程内容和前端站点已公开，仍在持续建设中；目前站点发布 3 / 14 章，证据覆盖主要到 2012 年，后续章节会在补齐来源后逐章发布。
