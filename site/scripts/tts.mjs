#!/usr/bin/env node
/**
 * 用 ElevenLabs with-timestamps API 生成旁白音频与字符级时间戳。
 *
 * 输入：remotion/ch1-narration.ts 里的旁白稿（本脚本内联复制其拼接文本）
 * 输出：
 *   - public/remotion-assets/ch1-narration.mp3（渲染期输入，已 gitignore）
 *   - remotion/assets/ch1-alignment.json（时间戳，提交进仓库供合成导入）
 *
 * 用法：
 *   export ELEVENLABS_API_KEY=...        # 必填
 *   export ELEVENLABS_VOICE_ID=...       # 可选，默认见下
 *   node scripts/tts.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const API_KEY = process.env.ELEVENLABS_API_KEY;
// 中文男声示例（可在 https://elevenlabs.io/app/voice-library 挑选后覆盖）
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB";

if (!API_KEY) {
  console.error("缺少 ELEVENLABS_API_KEY 环境变量。");
  process.exit(1);
}

// 与 remotion/ch1-narration.ts 保持同步
const FULL_TEXT =
  "机器能思考吗？1950年，图灵在《心灵》期刊上提出了这个著名的问题。" +
  "但他马上承认，这个问题没法直接回答：思考和机器的含义太模糊，讨论只会变成关于定义的争吵。" +
  "于是，他借用了英国客厅里的一个派对游戏：询问者隔着文字，判断两个人谁是男人、谁是女人。" +
  "然后，图灵做了一个置换：把其中一个角色换成机器。如果询问者还是分不出来，机器不能思考就不再是显然的结论。" +
  "这一步的精妙之处在于：智能从一个哲学问题，变成了可观察的语言行为。" +
  "图灵甚至提出，与其编程成年人的思维，不如模拟儿童的大脑，让它学习。但1950年没有数据、没有算力，也没有可扩展的学习方法。" +
  "目标有了，路径还没有。接下来的七十年，就是这条路被一点一点铺出来的故事。";

async function main() {
  console.log(`▶ 请求 TTS（${FULL_TEXT.length} 字）…`);
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: FULL_TEXT,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
      }),
    },
  );
  if (!res.ok) {
    console.error(`TTS 失败：HTTP ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const data = await res.json();

  // 优先用原始 alignment（汉字与时间戳对应）；normalized 是发音层面的拼音化表示
  const alignment = data.alignment ?? data.normalized_alignment;
  console.log(`原始 alignment 前 40 字符：${(alignment.characters ?? []).slice(0, 40).join("")}`);
  const normalized = data.normalized_alignment;
  if (normalized) {
    console.log(`归一化 alignment 前 40 字符：${normalized.characters.slice(0, 40).join("")}`);
  }

  const audioBuf = Buffer.from(data.audio_base64, "base64");
  const audioPath = path.join(ROOT, "public", "remotion-assets", "ch1-narration.mp3");
  fs.mkdirSync(path.dirname(audioPath), { recursive: true });
  fs.writeFileSync(audioPath, audioBuf);
  console.log(`✅ 音频：${audioPath}（${(audioBuf.length / 1024).toFixed(0)} KB）`);

  const alignPath = path.join(ROOT, "remotion", "assets", "ch1-alignment.json");
  fs.mkdirSync(path.dirname(alignPath), { recursive: true });
  fs.writeFileSync(alignPath, JSON.stringify(alignment, null, 2));
  console.log(`✅ 时间戳：${alignPath}（${alignment.characters.length} 字符）`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
