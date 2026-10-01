#!/usr/bin/env bash
# 渲染第 1 章讲解视频：自动检测旁白与配乐，全部就绪则混入音轨
set -euo pipefail
cd "$(dirname "$0")/.."

CH1_AUDIO=0
[ -f public/remotion-assets/ch1-narration.mp3 ] && CH1_AUDIO=1
CH1_MUSIC=0
[ -f public/remotion-assets/ch1-music.wav ] && CH1_MUSIC=1

if [ "$CH1_MUSIC" = 0 ]; then
  echo "▶ 生成背景音乐…"
  python3 scripts/music.py
  CH1_MUSIC=1
fi
echo "▶ 旁白：$([ "$CH1_AUDIO" = 1 ] && echo 已就绪 || echo 未生成（先跑 node scripts/tts.mjs）)· 配乐：已就绪"

REMOTION_CH1_AUDIO=$CH1_AUDIO REMOTION_CH1_MUSIC=$CH1_MUSIC \
  npx remotion render remotion/index.ts Ch1Turing public/videos/ch1-turing.mp4 --codec=h264
echo "✅ 输出：public/videos/ch1-turing.mp4"
