import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";
import alignmentData from "./assets/ch1-alignment.json";
import { SEGMENTS } from "./ch1-narration";

const { fontFamily } = loadFont();

const FPS = 30;

// —— 调色板弧：奶油 → 深海蓝 → 机器紫 → 警报红 → 青 ——
const CREAM = "#f2e2bd";
const NAVY = "#0a1a33";
const SKY = "#38bdf8";
const VIOLET = "#8b5cf6";
const RED = "#f87171";
const CYAN = "#22d3ee";
const TEXT = "#e2e8f0";
const DIM = "#8ea3c0";

// —— 确定性随机（每帧是时间的纯函数）——
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// —— 旁白时间戳 → 场景时间轴 ——
type Alignment = { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
const ALIGN = alignmentData as unknown as Alignment;

type SegTiming = { start: number; end: number; chars: string[]; starts: number[]; ends: number[] };

function computeTimings(): SegTiming[] {
  if (ALIGN.characters.length > 0) {
    const full = ALIGN.characters.join("");
    const out: SegTiming[] = [];
    let pos = 0;
    for (const seg of SEGMENTS) {
      const idx = full.indexOf(seg.text, pos);
      if (idx >= 0) {
        out.push({
          start: ALIGN.character_start_times_seconds[idx],
          end: ALIGN.character_end_times_seconds[idx + seg.text.length - 1],
          chars: ALIGN.characters.slice(idx, idx + seg.text.length),
          starts: ALIGN.character_start_times_seconds.slice(idx, idx + seg.text.length),
          ends: ALIGN.character_end_times_seconds.slice(idx, idx + seg.text.length),
        });
        pos = idx + seg.text.length;
      }
    }
    if (out.length === SEGMENTS.length) return out;
  }
  // 无旁白时回退：按字数估计时长
  let t = 0.8;
  return SEGMENTS.map((s) => {
    const d = s.text.length * 0.24 + 0.6;
    const r: SegTiming = { start: t, end: t + d, chars: [...s.text], starts: [], ends: [] };
    t = r.end + 0.2;
    return r;
  });
}

const TIMINGS = computeTimings();
const TOTAL_SECONDS = TIMINGS[TIMINGS.length - 1].end + 2.5;
export const CH1_TOTAL_FRAMES = Math.ceil(TOTAL_SECONDS * FPS);

// 是否已有 TTS 旁白音频（REMOTION_ 前缀变量由 Remotion 在打包时内联）
const HAS_AUDIO = process.env.REMOTION_CH1_AUDIO === "1";

const EASE_OUT = Easing.out(Easing.cubic);

// —— 字幕 ——
function Caption({ seg }: { seg: SegTiming }) {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const localT = t - seg.start;
  let active = 0;
  if (seg.starts.length > 0) {
    active = seg.starts.findIndex((s, i) => localT >= s - seg.start && localT < (seg.ends[i] ?? s + 0.3) - seg.start);
    if (active < 0) active = seg.chars.length - 1;
  } else {
    active = Math.floor(localT / 0.24);
    if (active >= seg.chars.length) active = seg.chars.length - 1;
  }
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 72 }}>
      <div style={{ opacity: fadeIn, display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 1500, padding: "16px 30px", borderRadius: 18, background: "rgba(4,10,20,0.55)", fontFamily, fontSize: 40, lineHeight: 1.55 }}>
        {seg.chars.map((c, i) => (
          <span key={i} style={{ color: i === active ? CYAN : TEXT, fontWeight: i === active ? 700 : 400, transition: "color 60ms" }}>
            {c === " " ? " " : c}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// —— 场景 1：星尘与 1950 ——
function Scene1() {
  const frame = useCurrentFrame();
  const rand = mulberry32(7);
  const stars = Array.from({ length: 90 }, () => ({ x: rand() * 1920, y: rand() * 1080, s: 1 + rand() * 2.4, v: 0.1 + rand() * 0.5 }));
  const bg = `linear-gradient(180deg, ${CREAM} 0%, #0a1a33 78%)`;
  const rise = spring({ frame, fps: FPS, config: { damping: 16, stiffness: 60 } });
  return (
    <AbsoluteFill style={{ background: bg, fontFamily }}>
      {stars.map((st, i) => (
        <div key={i} style={{ position: "absolute", left: st.x, top: (st.y + frame * st.v) % 1080, width: st.s, height: st.s, borderRadius: 999, background: "rgba(255,255,255,0.8)" }} />
      ))}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "radial-gradient(ellipse 60% 45% at 50% 42%, rgba(56,189,248,0.18), transparent)" }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `translateY(${(1 - rise) * 120}px)` }}>
        <div style={{ fontSize: 190, fontWeight: 700, color: TEXT, letterSpacing: 18, textShadow: "0 0 60px rgba(56,189,248,0.45)" }}>1950</div>
        <div style={{ marginTop: 26, fontSize: 40, color: "rgba(242,226,189,0.9)" }}>英国《Mind》期刊 · 一篇改变历史的论文</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// —— 场景 2：问号破碎 → 模仿游戏 ——
function Scene2() {
  const frame = useCurrentFrame();
  const rand = mulberry32(21);
  const shards = Array.from({ length: 46 }, () => ({ x: 960 + (rand() - 0.5) * 300, y: 470 + (rand() - 0.5) * 240, dx: (rand() - 0.5) * 900, dy: (rand() - 0.5) * 640, r: 2 + rand() * 7, rot: rand() * 360 }));
  const shatter = interpolate(frame, [0, 70], [0, 1], { extrapolateRight: "clamp", easing: EASE_OUT });
  const letters = ["模", "仿", "游", "戏"];
  return (
    <AbsoluteFill style={{ background: NAVY, fontFamily, overflow: "hidden" }}>
      {shards.map((p, i) => {
        const m = interpolate(frame, [8 + i * 1.2, 38 + i * 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
        return (
          <div key={i} style={{ position: "absolute", left: p.x + p.dx * m, top: p.y + p.dy * m, width: p.r, height: p.r, borderRadius: 2, background: "#c4d5f0", transform: `rotate(${p.rot * m}deg)`, opacity: 1 - m * 0.9 }} />
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {shatter === 0 ? (
          <div style={{ fontSize: 300, fontWeight: 700, color: "#c4d5f0", opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" }) }}>？</div>
        ) : null}
        <div style={{ display: "flex", gap: 60, opacity: interpolate(frame, [64, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT }) }}>
          {letters.map((c, i) => (
            <div key={c} style={{ fontSize: 150, fontWeight: 700, color: TEXT, transform: `translateY(${(1 - spring({ frame: frame - 70 - i * 8, fps: FPS, config: { damping: 13, stiffness: 90 } })) * -60}px) scale(${0.6 + 0.4 * spring({ frame: frame - 70 - i * 8, fps: FPS, config: { damping: 13, stiffness: 90 } })})`, textShadow: "0 0 46px rgba(56,189,248,0.5)" }}>{c}</div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// —— 几何头像（无特写人脸）——
function Avatar({ kind, size = 110 }: { kind: "asker" | "man" | "woman" | "machine"; size?: number }) {
  const base = { width: size, height: size, borderRadius: size / 2, position: "relative" as const };
  if (kind === "machine") {
    return (
      <div style={{ ...base, background: `linear-gradient(160deg, ${VIOLET}, #1e1145)`, border: "2px solid rgba(139,92,246,0.7)" }}>
        <div style={{ position: "absolute", top: -34, left: "50%", width: 4, height: 38, marginLeft: -2, background: VIOLET }} />
        <div style={{ position: "absolute", top: -40, left: "50%", width: 12, height: 12, marginLeft: -6, borderRadius: 999, background: CYAN, boxShadow: "0 0 18px #22d3ee" }} />
        <div style={{ position: "absolute", top: size * 0.34, left: size * 0.26, width: 12, height: 12, borderRadius: 999, background: CYAN, boxShadow: "0 0 12px #22d3ee" }} />
        <div style={{ position: "absolute", top: size * 0.34, left: size * 0.62, width: 12, height: 12, borderRadius: 999, background: CYAN, boxShadow: "0 0 12px #22d3ee" }} />
      </div>
    );
  }
  return (
    <div style={{ ...base, background: kind === "woman" ? "linear-gradient(160deg,#f9a8d4,#7c3aed)" : kind === "man" ? "linear-gradient(160deg,#6ee7b7,#0e7490)" : "linear-gradient(160deg,#7dd3fc,#1d4ed8)" }}>
      <div style={{ position: "absolute", top: -14, left: "50%", width: size * 0.66, height: size * 0.4, marginLeft: -size * 0.33, borderRadius: "999px 999px 0 0", background: kind === "woman" ? "#fce7f3" : kind === "man" ? "#164e63" : "#e0f2fe" }} />
      <div style={{ position: "absolute", top: size * 0.38, left: size * 0.28, width: 10, height: 10, borderRadius: 999, background: "#0a1a33" }} />
      <div style={{ position: "absolute", top: size * 0.38, left: size * 0.6, width: 10, height: 10, borderRadius: 999, background: "#0a1a33" }} />
    </div>
  );
}

function Bubble({ text, start, color, align }: { text: string; start: number; color: string; align: "left" | "right" }) {
  const frame = useCurrentFrame();
  const count = Math.floor(interpolate(frame, [start, start + text.length * 2.4], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const pop = spring({ frame: frame - start, fps: FPS, config: { damping: 12, stiffness: 160 } });
  return (
    <div style={{ alignSelf: align === "left" ? "flex-start" : "flex-end", marginTop: 18, padding: "16px 24px", borderRadius: 18, background: "rgba(255,255,255,0.09)", border: `1px solid ${color}55`, transform: `scale(${0.7 + 0.3 * pop})`, opacity: pop, fontFamily, fontSize: 34, color: "#e8eef8" }}>
      {text.slice(0, count)}
    </div>
  );
}

// —— 场景 3/4：派对游戏与置换 ——
function SceneGame({ flipAt }: { flipAt: number }) {
  const frame = useCurrentFrame();
  const enter = (d: number) => spring({ frame: frame - d, fps: FPS, config: { damping: 14, stiffness: 100 } });
  const flip = interpolate(frame, [flipAt, flipAt + 26], [0, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 55% at 50% 30%, #12294d, ${NAVY})`, fontFamily }}>
      <div style={{ position: "absolute", bottom: 0, width: "100%", height: 190, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.5))" }} />
      <AbsoluteFill style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 110 }}>
        {[
          { kind: "asker" as const, name: "询问者", color: SKY, delay: 10, x: 0 },
          { kind: "man" as const, name: "A · 男人", color: "#34d399", delay: 26, x: 0 },
        ].map((c) => (
          <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${(1 - enter(c.delay)) * 140}px)`, opacity: enter(c.delay) }}>
            <Avatar kind={c.kind} />
            <div style={{ marginTop: 16, fontSize: 30, fontWeight: 700, color: c.color }}>{c.name}</div>
          </div>
        ))}
        {/* B 卡：翻转置换 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", transform: `translateY(${(1 - enter(42)) * 140}px)`, opacity: enter(42), perspective: 900 }}>
          <div style={{ transform: `rotateY(${flip}deg)`, transformStyle: "preserve-3d", width: 150, height: 150, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
              <Avatar kind="woman" size={150} />
            </div>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <Avatar kind="machine" size={150} />
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 30, fontWeight: 700, color: flip > 90 ? VIOLET : "#f9a8d4" }}>{flip > 90 ? "B · 机器" : "B · 女人"}</div>
        </div>
      </AbsoluteFill>
      {/* 对话气泡 */}
      <div style={{ position: "absolute", left: 190, top: 190, display: "flex", flexDirection: "column" }}>
        <Bubble text="你的头发有多长？" start={34} color={SKY} align="left" />
      </div>
      <div style={{ position: "absolute", right: 190, top: 320, display: "flex", flexDirection: "column" }}>
        <Bubble text="我的头发是短发，大约 5 厘米。" start={88} color="#34d399" align="right" />
        <Bubble text="我的头发也是短发！真的。" start={150} color="#f9a8d4" align="right" />
      </div>
      {flip > 90 ? (
        <div style={{ position: "absolute", left: 190, top: 430, display: "flex", flexDirection: "column" }}>
          <Bubble text="请把我排除在这之外：我从来不会写诗。" start={flipAt + 30} color={VIOLET} align="left" />
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

// —— 场景 5：哲学问题 → 行为判据 ——
function Scene5() {
  const frame = useCurrentFrame();
  const rand = mulberry32(55);
  const stream = Array.from({ length: 60 }, () => ({ y: 420 + rand() * 240, d: 20 + rand() * 70, v: 6 + rand() * 9, r: 2 + rand() * 4 }));
  const tilt = spring({ frame, fps: FPS, config: { damping: 15, stiffness: 50 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #150d33, #0a1a33)", fontFamily }}>
      {/* 光流粒子 */}
      {stream.map((p, i) => {
        const x = interpolate(frame, [p.d, p.d + 130], [-80, 2000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <div key={i} style={{ position: "absolute", left: x, top: p.y, width: p.r, height: p.r, borderRadius: 999, background: CYAN, opacity: 0.5 + 0.5 * Math.sin(frame / 8 + i) }} />;
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 90 }}>
          <div style={{ fontSize: 58, fontWeight: 700, color: DIM, textDecoration: "line-through", opacity: 1 - tilt * 0.4 }}>哲学问题</div>
          <div style={{ fontSize: 80, color: CYAN, transform: `rotate(${(1 - tilt) * 14}deg)` }}>→</div>
          <div style={{ fontSize: 58, fontWeight: 700, color: TEXT, textShadow: `0 0 40px ${CYAN}88`, transform: `scale(${0.85 + 0.15 * tilt})` }}>行为判据</div>
        </div>
        <div style={{ marginTop: 70, fontSize: 36, color: DIM, opacity: interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp" }) }}>
          判断智能，先看它会不会用语言
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// —— 场景 6：三个空槽 + 儿童大脑 ——
function Scene6() {
  const frame = useCurrentFrame();
  const slots = ["数据", "算力", "方法"];
  const light = (i: number) => {
    const on = interpolate(frame, [30 + i * 34, 42 + i * 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const off = interpolate(frame, [52 + i * 34, 64 + i * 34], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return Math.max(0, on * (1 - off * 0.85));
  };
  const headIn = spring({ frame: frame - 150, fps: FPS, config: { damping: 16, stiffness: 60 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #2a0f14, #0a1a33)", fontFamily }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 60 }}>
        <div style={{ fontSize: 54, fontWeight: 700, color: TEXT }}>1950 年，三样东西都没有</div>
        <div style={{ display: "flex", gap: 60 }}>
          {slots.map((s, i) => (
            <div key={s} style={{ width: 260, padding: "34px 0", textAlign: "center", borderRadius: 22, border: `2px solid ${RED}55`, background: `rgba(248,113,113,${0.05 + 0.14 * light(i)})`, boxShadow: light(i) > 0 ? `0 0 ${40 * light(i)}px rgba(248,113,113,${0.5 * light(i)})` : "none", fontFamily, fontSize: 44, fontWeight: 700, color: light(i) > 0 ? "#fecaca" : "#5b6678" }}>
              {s}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 34, opacity: headIn, transform: `translateY(${(1 - headIn) * 60}px)` }}>
          <div style={{ width: 120, height: 120, borderRadius: "60% 60% 54% 54%", background: "linear-gradient(160deg,#f9a8d4,#f472b6)", boxShadow: "0 0 46px rgba(244,114,182,0.35)" }} />
          <div style={{ fontSize: 58, fontWeight: 700, color: "#f9a8d4" }}>儿童的大脑 + 学习</div>
        </div>
        <div style={{ fontSize: 36, color: DIM }}>图灵的愿景，比它可行的时间早了六十年</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// —— 场景 7：时间轴滚动收尾 ——
function Scene7() {
  const frame = useCurrentFrame();
  const years = [1950, 1956, 1986, 2012, 2017, 2020, 2022, 2025, 2026];
  const scrollX = frame * 4;
  const titleIn = spring({ frame: frame - 190, fps: FPS, config: { damping: 15, stiffness: 60 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0a1a33, #052033)", fontFamily }}>
      <div style={{ position: "absolute", top: "46%", left: 0, width: "100%", height: 2, background: "rgba(34,211,238,0.35)" }} />
      {years.map((y, i) => (
        <div key={y} style={{ position: "absolute", left: 960 + i * 260 - scrollX, top: "42%", textAlign: "center", opacity: interpolate(Math.abs(960 + i * 260 - scrollX - 960), [0, 700], [1, 0], { extrapolateRight: "clamp" }) }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: CYAN, margin: "0 auto 14px", boxShadow: "0 0 20px rgba(34,211,238,0.8)" }} />
          <div style={{ fontSize: 44, fontWeight: 700, color: TEXT }}>{y}</div>
        </div>
      ))}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: titleIn, transform: `translateY(${(1 - titleIn) * 50}px)` }}>
        <div style={{ fontSize: 86, fontWeight: 700, color: TEXT }}>
          从<span style={{ color: SKY }}>图灵</span>到<span style={{ color: VIOLET }}>Harness</span>
        </div>
        <div style={{ marginTop: 30, fontSize: 40, color: DIM }}>大语言模型的前世今生 · 完整内容见 am5188.github.io/llm-harness</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// —— 场景 4 单独包装（置换，独立时间轴）——
function Scene4() {
  return <SceneGame flipAt={80} />;
}

// —— 总合成 ——
const SCENES = [
  { id: "s1", comp: Scene1 },
  { id: "s2", comp: Scene2 },
  { id: "s3", comp: () => <SceneGame flipAt={99999} /> },
  { id: "s4", comp: Scene4 },
  { id: "s5", comp: Scene5 },
  { id: "s6", comp: Scene6 },
  { id: "s7", comp: Scene7 },
];

export const Ch1Turing = () => {
  return (
    <AbsoluteFill style={{ background: NAVY }}>
      {HAS_AUDIO ? <Audio src={staticFile("remotion-assets/ch1-narration.mp3")} /> : null}
      {SCENES.map((sc, i) => {
        const timing = TIMINGS[i];
        const from = Math.round(timing.start * FPS);
        const dur = Math.round((timing.end - timing.start) * FPS) + Math.round(0.2 * FPS);
        const Comp = sc.comp;
        return (
          <Sequence key={sc.id} from={from} durationInFrames={dur} premountFor={Math.round(0.4 * FPS)}>
            <Comp />
            <Caption seg={timing} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
