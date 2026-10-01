"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { EVENTS, STAGES } from "@/lib/timeline";

const VOLUME_COLOR: Record<number, string> = {
  1: "bg-amber-400",
  2: "bg-sky-400",
  3: "bg-emerald-400",
  4: "bg-purple-400",
};

const VOLUME_TEXT: Record<number, string> = {
  1: "text-amber-300",
  2: "text-sky-300",
  3: "text-emerald-300",
  4: "text-purple-300",
};

export function BookTimeline() {
  const [view, setView] = useState<"stages" | "events">("stages");
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  return (
    <div className="glass my-8 rounded-3xl p-6 md:p-8">
      {/* 缩放切换 */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">全书时间线</h3>
        <div className="glass flex rounded-full p-1">
          {(["stages", "events"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setView(v);
                setSelected(null);
                setSelectedEvent(null);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs transition",
                view === v ? "bg-sky-500/30 font-semibold text-sky-200" : "text-slate-400 hover:text-white",
              )}
            >
              {v === "stages" ? "十个阶段" : "十八个节点"}
            </button>
          ))}
        </div>
      </div>

      {view === "stages" ? (
        <>
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-80px 0px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="glow-line origin-left"
              />
            </div>
            <div className="relative flex flex-wrap justify-between gap-y-8">
              {STAGES.map((st, i) => (
                <motion.button
                  key={st.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px 0px" }}
                  transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.06 }}
                  onClick={() => setSelected(selected === i ? null : i)}
                  className="group flex w-1/5 min-w-[120px] flex-col items-center gap-2 text-center"
                >
                  <span
                    className={cn(
                      "h-3 w-3 rounded-full transition group-hover:scale-125",
                      VOLUME_COLOR[st.volume],
                      selected === i ? "ring-4 ring-white/20" : "",
                    )}
                  />
                  <span className="text-xs font-semibold text-white group-hover:text-sky-200">{st.label}</span>
                  <span className="text-[10px] text-slate-500">{st.range}</span>
                </motion.button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            {selected !== null ? (
              <motion.div
                key={selected}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-6 rounded-2xl bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
                  <span className={cn("font-semibold", VOLUME_TEXT[STAGES[selected].volume])}>
                    {STAGES[selected].label}（{STAGES[selected].range}）
                  </span>{" "}
                  —— {STAGES[selected].chapter ? (
                    <Link href={`/chapters/${STAGES[selected].chapter}`} className="text-cyan-400 hover:text-cyan-300">
                      阅读对应章节 →
                    </Link>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {EVENTS.map((ev, i) => (
              <motion.button
                key={`${ev.date}-${i}`}
                type="button"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedEvent(selectedEvent === i ? null : i)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition",
                  selectedEvent === i ? "bg-white/10" : "bg-white/5 hover:bg-white/10",
                )}
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    VOLUME_COLOR[ev.volume],
                  )}
                />
                <span className="w-28 shrink-0 font-mono text-xs text-slate-400">{ev.date}</span>
                <span className="flex-1 text-sm font-medium text-white">{ev.label}</span>
                <span className="hidden text-xs text-slate-500 md:block">{ev.evidence ?? ""}</span>
              </motion.button>
            ))}
            <AnimatePresence mode="wait">
              {selectedEvent !== null ? (
                <motion.div
                  key={selectedEvent}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
                    <span className="font-mono text-xs text-slate-400">{EVENTS[selectedEvent].date}</span>
                    <p className="mt-1">{EVENTS[selectedEvent].meaning}</p>
                    <p className="mt-2 text-xs">
                      {EVENTS[selectedEvent].chapter ? (
                        <Link
                          href={`/chapters/${EVENTS[selectedEvent].chapter}`}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          阅读对应章节 →
                        </Link>
                      ) : null}
                      {EVENTS[selectedEvent].evidence ? (
                        <>
                          {" · "}
                          <Link href={`/appendix#${EVENTS[selectedEvent].evidence}`} className="text-sky-400 hover:text-sky-300">
                            证据卡 {EVENTS[selectedEvent].evidence}
                          </Link>
                        </>
                      ) : null}
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      )}

      {/* 图例 */}
      <div className="mt-6 flex flex-wrap gap-4 border-t border-white/5 pt-4">
        {[1, 2, 3, 4].map((v) => (
          <span key={v} className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className={cn("h-2 w-2 rounded-full", VOLUME_COLOR[v])} />
            卷{v}
          </span>
        ))}
      </div>
    </div>
  );
}
