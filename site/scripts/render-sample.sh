#!/usr/bin/env bash
# 生成并渲染第 1 章 15 秒风格样片（不覆盖完整章节视频）
set -euo pipefail
cd "$(dirname "$0")/.."

EDGE_VOICE="${EDGE_VOICE:-zh-CN-XiaoxiaoNeural}" \
EDGE_TEXT=sample \
EDGE_OUTPUT=ch1-sample-narration.mp3 \
EDGE_ALIGNMENT_OUTPUT=ch1-sample-alignment.json \
node scripts/tts.mjs

npx remotion render remotion/index.ts Ch1StyleSample /tmp/ch1-style-sample.mp4 --codec=h264
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_type,codec_name -of default=noprint_wrappers=1 /tmp/ch1-style-sample.mp4
printf '✅ 样片：/tmp/ch1-style-sample.mp4\n'
