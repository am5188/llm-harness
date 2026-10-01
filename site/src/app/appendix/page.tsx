import type { Metadata } from "next";
import { getEvidenceCards } from "@/lib/evidence";
import { EvidenceCardView } from "@/components/evidence-card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "证据附录 · 从图灵到 Harness",
  description: "全书的证据卡片：每条关键事实的来源、原文定位与证据等级。",
};

export default function AppendixPage() {
  const cards = getEvidenceCards();

  return (
    <>
      <SiteHeader pageLabel="证据附录" backHref="/" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pt-16 pb-10 md:pt-24">
          <Reveal>
            <h1 className="text-3xl font-bold text-white md:text-4xl">证据附录</h1>
            <p className="mt-4 leading-8 text-slate-400">
              书里每条关键事实都指向这里。证据分三级：<span className="text-emerald-300">A 一手来源</span>
              （论文、公告、监管文件、访谈原文）、<span className="text-sky-300">B 高质量二手来源</span>
              （学术综述、专业调查报道）、<span className="text-slate-400">C 线索来源</span>
              （博客、百科，仅用于定位）。关键事实至少需要一条 A 级来源；事实、解释与推测严格分开。
            </p>
            <div className="glow-line mt-8" />
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl space-y-8 px-5 pb-24">
          {cards.length === 0 ? (
            <div className="glass rounded-3xl p-8 text-center text-slate-400">
              证据卡片尚未生成。
            </div>
          ) : (
            cards.map((card, i) => (
              <Reveal key={card.id} delay={Math.min(i, 4) * 60}>
                <EvidenceCardView card={card} />
              </Reveal>
            ))
          )}
          <p className="pt-4 text-center text-xs text-slate-600">
            证据规范与卡片档案见仓库{" "}
            <a
              href="https://github.com/am5188/llm-harness"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300"
            >
              am5188/llm-harness
            </a>{" "}
            的 references/ 目录
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
