export type ChapterStatus = "published" | "draft" | "planned";

export type ChapterMeta = {
  order: number;
  volume: number;
  volumeTitle: string;
  title: string;
  subtitle?: string;
  slug: string;
  status: ChapterStatus;
  updated: string;
  minutes?: number;
  summary: string;
  sources: string[];
  evidence: string[];
};

export const VOLUMES = [
  { volume: 1, title: "智能的火种", range: "1950–2012" },
  { volume: 2, title: "语言模型找到了路", range: "2013–2022" },
  { volume: 3, title: "ChatGPT 与开放时代", range: "2022–2025" },
  { volume: 4, title: "模型动不了手", range: "2020–2026-10-01" },
] as const;

export function getVolumeTitle(volume: number): string {
  return VOLUMES.find((v) => v.volume === volume)?.title ?? "";
}
