import fs from "node:fs";
import path from "node:path";

export type EvidenceCard = {
  id: string;
  title: string;
  heading: string;
  fields: Record<string, string>;
};

// 构建期从仓库根 references/ 读取证据卡（站点在 site/ 子目录，cwd 为 site/）
const CARDS_DIR = path.join(process.cwd(), "..", "references");

function parseCard(content: string): EvidenceCard | null {
  const lines = content.split("\n");
  const first = lines.find((l) => l.startsWith("# "));
  if (!first) return null;
  const match = first.match(/^#\s+(E-\d+)｜(.+)$/);
  if (!match) return null;

  const fields: Record<string, string> = {};
  let currentKey: string | null = null;
  for (const line of lines) {
    const kv = line.match(/^-\s+\*\*(.+?)\*\*[：:]\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      fields[currentKey] = kv[2];
    } else if (currentKey && line.trim() && line.startsWith("- ")) {
      fields[currentKey] += " " + line.trim().replace(/^- /, "");
    }
  }

  const headingMatch = lines.find((l) => l.startsWith("### "));
  return {
    id: match[1],
    title: match[2],
    heading: headingMatch?.replace(/^###\s+/, "") ?? "",
    fields,
  };
}

export function getEvidenceCards(): EvidenceCard[] {
  const cards: EvidenceCard[] = [];
  let files: string[] = [];
  try {
    files = fs.readdirSync(CARDS_DIR).filter((f) => /^E-\d+.*\.md$/.test(f)).sort();
  } catch {
    console.warn(`[evidence] 未找到证据卡目录：${CARDS_DIR}`);
    return cards;
  }
  for (const file of files) {
    try {
      const card = parseCard(fs.readFileSync(path.join(CARDS_DIR, file), "utf8"));
      if (card) cards.push(card);
      else console.warn(`[evidence] 解析失败，跳过：${file}`);
    } catch (e) {
      console.warn(`[evidence] 读取失败，跳过：${file}（${e}）`);
    }
  }
  return cards;
}
