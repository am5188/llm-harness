import Link from "next/link";
import { BookOpen, Clock, FlaskConical } from "lucide-react";
import { chapters } from "@/content/chapters/manifest";
import { VOLUMES } from "@/lib/chapters";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  const published = chapters.filter((c) => c.meta.status === "published");
  return (
    <>
      <SiteHeader pageLabel="书页" />
      <main className="flex-1">
        {/* 封面 */}
        <section className="mx-auto max-w-5xl px-5 pt-24 pb-16 text-center md:pt-32">
          <Reveal>
            <p className="mb-4 text-sm tracking-[0.3em] text-sky-300/80">前置课 · LLM 发展史</p>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
              从<span className="text-gradient">图灵</span>到<span className="text-gradient">Harness</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
              大语言模型的前世今生。1950 年，图灵问机器能不能思考；2022 年，ChatGPT 让全世界第一次用上它；今天，我们为它装上手脚——那套系统叫 Harness。
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={`/chapters/${chapters[0].meta.slug}`}
                className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:scale-105"
              >
                <BookOpen className="mr-2 inline h-4 w-4" />
                从第 1 章开始读
              </Link>
              <Link
                href="/timeline"
                className="glass rounded-full px-7 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                先看全书时间线
              </Link>
            </div>
          </Reveal>
        </section>

        {/* 目录 */}
        <section className="mx-auto max-w-5xl px-5 pb-24">
          {VOLUMES.map((vol, vi) => {
            const volChapters = chapters.filter((c) => c.meta.volume === vol.volume);
            return (
              <Reveal key={vol.volume} delay={vi * 80}>
                <div className="mb-14">
                  <div className="mb-5 flex items-baseline gap-3">
                    <h2 className="text-2xl font-bold text-white">
                      {["①", "②", "③", "④"][vol.volume - 1]} {vol.title}
                    </h2>
                    <span className="text-sm text-slate-500">{vol.range}</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {volChapters.map((c) => {
                      const isPublished = c.meta.status === "published";
                      return (
                        <Link
                          key={c.meta.slug}
                          href={isPublished ? `/chapters/${c.meta.slug}` : "/timeline"}
                          aria-disabled={!isPublished}
                          className={
                            isPublished
                              ? "glass group rounded-2xl p-5 transition hover:border-sky-400/30 hover:bg-white/5"
                              : "glass rounded-2xl p-5 opacity-50"
                          }
                        >
                          <div className="mb-1.5 text-xs text-slate-500">
                            {isPublished ? `已发布 · ${c.meta.minutes ?? "?"} 分钟` : "研究中"}
                          </div>
                          <div className="font-semibold text-white group-hover:text-sky-200">
                            {c.meta.title}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{c.meta.summary}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            );
          })}

          {/* 阅读路线 */}
          <Reveal>
            <div className="glass mb-14 rounded-3xl p-6 md:p-8">
              <h2 className="mb-4 text-xl font-bold text-white">这本书怎么读</h2>
              <div className="grid gap-4 text-sm leading-7 text-slate-300 md:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <BookOpen className="mb-2 h-5 w-5 text-sky-300" />
                  <p className="font-semibold text-white">顺着故事读</p>
                  <p className="mt-1 text-slate-400">每章讲清一个问题：当时卡在哪、谁解决了什么、代价是什么。</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <FlaskConical className="mb-2 h-5 w-5 text-cyan-300" />
                  <p className="font-semibold text-white">脚注随时查证</p>
                  <p className="mt-1 text-slate-400">
                    关键事实都带脚注：悬停可见来源、原文定位与证据等级（A 一手 / B 二手 / C 线索）。
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <Clock className="mb-2 h-5 w-5 text-emerald-300" />
                  <p className="font-semibold text-white">读完交接主课</p>
                  <p className="mt-1 text-slate-400">
                    最后一章会说明为什么模型动不了手——然后去主课学怎么给它装上手脚。
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* 主课 CTA */}
          <Reveal>
            <div className="mb-14 rounded-3xl bg-gradient-to-r from-sky-500/15 to-purple-500/15 p-8 text-center">
              <p className="text-sm text-slate-400">已读完历史？继续学工程——</p>
              <a
                href="https://am5188.github.io/harness-guide/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xl font-bold text-white transition hover:text-sky-200"
              >
                主课：Agent Harness 工程图解指南 →
              </a>
              <p className="mt-2 text-xs text-slate-500">AI 会思考，但它动不了手。给它装上手脚的那套系统，就叫 Harness。</p>
            </div>
          </Reveal>

          <p className="pb-4 text-center text-xs text-slate-600">
            已发布 {published.length} / {chapters.length} 章 · 内容持续更新至 2026-10-01 的知识截止线
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
