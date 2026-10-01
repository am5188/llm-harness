"use client";

import { getSource, type SourceGrade } from "@/lib/sources";
import { cn } from "@/lib/utils";

const GRADE_STYLE: Record<SourceGrade, string> = {
  A: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  B: "bg-sky-500/15 text-sky-300 border-sky-400/30",
  C: "bg-slate-500/15 text-slate-400 border-slate-400/30",
};

export function GradeBadge({ grade }: { grade: SourceGrade }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1 text-[10px] leading-4 font-semibold",
        GRADE_STYLE[grade],
      )}
      title={grade === "A" ? "一手来源" : grade === "B" ? "高质量二手来源" : "线索来源"}
    >
      {grade}
    </span>
  );
}

type CiteProps = {
  s: string;
  grade?: SourceGrade;
  loc?: string;
  note?: string;
};

/**
 * 行内证据脚注：正文里写 <Cite s="S-0001" grade="A" loc="论文开头 THE IMITATION GAME 段落" />
 * hover / 键盘聚焦时弹出来源卡片；等级与来源自动从中央注册表读取。
 */
export function Cite({ s, grade, loc, note }: CiteProps) {
  const source = getSource(s);
  const actualGrade = grade ?? source?.grade;
  if (!source) return <sup className="text-amber-400">[{s}]</sup>;

  return (
    <span className="group relative inline-flex cursor-help align-middle">
      <sup className="mx-0.5 rounded bg-white/10 px-1 py-0.5 text-[10px] font-semibold text-cyan-300 transition group-hover:bg-sky-500/20 group-hover:text-sky-200">
        {s}
      </sup>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 translate-y-1 rounded-xl opacity-0 shadow-xl shadow-black/40 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <span className="glass block rounded-xl p-4 text-left">
          <span className="mb-1 flex items-center gap-2">
            {actualGrade ? <GradeBadge grade={actualGrade} /> : null}
            <span className="text-xs font-semibold text-white">{s}</span>
          </span>
          <span className="block text-xs leading-5 text-slate-300">
            {source.title}
            {source.authors ? ` · ${source.authors}` : ""}
          </span>
          {source.venue ? <span className="block text-[11px] text-slate-400">{source.venue}</span> : null}
          {source.date ? <span className="block text-[11px] text-slate-400">{source.date}</span> : null}
          {loc ? <span className="mt-1 block text-[11px] leading-4 text-sky-300/80">定位：{loc}</span> : null}
          {note ? <span className="mt-1 block text-[11px] leading-4 text-amber-300/80">{note}</span> : null}
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block truncate text-[11px] text-cyan-400 hover:text-cyan-300"
            >
              {source.url}
            </a>
          ) : null}
        </span>
      </span>
    </span>
  );
}
