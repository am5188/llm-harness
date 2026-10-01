import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-6 pb-24 text-center text-xs text-slate-500">
      《从图灵到 Harness》大语言模型发展史 · 前置课 ·{" "}
      <Link href="https://am5188.github.io/harness-guide/" className="text-sky-400 hover:text-sky-300">
        继续 → 主课：Harness 工程指南
      </Link>
    </footer>
  );
}
