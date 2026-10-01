"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type Step = {
  label: string;
  title: string;
  intro: string;
  asker: string;
  a: { name: string; color: string; reply: string; note: string };
  b: { name: string; color: string; reply: string; note: string };
  conclusion: string;
};

const STEPS: Step[] = [
  {
    label: "第 1 步 · 原版玩法",
    title: "派对游戏：谁在说谎？",
    intro: "隔着文字提问，判断 A 和 B 谁是男人、谁是女人。",
    asker: "你的头发有多长？",
    a: {
      name: "A",
      color: "text-emerald-300",
      reply: "我的头发是短发，大约 5 厘米。",
      note: "A 是男人，被要求如实回答",
    },
    b: {
      name: "B",
      color: "text-pink-300",
      reply: "我的头发也是短发！只有 5 厘米，真的。",
      note: "B 是女人，任务是误导询问者",
    },
    conclusion: "看，判断的依据只有语言行为——看不到人，只能看字。",
  },
  {
    label: "第 2 步 · 图灵的置换",
    title: "把其中一位换成机器",
    intro: "图灵问：如果把男人换成一台机器，游戏还成立吗？",
    asker: "请写一首关于福斯桥的十四行诗。",
    a: {
      name: "人",
      color: "text-emerald-300",
      reply: "福斯桥横跨河口，钢铁的弧线在雾中舒展……",
      note: "人，如实作答",
    },
    b: {
      name: "机器",
      color: "text-purple-300",
      reply: "请把我排除在这之外：我从来不会写诗。",
      note: "机器，尽力不被识破",
    },
    conclusion: "如果询问者还是分不清哪边是机器——那么“机器不能思考”就不再是显然的结论了。",
  },
  {
    label: "第 3 步 · 问题成立",
    title: "一个可操作的问题",
    intro: "图灵不再问“机器内部有没有心灵”，只问可观察的行为。",
    asker: "",
    a: { name: "", color: "", reply: "", note: "" },
    b: { name: "", color: "", reply: "", note: "" },
    conclusion: "这就是“图灵测试”的原型：智能被转化为语言行为判据。此后所有对话系统、聊天机器人，甚至大模型的评测，都从这里长出来。",
  },
];

function Typewriter({ text, speed = 38, startDelay = 350 }: { text: string; speed?: number; startDelay?: number }) {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCount(0);
    const timeout = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCount((c) => {
          if (c >= text.length && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, startDelay]);

  return (
    <span>
      {text.slice(0, count)}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-sky-300"
      />
    </span>
  );
}

const bubble = {
  initial: { opacity: 0, y: 14, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10 },
};

export function ImitationGame() {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  return (
    <div className="glass my-8 rounded-3xl p-6 md:p-8">
      {/* 步骤条 */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((st, i) => (
          <button
            key={st.label}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "flex-1 rounded-full py-1.5 text-xs transition",
              i === step
                ? "bg-gradient-to-r from-sky-500 to-cyan-500 font-semibold text-white shadow shadow-sky-500/30"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white",
            )}
          >
            {st.label.replace(/第 \d 步 · /, "")}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h3 className="mb-2 text-lg font-bold text-white">{s.title}</h3>
          <p className="mb-5 text-sm text-slate-400">{s.intro}</p>

          {step < 2 ? (
            <div className="space-y-4">
              {/* 询问者 */}
              <motion.div {...bubble} transition={{ duration: 0.4 }} className="flex items-start gap-3">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-xs font-bold text-sky-300">
                  问
                </span>
                <div className="glass flex-1 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-200">
                  <Typewriter text={s.asker} />
                </div>
              </motion.div>
              {/* 参与者 A */}
              <motion.div {...bubble} transition={{ duration: 0.4, delay: 0.15 }} className="flex items-start gap-3 pl-10">
                <div className="flex-1">
                  <div className={cn("mb-1 text-xs font-semibold", s.a.color)}>{s.a.name} · {s.a.note}</div>
                  <div className="glass rounded-2xl px-4 py-3 text-sm text-slate-300">
                    <Typewriter text={s.a.reply} startDelay={1100} />
                  </div>
                </div>
              </motion.div>
              {/* 参与者 B */}
              <motion.div {...bubble} transition={{ duration: 0.4, delay: 0.3 }} className="flex items-start gap-3 pl-10">
                <div className="flex-1">
                  <div className={cn("mb-1 text-xs font-semibold", s.b.color)}>{s.b.name} · {s.b.note}</div>
                  <div className="glass rounded-2xl px-4 py-3 text-sm text-slate-300">
                    <Typewriter text={s.b.reply} startDelay={2300} />
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-xl"
                >
                  🤖
                </motion.div>
                <p className="text-sm text-slate-400">
                  <Typewriter text="隔着文字，你能分辨出它是机器吗？" startDelay={500} />
                </p>
              </div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-6 rounded-2xl bg-white/5 px-4 py-3 text-sm leading-6 text-slate-200"
          >
            {s.conclusion}
          </motion.div>

          {/* 下一步 */}
          <div className="mt-5 flex justify-end">
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-sky-500/20 hover:text-sky-200"
              >
                下一步 →
              </button>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
