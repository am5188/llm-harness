"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type StepperItem = {
  date: string;
  title: string;
  text: string;
};

export function HistoryStepper({ items }: { items: StepperItem[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="glass my-8 rounded-3xl p-6 md:p-8">
      <h3 className="mb-6 text-lg font-bold text-white">这一路走来</h3>
      <div className="mb-6 flex items-center gap-1">
        {items.map((item, i) => (
          <button
            key={item.date}
            type="button"
            onClick={() => setActive(i)}
            aria-label={item.title}
            className={cn(
              "flex-1 rounded-full py-1 text-center text-xs transition",
              i === active
                ? "bg-gradient-to-r from-sky-500 to-cyan-500 font-semibold text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10",
            )}
          >
            {item.date}
          </button>
        ))}
      </div>
      <div className="rounded-2xl bg-white/5 p-5">
        <div className="mb-2 text-xs font-semibold text-sky-300">{items[active].title}</div>
        <p className="text-sm leading-7 text-slate-300">{items[active].text}</p>
      </div>
    </div>
  );
}
