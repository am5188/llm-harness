const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/llm-harness";

type ChapterVideoProps = {
  src: string;
  title?: string;
};

/** 章节讲解视频（Remotion 生成，构建时静态托管） */
export function ChapterVideo({ src, title }: ChapterVideoProps) {
  const fullSrc = `${BASE_PATH}${src}`;
  return (
    <figure className="glass my-10 overflow-hidden rounded-3xl">
      <video
        controls
        preload="metadata"
        playsInline
        className="aspect-video w-full bg-black"
        aria-label={title ?? "章节讲解视频"}
      >
        <source src={fullSrc} type="video/mp4" />
        你的浏览器不支持视频播放。
      </video>
      {title ? (
        <figcaption className="px-5 py-3 text-center text-xs text-slate-500">{title}</figcaption>
      ) : null}
    </figure>
  );
}
