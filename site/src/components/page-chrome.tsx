"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { chapters } from "@/content/chapters/manifest";

const PAGES = [
  { href: "/", label: "书页" },
  { href: "/timeline", label: "时间线" },
  ...chapters
    .filter((c) => c.meta.status !== "planned")
    .map((c) => ({ href: `/chapters/${c.meta.slug}`, label: c.meta.title.replace(/^第\d+章 · /, "") })),
  { href: "/appendix", label: "证据附录" },
];

type Section = { id: string; text: string };

function slugify(text: string, index: number) {
  const base = text
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w一-龥-]/g, "")
    .slice(0, 40);
  return `sec-${index}-${base || "x"}`;
}

export function PageChrome() {
  const pathname = usePathname();
  const [sections, setSections] = useState<Section[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [showTop, setShowTop] = useState(false);

  // 扫描当前页面的 h2，作为页内目录
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll<HTMLHeadingElement>("main h2")).filter(
      (el) => !el.textContent?.includes("继续往下看"),
    );
    const found: Section[] = headings.map((el, i) => {
      if (!el.id) el.id = slugify(el.textContent ?? "", i);
      el.classList.add("scroll-mt-24");
      return { id: el.id, text: (el.textContent ?? "").trim() };
    });
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    headings.forEach((el) => observer.observe(el));
    requestAnimationFrame(() => {
      setSections(found);
      setActiveId(found[0]?.id ?? "");
    });
    return () => observer.disconnect();
  }, [pathname]);

  // 置顶按钮显隐
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const currentIndex = PAGES.findIndex((p) => p.href === pathname);

  return (
    <>
      {/* 右侧竖向：页内目录（横线） + 置顶按钮 */}
      <nav
        aria-label="页内目录"
        className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      >
        {sections.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              aria-label={`跳转到：${s.text}`}
              aria-current={isActive ? "true" : undefined}
              className="group flex items-center justify-end gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
              title={s.text}
            >
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap rounded-md text-xs text-slate-300 transition-all duration-200",
                  isActive
                    ? "max-w-[200px] opacity-100"
                    : "max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100",
                )}
              >
                <span className="glass rounded-md px-2 py-1">{s.text}</span>
              </span>
              <span
                className={cn(
                  "h-0.5 rounded-full transition-all duration-200",
                  isActive
                    ? "w-8 bg-gradient-to-r from-sky-400 to-cyan-400"
                    : "w-4 bg-white/25 group-hover:w-6 group-hover:bg-white/50",
                )}
              />
            </button>
          );
        })}
      </nav>

      {/* 右下角：置顶按钮 */}
      {showTop ? (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="回到顶部"
          className="glass fixed right-5 bottom-20 z-50 flex h-11 w-11 items-center justify-center rounded-full text-slate-300 shadow-lg shadow-black/30 transition hover:scale-110 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      ) : null}

      {/* 底部居中：章节圆点导航 */}
      <nav
        aria-label="章节导航"
        className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2"
      >
        <div className="glass flex items-center gap-3 rounded-full px-4 py-2.5 shadow-lg shadow-black/30">
          {PAGES.map((p, i) => {
            const isActive = p.href === pathname;
            return (
              <Link
                key={p.href}
                href={p.href}
                aria-label={`${i === 0 ? "书页" : i === 1 ? "时间线" : p.href === "/appendix" ? "证据附录" : `第 ${i - 1} 章`}：${p.label}`}
                title={p.label}
                className="group relative flex items-center justify-center"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-200",
                    isActive
                      ? "h-2.5 w-2.5 bg-gradient-to-br from-sky-400 to-cyan-400 shadow shadow-sky-500/40"
                      : "h-2 w-2 border border-white/40 bg-transparent group-hover:border-white group-hover:bg-white/20",
                  )}
                />
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <span className="glass rounded-md px-2 py-1 text-xs text-white">{p.label}</span>
                </span>
              </Link>
            );
          })}
        </div>
        {currentIndex >= 0 ? (
          <div className="mt-1.5 text-center text-[10px] text-slate-500">
            {currentIndex === 0
              ? "书页"
              : currentIndex === 1
                ? "全书时间线"
                : PAGES[currentIndex].href === "/appendix"
                  ? "证据附录"
                  : `第 ${currentIndex - 1} / ${chapters.filter((c) => c.meta.status !== "planned").length} 章`}
          </div>
        ) : null}
      </nav>
    </>
  );
}
