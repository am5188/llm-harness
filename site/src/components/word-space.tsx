"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const WORDS = [
  { word: "国王", x: 28, y: 22, group: "royal", note: "和“王后”在语义空间靠近" },
  { word: "王后", x: 34, y: 34, group: "royal", note: "和“国王”在语义空间靠近" },
  { word: "男人", x: 22, y: 45, group: "people", note: "与“女人”形成关系" },
  { word: "女人", x: 29, y: 55, group: "people", note: "与“男人”形成关系" },
  { word: "苹果", x: 70, y: 25, group: "food", note: "水果语境中的“苹果”" },
  { word: "香蕉", x: 79, y: 34, group: "food", note: "与“苹果”共享水果语境" },
  { word: "巴黎", x: 69, y: 68, group: "place", note: "城市/国家关系中的城市" },
  { word: "法国", x: 79, y: 78, group: "place", note: "与“巴黎”形成地理关系" },
];

export function WordSpace() {
  const [selected, setSelected] = useState(0);
  const current = WORDS[selected];
  return (
    <div className="glass my-8 rounded-3xl p-6 md:p-8">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">词，不再只是标签</h3>
          <p className="mt-1 text-xs text-slate-500">点击一个词，看它在“语义空间”里的邻居</p>
        </div>
        <span className="font-mono text-xs text-slate-600">Word2Vec / GloVe</span>
      </div>
      <div className="relative aspect-[16/8] overflow-hidden rounded-2xl border border-white/10 bg-[#0b172d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(56,189,248,0.16),transparent_22%),radial-gradient(circle_at_75%_70%,rgba(167,139,250,0.14),transparent_24%)]" />
        <div className="absolute bottom-3 left-4 text-[10px] text-slate-600">维度 1 · 关系</div>
        <div className="absolute top-3 left-4 text-[10px] text-slate-600">维度 2 · 语境</div>
        {WORDS.map((item, i) => {
          const active = i === selected;
          return (
            <motion.button
              key={item.word}
              type="button"
              onClick={() => setSelected(i)}
              animate={{ scale: active ? 1.2 : 1 }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                active ? "z-10 border-cyan-300 bg-cyan-300/20 text-cyan-100 shadow-lg shadow-cyan-400/20" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
              )}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              {item.word}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current.word} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">
          <span className="font-semibold text-cyan-300">{current.word}</span>：{current.note}。向量相似性是统计表示，不等于人类式理解。
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function SequenceAttention() {
  const [step, setStep] = useState(0);
  const source = ["我", "喜欢", "学习", "机器", "翻译"];
  const target = ["I", "like", "learning", "machine", "translation"];
  return (
    <div className="glass my-8 rounded-3xl p-6 md:p-8">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">从读入，到生成</h3>
          <p className="mt-1 text-xs text-slate-500">点击“下一步”：注意力让解码器每次读取不同位置</p>
        </div>
        <button type="button" onClick={() => setStep((step + 1) % target.length)} className="rounded-full bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-200 hover:bg-sky-500/30">下一步 →</button>
      </div>
      <div className="space-y-5 rounded-2xl bg-[#0b172d] p-5">
        <div className="flex flex-wrap justify-center gap-2">
          {source.map((word, i) => (
            <motion.span key={word} animate={{ opacity: i === step ? 1 : 0.45, scale: i === step ? 1.12 : 1 }} className={cn("rounded-xl border px-4 py-2 text-sm", i === step ? "border-pink-300 bg-pink-300/15 text-pink-100" : "border-white/10 bg-white/5 text-slate-300")}>{word}</motion.span>
          ))}
        </div>
        <div className="mx-auto h-16 w-px bg-gradient-to-b from-pink-300 to-cyan-300" />
        <div className="text-center text-xs text-slate-500">attention：本次读取「{source[step]}」</div>
        <div className="flex flex-wrap justify-center gap-2">
          {target.map((word, i) => (
            <motion.span key={word} animate={{ opacity: i <= step ? 1 : 0.28, y: i === step ? -3 : 0 }} className={cn("rounded-xl border px-4 py-2 text-sm", i === step ? "border-cyan-300 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300")}>{word}</motion.span>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">seq2seq 先把输入读进去，再生成输出；注意力缓解了“所有信息必须压进一个固定向量”的瓶颈，为 Transformer 的自注意力铺路。</p>
    </div>
  );
}
