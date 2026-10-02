"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const CONDITIONS = [
  {
    id: "failure",
    no: "01",
    title: "失败经验",
    short: "先知道什么走不通",
    color: "amber",
    question: "规则写不完，承诺兑现不了，冬天留下了什么？",
    detail: "录音把早期路线的失败视为反思素材：它没有自动“导致”大模型，却暴露了目标与可行性之间的距离，让后来者重新组合学习、数据和规模。",
  },
  {
    id: "compute",
    no: "02",
    title: "算力硬件",
    short: "让训练从想法变成工程",
    color: "sky",
    question: "为什么一张游戏显卡会改变研究路线？",
    detail: "GPU/加速器、分布式网络、能源和工程基础设施共同决定大模型能不能被训练。显卡不是智能本身，而是把某些路线变成可执行的成本曲线。",
  },
  {
    id: "architecture",
    no: "03",
    title: "Transformer 架构",
    short: "让规模化有了抓手",
    color: "cyan",
    question: "什么架构让并行训练和长程依赖同时成立？",
    detail: "2017 年的论文提供了更适合并行训练的架构路径，但它没有单独创造智能；数据、优化、硬件、分布式工程和对齐仍然不可缺。",
  },
  {
    id: "capital",
    no: "04",
    title: "资本与组织",
    short: "有人承担长期成本",
    color: "violet",
    question: "论文为什么不等于产品？谁来支付等待的成本？",
    detail: "前沿模型需要长期算力、团队、云和产品分发。资本不是直接购买智能，而是让组织有机会持续试错并把研究接入基础设施。",
  },
  {
    id: "data",
    no: "05",
    title: "数据、标注与反馈",
    short: "让模型知道什么是好答案",
    color: "pink",
    question: "预训练、人工标注和用户反馈分别做什么？",
    detail: "预训练大量依靠自监督文本；人工标注主要服务 SFT、RLHF、评测和安全。数据质量、版权、标注劳动和反馈闭环不能混成一个“数据越多越好”。",
  },
  {
    id: "ecosystem",
    no: "06",
    title: "互联网与产业生态",
    short: "让能力进入真实世界",
    color: "emerald",
    question: "模型训练出来之后，谁把它变成每个人能用的产品？",
    detail: "网页与应用、云、芯片、框架、监管、市场分发和用户反馈共同构成生态。中美差异要作为多因素比较，而不是单一国家因果。",
  },
] as const;

const colorClasses = {
  amber: { dot: "bg-amber-300", text: "text-amber-300", border: "border-amber-400/30", bg: "bg-amber-400/10" },
  sky: { dot: "bg-sky-300", text: "text-sky-300", border: "border-sky-400/30", bg: "bg-sky-400/10" },
  cyan: { dot: "bg-cyan-300", text: "text-cyan-300", border: "border-cyan-400/30", bg: "bg-cyan-400/10" },
  violet: { dot: "bg-violet-300", text: "text-violet-300", border: "border-violet-400/30", bg: "bg-violet-400/10" },
  pink: { dot: "bg-pink-300", text: "text-pink-300", border: "border-pink-400/30", bg: "bg-pink-400/10" },
  emerald: { dot: "bg-emerald-300", text: "text-emerald-300", border: "border-emerald-400/30", bg: "bg-emerald-400/10" },
} as const;

export function ConditionsMap() {
  const [selected, setSelected] = useState(0);
  const condition = CONDITIONS[selected];
  const colors = colorClasses[condition.color];

  return (
    <div className="glass overflow-hidden rounded-3xl p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-2 text-xs tracking-[0.24em] text-sky-300/70">访谈提出的解释框架</p>
          <h2 className="text-2xl font-bold text-white md:text-3xl">大模型不是突然出现的</h2>
        </div>
        <p className="max-w-sm text-right text-xs leading-5 text-slate-500">
          六大条件逐步汇合。它们是本书的解释工具，不是已经被证明的历史定律。
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl bg-white/5 px-4 py-4 text-xs text-slate-400 md:flex-nowrap">
        <span className="font-semibold text-amber-300">失败经验</span>
        <span>→</span>
        <span className="text-sky-300">算力</span>
        <span>→</span>
        <span className="text-cyan-300">架构</span>
        <span>+</span>
        <span className="text-violet-300">资本组织</span>
        <span>+</span>
        <span className="text-pink-300">数据反馈</span>
        <span>+</span>
        <span className="text-emerald-300">产业生态</span>
        <span className="ml-auto font-semibold text-white">→ 产品化 → Harness</span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {CONDITIONS.map((item, index) => {
          const itemColors = colorClasses[item.color];
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setSelected(index)}
              whileHover={{ y: -3 }}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                selected === index
                  ? `${itemColors.border} ${itemColors.bg}`
                  : "border-white/5 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]",
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={cn("h-2.5 w-2.5 rounded-full", itemColors.dot)} />
                <span className="font-mono text-[10px] text-slate-600">{item.no}</span>
              </div>
              <div className={cn("font-semibold", selected === index ? itemColors.text : "text-white")}>{item.title}</div>
              <div className="mt-1 text-xs text-slate-500">{item.short}</div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={condition.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5"
        >
          <div className={cn("mb-2 text-sm font-semibold", colors.text)}>{condition.question}</div>
          <p className="text-sm leading-7 text-slate-300">{condition.detail}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
