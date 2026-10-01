"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type Road = {
  key: string;
  name: string;
  emoji: string;
  claim: string;
  tools: string[];
  bottleneck: string;
  ending: string;
};

const ROADS: Road[] = [
  {
    key: "symbolic",
    name: "符号主义",
    emoji: "📐",
    claim: "智能 = 规则 + 推理。把知识写成逻辑和符号，让机器像下棋一样演绎。",
    tools: ["逻辑推理", "专家系统（规则库）", "知识表示"],
    bottleneck: "规则要靠人一条条写；世界太开放，规则写不完、也维护不动。",
    ending: "在封闭问题上惊艳（下棋、专家诊断），在开放语言上撞墙，成为两次冬天的直接原因之一。",
  },
  {
    key: "connectionist",
    name: "连接主义",
    emoji: "🧠",
    claim: "智能 = 从数据中学习。给网络数据和反馈，让连接权重自己调整。",
    tools: ["感知机", "神经网络", "反向传播（1986）"],
    bottleneck: "当时既没有足够数据，也没有足够算力；多层网络训练长期不稳定。",
    ending: "整个冬天都在暗处积累，最终与 GPU 和大数据汇合，成为今天大模型的正统。",
  },
];

export function TwoRoads() {
  const [active, setActive] = useState(0);
  const road = ROADS[active];

  return (
    <div className="glass my-8 rounded-3xl p-6 md:p-8">
      <h3 className="mb-4 text-lg font-bold text-white">两条路线，两种智能观</h3>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {ROADS.map((r, i) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-semibold transition",
              active === i
                ? "bg-gradient-to-r from-sky-500/30 to-cyan-500/30 text-white shadow shadow-sky-500/20"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white",
            )}
          >
            {r.emoji} {r.name}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={road.key}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-white/5 p-5"
        >
          <p className="mb-4 text-sm leading-7 text-slate-200">
            <span className="font-semibold text-white">主张：</span>
            {road.claim}
          </p>
          <div className="mb-4">
            <div className="mb-2 text-xs font-semibold text-slate-400">工具</div>
            <div className="flex flex-wrap gap-2">
              {road.tools.map((t) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.08 }}
                  className="glass rounded-full px-3 py-1 text-xs text-slate-300"
                >
                  {t}
                </motion.span>
              ))}
            </div>
          </div>
          <div className="mb-4 text-sm leading-7 text-slate-300">
            <span className="font-semibold text-amber-300">瓶颈：</span>
            {road.bottleneck}
          </div>
          <div className="text-sm leading-7 text-slate-300">
            <span className="font-semibold text-emerald-300">结局：</span>
            {road.ending}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
