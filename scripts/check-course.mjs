#!/usr/bin/env node
/**
 * 课程一致性检查：章节 manifest、证据卡片、本地来源和时间线引用。
 * 用法：node scripts/check-course.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteRoot = path.join(root, "site");
const manifest = fs.readFileSync(path.join(siteRoot, "src/content/chapters/manifest.ts"), "utf8");
const evidenceIndex = fs.readFileSync(path.join(root, "references/证据卡片索引.md"), "utf8");
const sourcesIndex = fs.readFileSync(path.join(root, "references/S-来源索引.md"), "utf8");
const timeline = fs.readFileSync(path.join(root, "timeline/00-大语言模型关键时间线.md"), "utf8");

const errors = [];
const warnings = [];
const cards = new Set(
  fs.readdirSync(path.join(root, "references"))
    .filter((file) => /^E-\d+.*\.md$/.test(file))
    .map((file) => file.match(/^(E-\d+)/)?.[1])
    .filter(Boolean),
);
const sources = new Set((sourcesIndex.match(/S-\d{4}/g) ?? []));
const manifestEvidence = [...manifest.matchAll(/evidence:\s*\[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/E-\d{4}/g)].map((x) => x[0]));
const manifestSources = [...manifest.matchAll(/sources:\s*\[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/S-\d{4}/g)].map((x) => x[0]));
const plannedCount = (manifest.match(/meta: PLANNED\(/g) ?? []).length;
const publishedCount = (manifest.match(/Component: Ch\d+/g) ?? []).length;

for (const id of manifestEvidence) {
  if (!cards.has(id)) errors.push(`manifest 引用了不存在的本地证据卡：${id}`);
}
for (const id of manifestSources) {
  if (!sources.has(id)) errors.push(`manifest 引用了未登记的来源：${id}`);
}
for (const id of [...new Set(manifestEvidence)]) {
  if (!evidenceIndex.includes(id)) warnings.push(`证据索引未出现 manifest 中的 ${id}`);
}
if (publishedCount + plannedCount !== 14) errors.push(`章节数量不是 14：published=${publishedCount}, planned=${plannedCount}`);
if (/五天一亿用户/.test(manifest)) errors.push("manifest 仍含未经证据支持的“五天一亿用户”说法");
if (!timeline.includes("E-0008") || !timeline.includes("E-0011")) errors.push("时间线缺少第一卷已完成证据绑定");

console.log(`章节：${publishedCount} published / ${plannedCount} planned`);
console.log(`本地证据卡：${cards.size}，来源登记：${sources.size}`);
for (const warning of warnings) console.warn(`WARN ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exit(1);
}
console.log("课程一致性检查通过。");
