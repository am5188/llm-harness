#!/usr/bin/env bash
# 生成并渲染第 1 章 15 秒风格样片（不覆盖完整章节视频）
set -euo pipefail
cd "$(dirname "$0")/.."

EDGE_VOICE="${EDGE_VOICE:-zh-CN-XiaoxiaoNeural}" \
EDGE_TEXT=sample \
EDGE_OUTPUT=ch1-sample-narration.mp3 \
EDGE_ALIGNMENT_OUTPUT=ch1-sample-alignment.json \
node scripts/tts.mjs

OUTPUT="public/videos/ch1-turing.mp4"
npx remotion render remotion/index.ts Ch1StyleSample "$OUTPUT" --codec=h264
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_type,codec_name -of default=noprint_wrappers=1 "$OUTPUT"
printf '✅ 已替换正式第1章视频：%s\n' "$OUTPUT"
