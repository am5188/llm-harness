import Link from "next/link";

type SiteHeaderProps = {
  pageLabel: string;
  backHref?: string;
};

export function SiteHeader({ pageLabel, backHref }: SiteHeaderProps) {
  return (
    <header className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:scale-105"
          >
            书
          </Link>
          <div>
            <Link href="/" className="text-sm font-semibold text-white hover:text-sky-300">
              从图灵到 Harness
            </Link>
            <div className="text-xs text-slate-500">大语言模型的前世今生 · 1950–2026</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link href={backHref} className="text-xs text-slate-400 transition hover:text-white">
              ← 上一页
            </Link>
          ) : null}
          <span className="text-xs text-slate-500">{pageLabel}</span>
        </div>
      </div>
    </header>
  );
}
