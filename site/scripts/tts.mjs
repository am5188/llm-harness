#!/usr/bin/env node
/**
 * 用 Edge-TTS（微软神经网络中文音色，免费、无需 API Key）生成旁白与字符级时间戳。
 *
 * 输入：remotion/ch1-narration.ts 的旁白稿（本脚本内联复制其拼接文本）
 * 输出：
 *   - public/remotion-assets/ch1-narration.mp3（渲染期输入，已 gitignore）
 *   - remotion/assets/ch1-alignment.json（时间戳，提交进仓库供合成导入）
 *
 * 用法：
 *   node scripts/tts.mjs
 *   EDGE_VOICE=zh-CN-XiaoxiaoNeural node scripts/tts.mjs   # 换音色（默认云希男声）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const VOICE = process.env.EDGE_VOICE ?? "zh-CN-YunxiNeural";
const SAMPLE_TEXT = "你觉得，机器会思考吗？1950年，图灵也问过这个问题。但他很快发现——原问题太难直接回答。所以，他换了一个问法：隔着文字，你能分辨出它是人，还是机器吗？";
const isSample = process.env.EDGE_TEXT === "sample";
const outputName = process.env.EDGE_OUTPUT ?? "ch1-narration.mp3";
const alignmentName = process.env.EDGE_ALIGNMENT_OUTPUT ?? "ch1-alignment.json";
const FULL_TEXT = isSample
  ? SAMPLE_TEXT
  : "机器能思考吗？1950年，图灵在《心灵》期刊上提出了这个著名的问题。" +
    "但他马上承认，这个问题没法直接回答：思考和机器的含义太模糊，讨论只会变成关于定义的争吵。" +
    "于是，他借用了英国客厅里的一个派对游戏：询问者隔着文字，判断两个人谁是男人、谁是女人。" +
    "然后，图灵做了一个置换：把其中一个角色换成机器。如果询问者还是分不出来，机器不能思考就不再是显然的结论。" +
    "这一步的精妙之处在于：智能从一个哲学问题，变成了可观察的语言行为。" +
    "图灵甚至提出，与其编程成年人的思维，不如模拟儿童的大脑，让它学习。但1950年没有数据、没有算力，也没有可扩展的学习方法。" +
    "目标有了，路径还没有。接下来的七十年，就是这条路被一点一点铺出来的故事。";

const TICK = 10_000_000; // 100ns → 秒

async function main() {
  console.log(`▶ 请求 Edge-TTS（${VOICE}，${FULL_TEXT.length} 字）…`);
  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, {
    wordBoundaryEnabled: true,
  });
  const tmpDir = fs.mkdtempSync(path.join(ROOT, ".tts-"));
  const { audioFilePath, metadataFilePath } = await tts.toFile(tmpDir, FULL_TEXT);

  const audioPath = path.join(ROOT, "public", "remotion-assets", outputName);
  fs.mkdirSync(path.dirname(audioPath), { recursive: true });
  fs.copyFileSync(audioFilePath, audioPath);
  console.log(`✅ 音频：${audioPath}（${(fs.statSync(audioPath).size / 1024).toFixed(0)} KB）`);

  // 解析 WordBoundary 元数据 → 字符级时间戳
  const metaRaw = fs.readFileSync(metadataFilePath, "utf8");
  const metaObj = JSON.parse(metaRaw);
  const entries = Array.isArray(metaObj) ? metaObj : metaObj.Metadata ?? [];
  const boundaries = [];
  for (const obj of entries) {
    if (obj.Type === "WordBoundary" && obj.Data?.text?.Text) {
      boundaries.push({
        offset: obj.Data.Offset / TICK,
        duration: obj.Data.Duration / TICK,
        text: obj.Data.text.Text,
      });
    }
  }
  if (boundaries.length === 0) {
    console.error("未解析到 WordBoundary 元数据");
    process.exit(1);
  }

  const characters = [];
  const starts = [];
  const ends = [];
  let pos = 0;
  for (const b of boundaries) {
    const len = Math.max(1, b.text.length);
    for (let i = 0; i < len && pos < FULL_TEXT.length; i++, pos++) {
      characters.push(FULL_TEXT[pos]);
      starts.push(b.offset + (b.duration * i) / len);
      ends.push(b.offset + (b.duration * (i + 1)) / len);
    }
  }
  // 补尾（若有边界未覆盖的字符）
  while (pos < FULL_TEXT.length) {
    const last = ends[ends.length - 1] ?? 0;
    characters.push(FULL_TEXT[pos++]);
    starts.push(last);
    ends.push(last + 0.2);
  }

  const alignPath = path.join(ROOT, "remotion", "assets", alignmentName);
  fs.mkdirSync(path.dirname(alignPath), { recursive: true });
  fs.writeFileSync(
    alignPath,
    JSON.stringify({ characters, character_start_times_seconds: starts, character_end_times_seconds: ends }, null, 2),
  );
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log(`✅ 时间戳：${alignPath}（${characters.length} 字符，${boundaries.length} 个词边界）`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
