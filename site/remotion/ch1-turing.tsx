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
import { useEffect, useRef } from "react";
import alignmentData from "./assets/ch1-alignment.json";
import { SEGMENTS } from "./ch1-narration";

const { fontFamily } = loadFont();

const FPS = 30;
const W = 1920;
const H = 1080;

// —— 故事书配色 ——
const PAPER_TOP = "#fdf4de";
const PAPER_BOTTOM = "#f1ddb4";
const INK = "#2b2b33";
const INK_SOFT = "#6b6659";
const SKIN = "#ffd9b3";
const SKY = "#0e7cb8";
const VIOLET = "#6d4fc4";
const VIOLET_LIGHT = "#e4dcf7";
const RED = "#d04848";
const EMERALD = "#2e8b68";
const PINK = "#d96a9e";
const AMBER = "#e0a73e";
const CREAM_CARD = "#fffaf0";

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

const HAS_AUDIO = process.env.REMOTION_CH1_AUDIO === "1";
const HAS_MUSIC = process.env.REMOTION_CH1_MUSIC === "1";
const EASE_OUT = Easing.out(Easing.cubic);

// —— 字幕（逐字高亮）——
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
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 54 }}>
      <div style={{ opacity: fadeIn, display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 1560, padding: "15px 30px", borderRadius: 16, background: "rgba(20,24,34,0.84)", fontFamily, fontSize: 39, lineHeight: 1.55 }}>
        {seg.chars.map((c, i) => (
          <span key={i} style={{ color: i === active ? "#38bdf8" : "#e2e8f0", fontWeight: i === active ? 700 : 400 }}>
            {c === " " ? " " : c}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ================= Canvas 工具 =================
type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

const prog = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
const fade = (frame: number, start: number, dur: number) =>
  interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const pop = (frame: number, start: number, config = { damping: 13, stiffness: 110, mass: 0.85 }) =>
  spring({ frame: frame - start, fps: FPS, config });

function wobble(pts: Pt[], seed: number, amp = 3): Pt[] {
  const rand = mulberry32(seed);
  return pts.map(([x, y]) => [x + (rand() - 0.5) * 2 * amp, y + (rand() - 0.5) * 2 * amp]);
}

function strokeHand(ctx: Ctx, pts: Pt[], p: number, color: string, width: number, seed = 1, amp = 2.6) {
  if (p <= 0) return;
  const wob = wobble(pts, seed, amp);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const total = wob.length;
  const maxIdx = Math.min(total - 1, p * total);
  if (maxIdx >= 1) {
    ctx.beginPath();
    ctx.moveTo(wob[0][0], wob[0][1]);
    for (let i = 1; i <= maxIdx; i++) ctx.lineTo(wob[i][0], wob[i][1]);
    ctx.stroke();
  }
  ctx.restore();
}

function fillShape(ctx: Ctx, pts: Pt[], fill: string, stroke: string, width: number, seed = 1) {
  const wob = wobble(pts, seed, 1.6);
  ctx.beginPath();
  ctx.moveTo(wob[0][0], wob[0][1]);
  for (let i = 1; i < wob.length; i++) ctx.lineTo(wob[i][0], wob[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.stroke();
}

function textInk(ctx: Ctx, text: string, x: number, y: number, size: number, color: string, weight = 700, alpha = 1, align: CanvasTextAlign = "center", rotate = 0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rotate);
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Noto Sans SC", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function typedText(ctx: Ctx, frame: number, text: string, start: number, x: number, y: number, size: number, color: string, speed = 2.1, align: CanvasTextAlign = "center") {
  const count = Math.floor(interpolate(frame, [start, start + text.length * speed], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  textInk(ctx, text.slice(0, count), x, y, size, color, 600, 1, align);
}

/** 徽章药丸 */
function badge(ctx: Ctx, frame: number, text: string, cx: number, cy: number, size: number, bg: string, fg: string, start: number, padX = 46, padY = 24, rotate = 0) {
  const p = pop(frame, start);
  if (p <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotate);
  ctx.scale(p, p);
  ctx.font = `700 ${size}px "Noto Sans SC", sans-serif`;
  const tw = ctx.measureText(text).width;
  const w = tw + padX * 2;
  const h = size + padY * 2;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(43,43,51,0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 2);
  ctx.restore();
}

/** 对话气泡（白色 + 彩色描边 + 尾巴 + 打字） */
function bubble(ctx: Ctx, frame: number, cx: number, cy: number, w: number, h: number, text: string, start: number, color: string, tail: "left" | "right" = "left") {
  const p = pop(frame, start, { damping: 14, stiffness: 130, mass: 0.85 });
  if (p <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
  ctx.globalAlpha = Math.min(1, p * 1.6);
  const x = -w / 2;
  const y = -h / 2;
  ctx.fillStyle = CREAM_CARD;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 26);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  // 尾巴
  ctx.beginPath();
  if (tail === "left") {
    ctx.moveTo(x + 40, y + h - 2);
    ctx.lineTo(x + 6, y + h + 30);
    ctx.lineTo(x + 74, y + h - 6);
  } else {
    ctx.moveTo(x + w - 40, y + h - 2);
    ctx.lineTo(x + w - 6, y + h + 30);
    ctx.lineTo(x + w - 74, y + h - 6);
  }
  ctx.closePath();
  ctx.fillStyle = CREAM_CARD;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  typedText(ctx, frame, text, start + 6, 0, 2, 33, INK, 2.1);
  ctx.restore();
}

// ================= 卡通角色 =================

function shadowEllipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, alpha = 0.14) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#5a4a28";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function eyes(ctx: Ctx, frame: number, cx: number, cy: number, gap: number, size: number, blinkEvery = 96) {
  const blinkPhase = frame % blinkEvery;
  const closed = blinkPhase > blinkEvery - 6;
  const look = Math.sin(frame * 0.04) * 3;
  [-1, 1].forEach((side) => {
    const ex = cx + side * gap;
    if (closed) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(ex, cy, size * 0.9, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(ex, cy, size, size * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(ex + look, cy + 1, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function smile(ctx: Ctx, cx: number, cy: number, r: number, open = false) {
  if (open) {
    ctx.fillStyle = "#7c2d3e";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - r * 0.7, cy - 2, r * 1.4, 6);
  } else {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 4, r, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();
  }
}

function blush(ctx: Ctx, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#f48fb1";
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

type PersonOpts = {
  shirt: string;
  shirtShade: string;
  pants: string;
  hair: "asker" | "man" | "woman";
  label?: string;
  labelColor?: string;
  phase?: number;
  openMouth?: boolean;
};

/** 填充式卡通人（坐标原点=脚底中心，向上为负） */
function cartoonPerson(ctx: Ctx, frame: number, cx: number, baseY: number, s: number, start: number, opts: PersonOpts) {
  const p = pop(frame, start);
  if (p <= 0) return;
  const phase = opts.phase ?? 0;
  const bob = Math.sin(frame * 0.055 + phase * 2.1) * 3.2;
  shadowEllipse(ctx, cx, baseY + 10, 78 * s, 15 * s, 0.13 * p);
  ctx.save();
  ctx.translate(cx, baseY + bob);
  ctx.scale(s * p, s * p);
  const outline = "rgba(43,43,51,0.85)";
  // 腿
  ctx.strokeStyle = opts.pants;
  ctx.lineWidth = 17;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-20, -108);
  ctx.lineTo(-27, -26);
  ctx.moveTo(20, -108);
  ctx.lineTo(27, -26);
  ctx.stroke();
  // 鞋
  ctx.fillStyle = "#3d3d46";
  ctx.beginPath();
  ctx.ellipse(-31, -14, 24, 12, 0, 0, Math.PI * 2);
  ctx.ellipse(31, -14, 24, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // 手臂
  ctx.strokeStyle = opts.shirtShade;
  ctx.lineWidth = 15;
  ctx.beginPath();
  ctx.moveTo(-38, -150);
  ctx.lineTo(-60, -100);
  ctx.moveTo(38, -150);
  ctx.lineTo(60, -100);
  ctx.stroke();
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.arc(-62, -97, 11, 0, Math.PI * 2);
  ctx.arc(62, -97, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 3;
  ctx.stroke();
  // 躯干（圆角梯形近似）
  fillShape(ctx, [[-48, -166], [48, -166], [56, -100], [-56, -100]], opts.shirt, outline, 4.5, 41);
  // 领口
  ctx.strokeStyle = opts.shirtShade;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -164, 13, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  // 头
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.arc(0, -220, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4.5;
  ctx.stroke();
  // 头发
  if (opts.hair === "woman") {
    ctx.fillStyle = PINK;
    ctx.beginPath();
    ctx.arc(0, -228, 62, Math.PI * 0.95, Math.PI * 2.05);
    ctx.arc(-30, -250, 34, Math.PI * 0.6, Math.PI * 1.4);
    ctx.arc(30, -250, 34, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 4;
    ctx.stroke();
    // 蝴蝶结
    ctx.fillStyle = "#c2407d";
    ctx.beginPath();
    ctx.moveTo(52, -252);
    ctx.lineTo(88, -232);
    ctx.lineTo(52, -212);
    ctx.closePath();
    ctx.moveTo(52, -252);
    ctx.lineTo(16, -232);
    ctx.lineTo(52, -212);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e86f9d";
    ctx.beginPath();
    ctx.arc(52, -232, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (opts.hair === "man") {
    ctx.fillStyle = "#3f3a33";
    ctx.beginPath();
    ctx.arc(0, -228, 60, Math.PI * 1.02, Math.PI * 1.98);
    ctx.closePath();
    ctx.fill();
    // 胡子
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.ellipse(0, -186, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else {
    // 询问者：卷发 + 问号天线
    ctx.fillStyle = "#c9883d";
    ctx.beginPath();
    ctx.arc(0, -230, 59, Math.PI * 1.05, Math.PI * 1.95);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, -278);
    ctx.quadraticCurveTo(26, -306, 20, -324);
    ctx.stroke();
    ctx.fillStyle = SKY;
    ctx.beginPath();
    ctx.arc(20, -332, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  // 脸
  eyes(ctx, frame, 0, -226, 21, 11.5);
  blush(ctx, -34, -208, 12);
  blush(ctx, 34, -208, 12);
  smile(ctx, 0, -198, 15, opts.openMouth);
  ctx.restore();
  if (opts.label) {
    const lp = fade(frame, start + 6, 10);
    textInk(ctx, opts.label, cx, baseY + 66, 32, opts.labelColor ?? INK, 700, lp * Math.min(1, p * 1.5));
  }
}

/** 填充式卡通机器人 */
function cartoonRobot(ctx: Ctx, frame: number, cx: number, baseY: number, s: number, start: number, label = "B · 机器") {
  const p = pop(frame, start);
  if (p <= 0) return;
  const hover = Math.sin(frame * 0.07) * 4.5;
  shadowEllipse(ctx, cx, baseY + 10, 74 * s, 14 * s, 0.13 * p);
  ctx.save();
  ctx.translate(cx, baseY + hover);
  ctx.scale(s * p, s * p);
  const outline = "rgba(43,43,51,0.85)";
  // 腿
  ctx.strokeStyle = "#4a3a8c";
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-22, -96);
  ctx.lineTo(-28, -20);
  ctx.moveTo(22, -96);
  ctx.lineTo(28, -20);
  ctx.stroke();
  // 脚
  ctx.fillStyle = "#3d3d46";
  ctx.beginPath();
  ctx.ellipse(-30, -10, 26, 11, 0, 0, Math.PI * 2);
  ctx.ellipse(30, -10, 26, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  // 手臂
  ctx.strokeStyle = "#5743a8";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-50, -140);
  ctx.lineTo(-64, -92);
  ctx.moveTo(50, -140);
  ctx.lineTo(64, -92);
  ctx.stroke();
  ctx.fillStyle = VIOLET_LIGHT;
  ctx.beginPath();
  ctx.arc(-64, -90, 10, 0, Math.PI * 2);
  ctx.arc(64, -90, 10, 0, Math.PI * 2);
  ctx.fill();
  // 身体
  const g = ctx.createLinearGradient(0, -170, 0, -90);
  g.addColorStop(0, "#7d5fd0");
  g.addColorStop(1, "#5b3fb0");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(-56, -166, 112, 106, 26);
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4.5;
  ctx.stroke();
  // 屏幕脸（身体面板）
  ctx.fillStyle = "#191b2e";
  ctx.beginPath();
  ctx.roundRect(-34, -142, 68, 46, 14);
  ctx.fill();
  ctx.strokeStyle = "rgba(34,211,238,0.7)";
  ctx.lineWidth = 3;
  ctx.stroke();
  // 眼睛（在屏幕上左右看）
  const look = Math.sin(frame * 0.05) * 6;
  ctx.fillStyle = "#22d3ee";
  ctx.beginPath();
  ctx.arc(-14 + look, -119, 6, 0, Math.PI * 2);
  ctx.arc(14 + look, -119, 6, 0, Math.PI * 2);
  ctx.fill();
  // 头
  ctx.fillStyle = "#8f74e0";
  ctx.beginPath();
  ctx.arc(0, -218, 48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4.5;
  ctx.stroke();
  // 天线 + 闪烁灯
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -266);
  ctx.lineTo(0, -294);
  ctx.stroke();
  const blinkOn = Math.floor(frame / 16) % 2 === 0;
  ctx.fillStyle = blinkOn ? "#22d3ee" : "#3d5a75";
  ctx.beginPath();
  ctx.arc(0, -302, 9, 0, Math.PI * 2);
  ctx.fill();
  if (blinkOn) {
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(0, -302, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  // 表情
  eyes(ctx, frame, 0, -224, 18, 10);
  smile(ctx, 0, -200, 12);
  ctx.restore();
  const lp = fade(frame, start + 6, 10);
  textInk(ctx, label, cx, baseY + 62, 32, VIOLET, 700, lp * Math.min(1, p * 1.5));
}

// —— 纸底 ——
function drawPaper(ctx: Ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PAPER_TOP);
  g.addColorStop(1, PAPER_BOTTOM);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const rand = mulberry32(5);
  ctx.fillStyle = "rgba(120,90,40,0.05)";
  for (let i = 0; i < 240; i++) {
    ctx.fillRect(rand() * W, rand() * H, 2.4, 2.4);
  }
  // 暗角
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
  v.addColorStop(0, "rgba(90,60,20,0)");
  v.addColorStop(1, "rgba(90,60,20,0.16)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
  // 装饰角
  strokeHand(ctx, [[60, 130], [60, 60], [130, 60]], 1, "rgba(43,43,51,0.28)", 5, 61, 2);
  strokeHand(ctx, [[1790, 1020], [1860, 1020], [1860, 950]], 1, "rgba(43,43,51,0.28)", 5, 62, 2);
}

// —— 画布场景包装（含相机缓推 + 入场淡入）——
function CanvasScene({ draw }: { draw: (ctx: Ctx, frame: number) => void }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    const z = 1 + 0.045 * interpolate(frame, [0, durationInFrames], [0, 1], { easing: Easing.inOut(Easing.cubic) });
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(z, z);
    ctx.translate(-W / 2, -H / 2);
    draw(ctx, frame);
    ctx.restore();
    if (frame < 8) {
      ctx.fillStyle = `rgba(253,244,222,${1 - frame / 8})`;
      ctx.fillRect(0, 0, W, H);
    }
  }, [frame, draw, durationInFrames]);
  return <canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />;
}

// ================= 场景 =================

function Scene1(ctx: Ctx, frame: number) {
  drawPaper(ctx);
  // 太阳装饰
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = AMBER;
  ctx.beginPath();
  ctx.arc(1700, 150, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(1700, 150, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 大问号描画（钩子）
  const qp = prog(frame, 8, 55);
  strokeHand(ctx, [[720, 320], [620, 250], [600, 340], [700, 430], [890, 485], [1010, 430], [1050, 310], [980, 215], [850, 185], [730, 230]], qp, INK, 12, 41, 6);
  const dotP = prog(frame, 58, 14);
  if (dotP > 0) {
    ctx.save();
    ctx.globalAlpha = dotP;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(950, 640, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // 手写问题
  const tp = pop(frame, 66, { damping: 14, stiffness: 80, mass: 0.85 });
  if (tp > 0) {
    ctx.save();
    ctx.translate(870, 770);
    ctx.rotate(-0.03);
    ctx.scale(tp, tp);
    textInk(ctx, "机器能思考吗？", 100, 0, 100, INK, 700);
    ctx.restore();
  }
  badge(ctx, frame, "1950 · 英国《Mind》期刊", 960, 920, 42, SKY, "#fdf6e9", 80, 44, 22);
  const fp = fade(frame, 96, 14);
  textInk(ctx, "故事，从英国的一篇论文开始", 960, 1010, 34, INK_SOFT, 500, fp);
}

function Scene2(ctx: Ctx, frame: number) {
  drawPaper(ctx);
  // 漫画双面板
  const p1 = pop(frame, 4);
  const p2 = pop(frame, 14);
  // 面板一：思考是什么？
  ctx.save();
  ctx.translate(480, 520);
  ctx.scale(p1, p1);
  ctx.fillStyle = CREAM_CARD;
  ctx.beginPath();
  ctx.roundRect(-330, -230, 660, 460, 34);
  ctx.fill();
  ctx.strokeStyle = "rgba(43,43,51,0.4)";
  ctx.lineWidth = 5;
  ctx.stroke();
  textInk(ctx, "“思考”是什么？", 0, -140, 62, INK, 700);
  textInk(ctx, "含义太模糊", 0, -60, 42, INK_SOFT, 500);
  textInk(ctx, "讨论只会变成定义的争吵", 0, 10, 42, INK_SOFT, 500);
  ctx.restore();
  // 红叉
  const xp = prog(frame, 40, 20);
  strokeHand(ctx, [[240, 300], [720, 500]], xp, RED, 13, 51, 3);
  strokeHand(ctx, [[720, 300], [240, 500]], prog(frame, 50, 20), RED, 13, 52, 3);
  // 面板二：派对游戏
  ctx.save();
  ctx.translate(1440, 520);
  ctx.scale(p2, p2);
  ctx.fillStyle = CREAM_CARD;
  ctx.beginPath();
  ctx.roundRect(-330, -230, 660, 460, 34);
  ctx.fill();
  ctx.strokeStyle = "rgba(43,43,51,0.4)";
  ctx.lineWidth = 5;
  ctx.stroke();
  textInk(ctx, "换成可操作的问题", 0, -140, 58, SKY, 700);
  // 派对帽
  ctx.fillStyle = EMERALD;
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.lineTo(-80, 60);
  ctx.lineTo(80, 60);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(43,43,51,0.5)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = AMBER;
  ctx.beginPath();
  ctx.arc(0, -46, 13, 0, Math.PI * 2);
  ctx.fill();
  textInk(ctx, "英国客厅里的派对游戏", 0, 130, 40, INK_SOFT, 500);
  ctx.restore();
  // 中间箭头
  const ap = prog(frame, 60, 20);
  strokeHand(ctx, [[830, 520], [950, 520]], ap, SKY, 10, 53, 2);
  strokeHand(ctx, [[925, 490], [950, 520], [925, 550]], prog(frame, 74, 14), SKY, 10, 54, 2);
  const bp = fade(frame, 80, 14);
  textInk(ctx, "这个置换，就是整章的灵魂", 960, 900, 40, INK, 700, bp);
}

function Scene3(ctx: Ctx, frame: number) {
  drawPaper(ctx);
  // 窗与太阳
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#fdf0c8";
  ctx.beginPath();
  ctx.arc(1550, 210, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  strokeHand(ctx, [[1220, 130], [1220, 330], [1700, 330], [1700, 130], [1220, 130]], prog(frame, 0, 22), "rgba(43,43,51,0.4)", 5, 63, 2);
  strokeHand(ctx, [[1460, 130], [1460, 330]], prog(frame, 8, 18), "rgba(43,43,51,0.4)", 5, 64, 2);
  strokeHand(ctx, [[1220, 230], [1700, 230]], prog(frame, 12, 18), "rgba(43,43,51,0.4)", 5, 65, 2);
  // 地板
  strokeHand(ctx, [[120, 850], [1800, 850]], prog(frame, 0, 24), "rgba(43,43,51,0.35)", 5, 66, 2);
  // 三个卡通角色
  cartoonPerson(ctx, frame, 420, 850, 1.08, 14, { shirt: SKY, shirtShade: "#0a5f92", pants: "#3d4a5c", hair: "asker", label: "询问者", labelColor: SKY, phase: 0 });
  cartoonPerson(ctx, frame, 960, 850, 1.08, 34, { shirt: EMERALD, shirtShade: "#1f6b4e", pants: "#4a3b33", hair: "man", label: "A · 男人（如实回答）", labelColor: EMERALD, phase: 1 });
  cartoonPerson(ctx, frame, 1500, 850, 1.08, 54, { shirt: PINK, shirtShade: "#b04a7d", pants: "#5c3a55", hair: "woman", label: "B · 女人（误导询问者）", labelColor: PINK, phase: 2 });
  // 对话气泡
  bubble(ctx, frame, 420, 360, 470, 92, "你的头发有多长？", 72, SKY, "left");
  bubble(ctx, frame, 960, 470, 560, 92, "我的头发是短发，大约 5 厘米。", 138, EMERALD, "right");
  bubble(ctx, frame, 1500, 470, 620, 92, "我的头发也是短发！只有 5 厘米，真的。", 204, PINK, "right");
  const bp = fade(frame, 292, 16);
  if (bp > 0) badge(ctx, frame, "判断的依据只有语言行为——看不到人，只能看字", 960, 1000, 38, INK, CREAM_CARD, 0, 50, 22);
}

function Scene4(ctx: Ctx, frame: number) {
  drawPaper(ctx);
  // 女人缩小消失
  const wf = interpolate(frame, [24, 46], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (wf > 0) {
    ctx.save();
    ctx.globalAlpha = wf;
    cartoonPerson(ctx, frame, 1500, 850, 1.08 * wf, 0, { shirt: PINK, shirtShade: "#b04a7d", pants: "#5c3a55", hair: "woman", phase: 2 });
    ctx.restore();
  }
  // 置换闪光
  const flash = interpolate(frame, [46, 58, 74], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (flash > 0) {
    ctx.save();
    ctx.globalAlpha = flash * 0.4;
    ctx.strokeStyle = VIOLET;
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(1500, 430);
    ctx.lineTo(1500, 900);
    ctx.stroke();
    ctx.restore();
  }
  if (prog(frame, 56, 14) > 0) cartoonRobot(ctx, frame, 1500, 850, 1.08, 56);
  cartoonPerson(ctx, frame, 420, 850, 1.08, 2, { shirt: SKY, shirtShade: "#0a5f92", pants: "#3d4a5c", hair: "asker", label: "询问者", labelColor: SKY, phase: 0 });
  cartoonPerson(ctx, frame, 960, 850, 1.08, 6, { shirt: EMERALD, shirtShade: "#1f6b4e", pants: "#4a3b33", hair: "man", phase: 1 });
  bubble(ctx, frame, 1500, 430, 660, 92, "请把我排除在这之外：我从来不会写诗。", 110, VIOLET, "right");
  badge(ctx, frame, "如果询问者还是分不出来——", 960, 640, 42, CREAM_CARD, INK, 160, 40, 20);
  badge(ctx, frame, "“机器不能思考”就不再是显然的结论", 960, 730, 42, VIOLET, "#fdf6e9", 196, 40, 20);
}

function Scene5(ctx: Ctx, frame: number) {
  drawPaper(ctx);
  badge(ctx, frame, "哲学问题", 620, 480, 58, "#efe7d6", INK_SOFT, 4, 44, 22);
  // 红叉
  const xp = prog(frame, 40, 18);
  strokeHand(ctx, [[430, 380], [810, 580]], xp, RED, 11, 71, 3);
  strokeHand(ctx, [[810, 380], [430, 580]], prog(frame, 50, 18), RED, 11, 72, 3);
  // 箭头
  strokeHand(ctx, [[1000, 480], [1160, 480]], prog(frame, 62, 22), SKY, 12, 73, 2);
  strokeHand(ctx, [[1132, 452], [1160, 480], [1132, 508]], prog(frame, 78, 14), SKY, 12, 74, 2);
  badge(ctx, frame, "行为判据", 1370, 480, 58, SKY, "#fdf6e9", 86, 44, 22);
  // 天平
  const tp = prog(frame, 108, 40);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, tp * 1.5);
    const tilt = 0.14 * prog(frame, 126, 30);
    ctx.translate(960, 780);
    ctx.rotate(-tilt);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.lineTo(0, 50);
    ctx.moveTo(-170, -90);
    ctx.lineTo(170, -90);
    ctx.stroke();
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.roundRect(-196, -108, 52, 42, 10);
    ctx.roundRect(144, -108, 52, 42, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(43,43,51,0.6)";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.moveTo(-170, -90);
    ctx.lineTo(-170, -64);
    ctx.moveTo(170, -90);
    ctx.lineTo(170, -64);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 56, 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  badge(ctx, frame, "判断智能，先看它会不会用语言", 960, 980, 44, INK, CREAM_CARD, 160, 50, 22);
}

function Scene6(ctx: Ctx, frame: number) {
  drawPaper(ctx);
  badge(ctx, frame, "1950 年，三样东西都没有", 960, 220, 54, INK, CREAM_CARD, 0, 50, 24);
  const slots = [
    { label: "数据", x: 480, icon: "sheets", color: RED },
    { label: "算力", x: 960, icon: "chip", color: RED },
    { label: "方法", x: 1440, icon: "gear", color: RED },
  ];
  slots.forEach((s, i) => {
    const on = prog(frame, 12 + i * 24, 10);
    const off = interpolate(frame, [32 + i * 24, 44 + i * 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glow = Math.max(0, on - off);
    const p = pop(frame, 4 + i * 24);
    if (p <= 0) return;
    ctx.save();
    ctx.translate(s.x, 470);
    ctx.scale(p, p);
    const color = glow > 0.3 ? RED : "#8a8068";
    // 卡片
    ctx.fillStyle = CREAM_CARD;
    ctx.beginPath();
    ctx.roundRect(-180, -160, 360, 320, 30);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = glow > 0.3 ? 9 : 5;
    ctx.stroke();
    if (glow > 0) {
      ctx.save();
      ctx.globalAlpha = glow * 0.22;
      ctx.fillStyle = RED;
      ctx.fillRect(-190, -170, 380, 340);
      ctx.restore();
    }
    // 图标
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    if (s.icon === "sheets") {
      ctx.strokeRect(-52, -70, 80, 96);
      ctx.strokeRect(-26, -92, 80, 96);
      ctx.strokeRect(0, -114, 80, 96);
    } else if (s.icon === "chip") {
      ctx.strokeRect(-62, -62, 124, 124);
      ctx.strokeRect(-30, -30, 60, 60);
      ctx.beginPath();
      for (const d of [-1, 1]) {
        ctx.moveTo(d * 62, -30); ctx.lineTo(d * 92, -30);
        ctx.moveTo(d * 62, 30); ctx.lineTo(d * 92, 30);
        ctx.moveTo(-30, d * 62); ctx.lineTo(-30, d * 92);
        ctx.moveTo(30, d * 62); ctx.lineTo(30, d * 92);
      }
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 26, Math.sin(ang) * 26);
        ctx.lineTo(Math.cos(ang) * 50, Math.sin(ang) * 50);
        ctx.stroke();
      }
    }
    textInk(ctx, s.label, 0, 110, 64, color, 700);
    ctx.restore();
  });
  // 儿童的大脑
  const hp = fade(frame, 106, 14);
  if (hp > 0) {
    ctx.save();
    ctx.globalAlpha = hp;
    const bp = pop(frame, 110);
    ctx.translate(820, 800);
    ctx.scale(bp, bp);
    ctx.fillStyle = SKIN;
    ctx.beginPath();
    ctx.arc(0, 0, 104, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(43,43,51,0.85)";
    ctx.lineWidth = 5;
    ctx.stroke();
    eyes(ctx, frame, 0, -8, 34, 13);
    blush(ctx, -54, 22, 14);
    blush(ctx, 54, 22, 14);
    smile(ctx, 0, 24, 18, true);
    // 天线头发
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -104);
    ctx.quadraticCurveTo(18, -130, 12, -146);
    ctx.stroke();
    ctx.restore();
    // 火花
    const sp = prog(frame, 130, 26);
    strokeHand(ctx, [[980, 690], [1012, 654]], sp, SKY, 7, 93, 2);
    strokeHand(ctx, [[1012, 654], [1012, 610]], prog(frame, 138, 16), SKY, 7, 94, 2);
    strokeHand(ctx, [[1012, 610], [980, 574]], prog(frame, 142, 16), SKY, 7, 95, 2);
    strokeHand(ctx, [[1012, 610], [1044, 574]], prog(frame, 146, 16), SKY, 7, 96, 2);
    textInk(ctx, "儿童的大脑 + 学习", 960, 940, 46, PINK, 700, fade(frame, 152, 14));
  }
  textInk(ctx, "图灵的愿景，比可行的时间早了六十年", 960, 1010, 36, INK_SOFT, 500, fade(frame, 168, 14));
}

function Scene7(ctx: Ctx, frame: number) {
  drawPaper(ctx);
  const years = [1950, 1956, 1986, 2012, 2017, 2020, 2022, 2025, 2026];
  const startX = 200;
  const endX = 1720;
  const step = (endX - startX) / (years.length - 1);
  strokeHand(ctx, [[startX, 500], [endX, 500]], prog(frame, 0, 50), "rgba(43,43,51,0.5)", 6, 101, 2);
  years.forEach((y, i) => {
    const t0 = 26 + i * 19;
    const p = prog(frame, t0, 10);
    if (p <= 0) return;
    const x = startX + i * step;
    const color = y >= 2022 ? VIOLET : y === 2012 ? SKY : INK;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p * 1.5);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, 500, 12, 0, Math.PI * 2);
    ctx.fill();
    if (y === 2012 || y === 2022) {
      ctx.globalAlpha *= 0.25;
      ctx.beginPath();
      ctx.arc(x, 500, 26, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = Math.min(1, p * 1.5);
    textInk(ctx, String(y), x, 566, 36, color, 700);
    ctx.restore();
  });
  // 书名
  const tp = fade(frame, 220, 16);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha = tp;
    textInk(ctx, "从图灵到 Harness", 960, 660, 104, INK, 700);
    textInk(ctx, "大语言模型的前世今生", 960, 748, 46, INK_SOFT, 500);
    textInk(ctx, "完整内容见 am5188.github.io/llm-harness", 960, 808, 32, SKY, 600);
    ctx.restore();
  }
  // 收获卡
  const gp = fade(frame, 250, 16);
  if (gp > 0) {
    ctx.save();
    ctx.globalAlpha = gp;
    ctx.fillStyle = CREAM_CARD;
    ctx.beginPath();
    ctx.roundRect(500, 880, 920, 140, 30);
    ctx.fill();
    ctx.strokeStyle = "#d9b56a";
    ctx.lineWidth = 5;
    ctx.stroke();
    // 对勾
    ctx.strokeStyle = EMERALD;
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(576, 950);
    ctx.lineTo(612, 986);
    ctx.lineTo(658, 918);
    ctx.stroke();
    textInk(ctx, "看完这一章：智能问题，从此变成了语言行为问题", 990, 950, 36, INK, 700, gp, "center");
    ctx.restore();
  }
}

const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7];

export const Ch1Turing = () => {
  return (
    <AbsoluteFill style={{ background: PAPER_TOP }}>
      {HAS_AUDIO ? <Audio src={staticFile("remotion-assets/ch1-narration.mp3")} /> : null}
      {HAS_MUSIC ? <Audio src={staticFile("remotion-assets/ch1-music.wav")} volume={0.24} /> : null}
      {SCENES.map((draw, i) => {
        const timing = TIMINGS[i];
        const from = Math.round(timing.start * FPS);
        const dur = Math.round((timing.end - timing.start) * FPS) + Math.round(0.2 * FPS);
        return (
          <Sequence key={i} from={from} durationInFrames={dur} premountFor={Math.round(0.4 * FPS)}>
            <CanvasScene draw={draw} />
            <Caption seg={timing} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
