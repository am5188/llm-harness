"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const ROUTES = [
  { title: "规则与推理", text: "把智能写成规则，擅长封闭问题；开放世界让规则不断失控。", color: "text-amber-300" },
  { title: "表示与学习", text: "让网络从数据里学表示，反向传播把火种保留下来。", color: "text-emerald-300" },
  { title: "规模化工程", text: "数据、算力、架构、资本、反馈和生态逐步汇合。", color: "text-sky-300" },
];

export function RoutesMap() {
  const [selected, setSelected] = useState(0);
  const route = ROUTES[selected];
  return (
    <div className="glass rounded-3xl p-6 md:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="mb-2 text-xs tracking-[0.22em] text-slate-500">不是胜负，是汇合</p>
          <h2 className="text-2xl font-bold text-white">三条路线，最后接在一起</h2>
        </div>
        <span className="font-mono text-xs text-slate-600">1950 → 2026</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {ROUTES.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setSelected(index)}
            className={cn(
              "rounded-2xl border p-4 text-left transition",
              selected === index ? "border-sky-400/40 bg-sky-400/10" : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]",
            )}
          >
            <span className={cn("text-sm font-semibold", item.color)}>{item.title}</span>
            <span className="mt-2 block text-xs leading-5 text-slate-500">{item.text}</span>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={route.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5 rounded-2xl bg-white/5 p-4 text-sm leading-7 text-slate-300">
          <span className={cn("font-semibold", route.color)}>{route.title}：</span>{route.text}
          {selected === 2 ? <span className="text-slate-500">　接下来，产品化还要补上对齐、分发与外部系统。</span> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
