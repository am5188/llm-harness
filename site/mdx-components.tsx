import type { ComponentType, JSX } from "react";

type MDXComponents = {
  [Tag in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[Tag]> | keyof JSX.IntrinsicElements;
};

// 全局 MDX 组件映射：让书内 markdown 自带排版
const components: MDXComponents = {
  h2: ({ children }) => (
    <h2 className="mt-16 mb-5 scroll-mt-24 text-2xl font-bold text-white md:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-10 mb-4 scroll-mt-24 text-xl font-semibold text-slate-100">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-5 leading-8 text-slate-300">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  a: ({ children, ...props }) => (
    <a
      {...props}
      className="text-sky-300 underline decoration-sky-500/40 underline-offset-4 transition hover:text-sky-200"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-5 list-disc space-y-2 pl-6 leading-8 text-slate-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 leading-8 text-slate-300">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="glass my-8 rounded-2xl border-l-4 border-sky-400/60 px-6 py-4 text-slate-200">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="glow-line my-12" />,
  code: ({ children }) => (
    <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-sm text-cyan-200">
      {children}
    </code>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
