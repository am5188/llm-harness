import type { Metadata } from "next";
import { BookTimeline } from "@/components/book-timeline";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "全书时间线 · 从图灵到 Harness",
  description: "1950 图灵之问到 2026 年 Agent 与 Harness 的关键时间线。",
};

export default function TimelinePage() {
  return (
    <>
      <SiteHeader pageLabel="时间线" backHref="/" />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-5 pt-16 pb-6 md:pt-24">
          <Reveal>
            <h1 className="text-3xl font-bold text-white md:text-4xl">全书时间线</h1>
            <p className="mt-4 max-w-2xl leading-8 text-slate-400">
              时间线只是骨架，解释才是书的正文。切到「十八个节点」看关键事件，点节点可跳转到对应章节与证据卡。
            </p>
          </Reveal>
        </section>
        <section className="mx-auto max-w-5xl px-5 pb-24">
          <Reveal>
            <BookTimeline />
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
