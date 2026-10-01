#!/usr/bin/env bash
# 渲染第 1 章讲解视频；若已生成 TTS 旁白则一并混入音轨
set -euo pipefail
cd "$(dirname "$0")/.."

CH1_AUDIO=0
[ -f public/remotion-assets/ch1-narration.mp3 ] && CH1_AUDIO=1
echo "▶ 旁白音频：$([ "$CH1_AUDIO" = 1 ] && echo 已就绪 || echo 未生成（先跑 node scripts/tts.mjs）)"

REMOTION_CH1_AUDIO=$CH1_AUDIO npx remotion render remotion/index.ts Ch1Turing public/videos/ch1-turing.mp4 --codec=h264
echo "✅ 输出：public/videos/ch1-turing.mp4"
