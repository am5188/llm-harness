import type { EvidenceCard } from "@/lib/evidence";
import { getSource, type SourceGrade } from "@/lib/sources";
import { GradeBadge } from "@/components/cite";

const FIELD_ORDER = ["事件类型", "事实", "影响", "与时间线的关系", "原文定位", "待核查"] as const;

function extractGrade(text: string): SourceGrade | undefined {
  const m = text.match(/[（(]([ABC])[）)]/);
  return m ? (m[1] as SourceGrade) : undefined;
}

function extractSourceIds(text: string): string[] {
  return Array.from(text.matchAll(/S-\d{4}/g)).map((m) => m[0]);
}

export function EvidenceCardView({ card }: { card: EvidenceCard }) {
  const grade = extractGrade(card.fields["证据"] ?? "");
  const sourceIds = extractSourceIds(card.fields["证据"] ?? "");
  return (
    <article id={card.id} className="glass scroll-mt-24 rounded-3xl p-6 md:p-8">
      <header className="mb-5 flex flex-wrap items-baseline gap-3">
        <h2 className="text-xl font-bold text-white">
          {card.id}｜{card.title}
        </h2>
        {grade ? <GradeBadge grade={grade} /> : null}
      </header>
      {card.heading ? (
        <p className="mb-4 text-sm font-medium text-sky-300">{card.heading}</p>
      ) : null}
      <dl className="space-y-4">
        {FIELD_ORDER.filter((k) => card.fields[k]).map((key) => (
          <div key={key}>
            <dt className="mb-1 text-xs font-semibold tracking-wide text-slate-400">{key}</dt>
            <dd className="text-sm leading-7 text-slate-300">{card.fields[key]}</dd>
          </div>
        ))}
        {sourceIds.length > 0 ? (
          <div>
            <dt className="mb-1 text-xs font-semibold tracking-wide text-slate-400">来源登记</dt>
            <dd className="space-y-1">
              {sourceIds.map((id) => {
                const s = getSource(id);
                return s ? (
                  <div key={id} className="text-sm text-slate-300">
                    <span className="text-cyan-300">{id}</span> · {s.title}
                    {s.authors ? `（${s.authors}）` : ""}
                    {s.url ? (
                      <>
                        {" "}
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-xs text-sky-400 hover:text-sky-300"
                        >
                          {s.url}
                        </a>
                      </>
                    ) : null}
                  </div>
                ) : null;
              })}
            </dd>
          </div>
        ) : null}
        {card.fields["来源"] ? (
          <div>
            <dt className="mb-1 text-xs font-semibold tracking-wide text-slate-400">来源原文</dt>
            <dd className="break-all text-sm leading-7 text-slate-300">{card.fields["来源"]}</dd>
          </div>
        ) : null}
        {card.fields["访问日期"] ? (
          <div>
            <dt className="mb-1 text-xs font-semibold tracking-wide text-slate-400">访问日期</dt>
            <dd className="text-sm text-slate-300">{card.fields["访问日期"]}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
