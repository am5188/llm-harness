import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { chapters, getChapter } from "@/content/chapters/manifest";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";

export function generateStaticParams() {
  return chapters
    .filter((c) => c.meta.status !== "planned")
    .map((c) => ({ slug: c.meta.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getChapter(slug);
  if (!entry) return {};
  return {
    title: `${entry.meta.title} · 从图灵到 Harness`,
    description: entry.meta.summary,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getChapter(slug);
  if (!entry || !entry.Component) notFound();

  const { meta, Component } = entry;
  const published = chapters.filter((c) => c.meta.status !== "planned");
  const idx = published.findIndex((c) => c.meta.slug === slug);
  const prev = idx > 0 ? published[idx - 1] : null;
  const next = idx >= 0 && idx < published.length - 1 ? published[idx + 1] : null;

  return (
    <>
      <SiteHeader pageLabel={meta.title} backHref="/" />
      <main className="flex-1">
        {/* 章首 */}
        <section className="mx-auto max-w-3xl px-5 pt-16 pb-8 md:pt-24">
          <Reveal>
            <div className="mb-4 flex items-center gap-3">
              <span className="glass rounded-full px-3 py-1 text-xs text-sky-300">
                卷{["一", "二", "三", "四"][meta.volume - 1]} · {meta.volumeTitle}
              </span>
              <span className="text-xs text-slate-500">{meta.minutes ? `${meta.minutes} 分钟` : ""} · 更新于 {meta.updated}</span>
            </div>
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">{meta.title}</h1>
            {meta.subtitle ? <p className="mt-3 text-base text-slate-400">{meta.subtitle}</p> : null}
            <div className="glow-line mt-8" />
          </Reveal>
        </section>

        {/* 正文 */}
        <article className="mx-auto max-w-3xl px-5 pb-16">
          <Component />
        </article>

        {/* 上/下章 */}
        <section className="mx-auto max-w-3xl px-5 pb-24">
          <div className="glass flex flex-col gap-4 rounded-3xl p-6 md:flex-row md:items-center md:justify-between">
            {prev ? (
              <Link href={`/chapters/${prev.meta.slug}`} className="group text-sm text-slate-400 transition hover:text-white">
                <div className="text-xs text-slate-600">← 上一章</div>
                <div className="font-semibold text-slate-200 group-hover:text-sky-200">{prev.meta.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/chapters/${next.meta.slug}`}
                className="group rounded-2xl bg-gradient-to-r from-sky-500/20 to-cyan-500/20 px-5 py-4 text-right transition hover:from-sky-500/30 hover:to-cyan-500/30"
              >
                <div className="text-xs text-sky-300/70">继续往下看 ↓</div>
                <div className="font-semibold text-white group-hover:text-sky-200">{next.meta.title}</div>
              </Link>
            ) : (
              <Link
                href="/appendix"
                className="group rounded-2xl bg-gradient-to-r from-sky-500/20 to-cyan-500/20 px-5 py-4 text-right transition hover:from-sky-500/30 hover:to-cyan-500/30"
              >
                <div className="text-xs text-sky-300/70">继续 ↓</div>
                <div className="font-semibold text-white group-hover:text-sky-200">证据附录</div>
              </Link>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
