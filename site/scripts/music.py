#!/usr/bin/env python3
"""为第 1 章视频合成低调环境配乐（Am-F-C-G 进行，正弦铺底 + 琶音拨弦）。
纯标准库实现。输出：public/remotion-assets/ch1-music.wav（gitignore，不入库）"""
import math
import os
import struct
import wave
from array import array

SR = 44100
DUR = 82.0
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "remotion-assets", "ch1-music.wav")

CHORDS = [
    [110.0, 164.81, 220.0, 261.63, 329.63],  # Am
    [87.31, 130.81, 174.61, 220.0, 261.63],   # F
    [130.81, 164.81, 196.0, 261.63, 329.63],  # C
    [98.0, 146.83, 196.0, 246.94, 293.66],    # G
]
CHORD_DUR = 8.0

N = int(SR * DUR)
mix = array("f", [0.0]) * N


def add(sig, i0):
    n = len(sig)
    if i0 + n > N:
        n = N - i0
        sig = sig[:n]
    for k in range(n):
        mix[i0 + k] += sig[k]


chord_idx = 0
while chord_idx * CHORD_DUR < DUR:
    start = chord_idx * CHORD_DUR
    end = min(start + CHORD_DUR, DUR)
    i0, i1 = int(start * SR), int(end * SR)
    seg_len = i1 - i0
    freqs = CHORDS[chord_idx % len(CHORDS)]

    env = [1.0] * seg_len
    a = int(2.0 * SR)
    r = int(2.0 * SR)
    if a < seg_len:
        for k in range(a):
            env[k] = k / a
    if r < seg_len:
        for k in range(r):
            env[seg_len - r + k] = 1.0 - k / r

    # 铺底
    for f in freqs[0:1]:
        add([0.16 * env[k] * math.sin(2 * math.pi * f * k / SR) for k in range(seg_len)], i0)
    for f in freqs[2:]:
        add([0.045 * env[k] * math.sin(2 * math.pi * f * k / SR) for k in range(seg_len)], i0)
        add([0.04 * env[k] * math.sin(2 * math.pi * f * 1.003 * k / SR) for k in range(seg_len)], i0)

    # 琶音拨弦
    for b in range(int(CHORD_DUR / 0.5)):
        pt = start + b * 0.5
        p0 = int(pt * SR)
        plen = int(1.2 * SR)
        f = freqs[2 + (b % 3)] * 2
        w = 2 * math.pi * f / SR
        decay = math.exp(-1.0 / (0.22 * SR))
        add([0.055 * math.sin(w * k) * decay**k for k in range(plen)], p0)
    chord_idx += 1

# 淡入淡出 + 压到旁白之下
fade = int(3.0 * SR)
peak = max(abs(v) for v in mix) or 1.0
gain = 0.32 / peak
for k in range(N):
    v = mix[k] * gain
    if k < fade:
        v *= k / fade
    elif k >= N - fade:
        v *= (N - k) / fade
    mix[k] = v

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with wave.open(OUT, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = b"".join(struct.pack("<h", int(max(-1.0, min(1.0, v)) * 32767)) for v in mix)
    w.writeframes(frames)
print(f"✅ 配乐：{OUT}（{DUR:.0f} 秒）")
