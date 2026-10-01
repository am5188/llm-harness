import type { ChapterMeta } from "@/lib/chapters";
import Ch1, { meta as ch1 } from "./ch1-turing.mdx";
import Ch2, { meta as ch2 } from "./ch2-two-winters.mdx";
import Ch3, { meta as ch3 } from "./ch3-alexnet.mdx";

export type ChapterEntry = {
  meta: ChapterMeta;
  Component?: React.ComponentType;
};

const PLANNED = (overrides: Partial<ChapterMeta> & Pick<ChapterMeta, "order" | "volume" | "title" | "slug" | "summary">): ChapterMeta => ({
  volumeTitle: "",
  status: "planned",
  updated: "",
  sources: [],
  evidence: [],
  ...overrides,
});

export const chapters: ChapterEntry[] = [
  // —— 卷① 智能的火种（1950–2012）——
  { meta: ch1, Component: Ch1 },
  { meta: ch2, Component: Ch2 },
  { meta: ch3, Component: Ch3 },
  // —— 卷② 语言模型找到了路（2013–2022）——
  {
    meta: PLANNED({
      order: 4,
      volume: 2,
      volumeTitle: "语言模型找到了路",
      title: "第4章 · 让机器读懂词",
      slug: "ch4-words",
      summary: "词向量、seq2seq 与注意力：语言从离散符号变成可以计算的连续表示。",
    }),
  },
  {
    meta: PLANNED({
      order: 5,
      volume: 2,
      volumeTitle: "语言模型找到了路",
      title: "第5章 · Transformer：注意力就是一切",
      slug: "ch5-transformer",
      summary: "2017 年一篇论文同时解决了并行训练与长程依赖，规模化第一次成为明确的工程路径。",
      evidence: ["E-0001"],
    }),
  },
  {
    meta: PLANNED({
      order: 6,
      volume: 2,
      volumeTitle: "语言模型找到了路",
      title: "第6章 · 预训练时代",
      slug: "ch6-pretraining",
      summary: "BERT 与 GPT 确立预训练—适配范式：先在海量文本上学习通用表示，再适配具体任务。",
    }),
  },
  {
    meta: PLANNED({
      order: 7,
      volume: 2,
      volumeTitle: "语言模型找到了路",
      title: "第7章 · 规模法则与对齐",
      slug: "ch7-scaling",
      summary: "GPT-3 展示少样本能力，scaling laws 把参数、数据与算力写成公式；RLHF 让模型从续写变成对话。",
      evidence: ["E-0002"],
    }),
  },
  {
    meta: PLANNED({
      order: 8,
      volume: 2,
      volumeTitle: "语言模型找到了路",
      title: "第8章 · 钱、云与组织",
      slug: "ch8-money",
      summary: "OpenAI 从非营利到与微软结盟：前沿模型训练成为资本与云计算支撑的组织工程。",
    }),
  },
  // —— 卷③ ChatGPT 与开放时代（2022–2025）——
  {
    meta: PLANNED({
      order: 9,
      volume: 3,
      volumeTitle: "ChatGPT 与开放时代",
      title: "第9章 · ChatGPT 时刻",
      slug: "ch9-chatgpt",
      summary: "2022 年 11 月 30 日，研究积累、对齐技术与产品分发同时成熟——五天一亿用户的时刻。",
      evidence: ["E-0004"],
    }),
  },
  {
    meta: PLANNED({
      order: 10,
      volume: 3,
      volumeTitle: "ChatGPT 与开放时代",
      title: "第10章 · 开放权重浪潮",
      slug: "ch10-open-weights",
      summary: "Meta LLaMA 泄露与开放：权重扩散改变产业结构，但训练成本并未消失。",
      evidence: ["E-0005"],
    }),
  },
  {
    meta: PLANNED({
      order: 11,
      volume: 3,
      volumeTitle: "ChatGPT 与开放时代",
      title: "第11章 · 效率与推理",
      slug: "ch11-efficiency",
      summary: "Chinchilla 追问计算最优，DeepSeek 用工程效率与推理模型震动全球。",
      evidence: ["E-0003", "E-0006", "E-0007"],
    }),
  },
  {
    meta: PLANNED({
      order: 12,
      volume: 3,
      volumeTitle: "ChatGPT 与开放时代",
      title: "第12章 · 中国路径",
      slug: "ch12-china",
      summary: "算力约束下的工程突围：芯片管制、模型备案与产业竞争的并行叙事。",
    }),
  },
  // —— 卷④ 模型动不了手（2020–2026-10-01）——
  {
    meta: PLANNED({
      order: 13,
      volume: 4,
      volumeTitle: "模型动不了手",
      title: "第13章 · 从一次调用到 Agent",
      slug: "ch13-agent",
      summary: "RAG、ReAct 与函数调用：模型获得外部知识、工具与循环——也开始出错、失控、需要治理。",
    }),
  },
  {
    meta: PLANNED({
      order: 14,
      volume: 4,
      volumeTitle: "模型动不了手",
      title: "第14章 · Harness：给 AI 装上手",
      slug: "ch14-harness",
      summary: "模型本身不能可靠地记忆、检索、执行与验证——Harness 用系统补齐这一切。本书在此交接给主课。",
    }),
  },
];

export const publishedChapters = chapters.filter((c) => c.meta.status !== "planned");

export function getChapter(slug: string): ChapterEntry | undefined {
  return chapters.find((c) => c.meta.slug === slug);
}
