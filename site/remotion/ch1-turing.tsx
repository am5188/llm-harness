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

// —— 故事书配色：暖纸底 + 墨线 + 每场一个强调色 ——
const PAPER = "#f6ecd8";
const PAPER_DEEP = "#efdfc3";
const INK = "#26262e";
const INK_SOFT = "#5c5a66";
const SKY = "#0e7cb8";
const VIOLET = "#6d4fc4";
const RED = "#d04848";
const EMERALD = "#2e8b68";
const PINK = "#d96a9e";
const CREAM_TEXT = "#f2e2bd";

// —— 确定性随机 ——
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
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 58 }}>
      <div style={{ opacity: fadeIn, display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 1560, padding: "15px 30px", borderRadius: 16, background: "rgba(20,24,34,0.82)", fontFamily, fontSize: 39, lineHeight: 1.55 }}>
        {seg.chars.map((c, i) => (
          <span key={i} style={{ color: i === active ? "#38bdf8" : "#e2e8f0", fontWeight: i === active ? 700 : 400 }}>
            {c === " " ? " " : c}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ================= Canvas 手绘工具 =================

type Ctx = CanvasRenderingContext2D;
type Pt = [number, number];

function prog(frame: number, start: number, dur: number) {
  return interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
}

function fade(frame: number, start: number, dur: number) {
  return interpolate(frame, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}

/** 手绘抖动：把折线点做确定性偏移 */
function wobble(pts: Pt[], seed: number, amp = 3.2): Pt[] {
  const rand = mulberry32(seed);
  return pts.map(([x, y]) => [x + (rand() - 0.5) * 2 * amp, y + (rand() - 0.5) * 2 * amp]);
}

/** 沿折线画到 progress 处（手绘描画） */
function strokeHand(ctx: Ctx, pts: Pt[], p: number, color: string, width: number, seed = 1, amp = 3.2) {
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
    for (let i = 1; i <= maxIdx; i++) {
      ctx.lineTo(wob[i][0], wob[i][1]);
    }
    ctx.stroke();
  } else if (maxIdx > 0) {
    const t = p * total;
    const i = Math.floor(t);
    const f = t - i;
    const x = wob[i][0] + (wob[Math.min(i + 1, total - 1)][0] - wob[i][0]) * f;
    const y = wob[i][1] + (wob[Math.min(i + 1, total - 1)][1] - wob[i][1]) * f;
    ctx.beginPath();
    ctx.moveTo(wob[i][0], wob[i][1]);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.restore();
}

function circlePts(cx: number, cy: number, r: number, n = 48): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function circleHand(ctx: Ctx, cx: number, cy: number, r: number, p: number, color: string, width: number, seed = 1) {
  strokeHand(ctx, circlePts(cx, cy, r), p, color, width, seed, 3.6);
}

function rectHand(ctx: Ctx, x: number, y: number, w: number, h: number, p: number, color: string, width: number, seed = 1, r = 18) {
  const pts: Pt[] = [
    [x + r, y], [x + w - r, y],
    ...circlePts(x + w - r, y + r, r, 12).slice(1, 7),
    [x + w, y + h - r],
    ...circlePts(x + w - r, y + h - r, r, 12).slice(7, 13),
    [x + r, y + h],
    ...circlePts(x + r, y + h - r, r, 12).slice(13, 19),
    [x, y + r],
    ...circlePts(x + r, y + r, r, 12).slice(19, 25),
  ];
  strokeHand(ctx, pts, p, color, width, seed, 3);
}

function textInk(ctx: Ctx, text: string, x: number, y: number, size: number, color: string, weight = 700, alpha = 1, align: CanvasTextAlign = "center") {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Noto Sans SC", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function typedText(ctx: Ctx, frame: number, text: string, start: number, x: number, y: number, size: number, color: string, speed = 2.2, align: CanvasTextAlign = "center") {
  const count = Math.floor(interpolate(frame, [start, start + text.length * speed], [0, text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  textInk(ctx, text.slice(0, count), x, y, size, color, 600, 1, align);
}

function bubbleHand(ctx: Ctx, frame: number, cx: number, cy: number, w: number, h: number, text: string, start: number, color: string) {
  const pop = spring({ frame: frame - start, fps: FPS, config: { damping: 14, stiffness: 120 } });
  if (pop <= 0) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
  ctx.globalAlpha = Math.min(1, pop * 1.5);
  ctx.fillStyle = "rgba(255,252,244,0.96)";
  const x = -w / 2, y = -h / 2;
  ctx.beginPath();
  const r = 22;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `${color}aa`;
  ctx.lineWidth = 3;
  ctx.stroke();
  typedText(ctx, frame, text, start + 6, 0, 2, 32, INK, 2.0);
  ctx.restore();
}

/** 卡通人（大头 + 表情 + 肢体，逐笔画出） */
function cartoonPerson(ctx: Ctx, frame: number, cx: number, baseY: number, s: number, start: number, opts: { color: string; hair?: "man" | "woman" | "asker"; label?: string }) {
  const p = (d: number) => prog(frame, start + d, 16);
  const headR = 52 * s;
  const headCy = baseY - 232 * s;
  const alpha = fade(frame, start, 8);
  ctx.save();
  ctx.globalAlpha = alpha;
  // 身体
  strokeHand(ctx, [[cx, headCy + headR + 8 * s], [cx, baseY - 120 * s]], p(26), opts.color, 6 * s, 11);
  strokeHand(ctx, [[cx, baseY - 150 * s], [cx - 52 * s, baseY - 120 * s]], p(32), opts.color, 6 * s, 12);
  strokeHand(ctx, [[cx, baseY - 150 * s], [cx + 52 * s, baseY - 120 * s]], p(36), opts.color, 6 * s, 13);
  strokeHand(ctx, [[cx, baseY - 118 * s], [cx - 32 * s, baseY]], p(40), opts.color, 6 * s, 14);
  strokeHand(ctx, [[cx, baseY - 118 * s], [cx + 32 * s, baseY]], p(44), opts.color, 6 * s, 15);
  // 头
  circleHand(ctx, cx, headCy, headR, p(2), INK, 5.5 * s, 21);
  // 发型/帽子
  if (opts.hair === "man") {
    strokeHand(ctx, circlePts(cx, headCy - 6 * s, headR + 3).slice(4, 20), p(8), opts.color, 5 * s, 22);
  } else if (opts.hair === "woman") {
    strokeHand(ctx, circlePts(cx, headCy, headR + 6).slice(0, 26), p(8), PINK, 5 * s, 23);
    strokeHand(ctx, [[cx + headR * 0.9, headCy - 6 * s], [cx + headR * 0.9 + 20 * s, headCy - 26 * s], [cx + headR * 0.9 + 6 * s, headCy - 40 * s], [cx + headR * 0.9 + 22 * s, headCy - 58 * s]], p(12), PINK, 5 * s, 24);
  } else {
    strokeHand(ctx, [[cx, headCy - headR - 6 * s], [cx + 16 * s, headCy - headR - 34 * s]], p(8), SKY, 5 * s, 25);
    circleHand(ctx, cx + 20 * s, headCy - headR - 38 * s, 7 * s, p(12), SKY, 4 * s, 26);
  }
  // 表情
  const eyesP = prog(frame, start + 30, 10);
  if (eyesP > 0) {
    ctx.save();
    ctx.globalAlpha = alpha * eyesP;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(cx - 18 * s, headCy - 6 * s, 5 * s, 0, Math.PI * 2);
    ctx.arc(cx + 18 * s, headCy - 6 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4 * s;
    ctx.arc(cx, headCy + 10 * s, 14 * s, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }
  if (opts.label) textInk(ctx, opts.label, cx, baseY + 62, 32 * s, opts.color, 700, alpha * fade(frame, start + 26, 12));
  ctx.restore();
}

/** 卡通机器人（方身圆头天线，逐笔画出） */
function cartoonRobot(ctx: Ctx, frame: number, cx: number, baseY: number, s: number, start: number) {
  const p = (d: number) => prog(frame, start + d, 16);
  const alpha = fade(frame, start, 8);
  const headR = 48 * s;
  const headCy = baseY - 224 * s;
  ctx.save();
  ctx.globalAlpha = alpha;
  rectHand(ctx, cx - 58 * s, baseY - 168 * s, 116 * s, 118 * s, p(0), VIOLET, 5.5 * s, 31);
  circleHand(ctx, cx, headCy, headR, p(10), INK, 5.5 * s, 32);
  strokeHand(ctx, [[cx, headCy - headR], [cx, headCy - headR - 42 * s]], p(18), INK, 5 * s, 33);
  const blink = Math.floor(frame / 14) % 2 === 0;
  if (blink) circleHand(ctx, cx, headCy - headR - 52 * s, 9 * s, p(22), SKY, 4.5 * s, 34);
  // 面板与眼睛
  rectHand(ctx, cx - 30 * s, baseY - 132 * s, 60 * s, 40 * s, p(24), VIOLET, 4 * s, 35);
  const eyesP = prog(frame, start + 28, 8);
  ctx.save();
  ctx.globalAlpha = alpha * eyesP;
  ctx.fillStyle = SKY;
  ctx.beginPath();
  ctx.arc(cx - 16 * s, headCy - 4 * s, 6 * s, 0, Math.PI * 2);
  ctx.arc(cx + 16 * s, headCy - 4 * s, 6 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // 腿
  strokeHand(ctx, [[cx - 30 * s, baseY - 50 * s], [cx - 34 * s, baseY]], p(26), INK, 6 * s, 36);
  strokeHand(ctx, [[cx + 30 * s, baseY - 50 * s], [cx + 34 * s, baseY]], p(28), INK, 6 * s, 37);
  textInk(ctx, "B · 机器", cx, baseY + 62, 32, VIOLET, 700, alpha * fade(frame, start + 28, 12));
  ctx.restore();
}

// —— 纸底 + 边框 ——
function drawPaper(ctx: Ctx, frame: number, warm = true) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, warm ? "#f8efdc" : PAPER);
  g.addColorStop(1, PAPER_DEEP);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // 纸纹噪点（固定种子，确定性）
  const rand = mulberry32(5);
  ctx.fillStyle = "rgba(90,70,40,0.045)";
  for (let i = 0; i < 260; i++) {
    ctx.fillRect(rand() * W, rand() * H, 2.2, 2.2);
  }
  // 手绘边框
  const bp = prog(frame, 0, 30);
  rectHand(ctx, 46, 46, W - 92, H - 92, bp, INK_SOFT, 4, 6, 26);
}

// —— 画布场景包装 ——
function CanvasScene({ draw }: { draw: (ctx: Ctx, frame: number) => void }) {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    draw(ctx, frame);
  }, [frame, draw]);
  return <canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />;
}

// ================= 场景 =================

function Scene1(ctx: Ctx, frame: number) {
  drawPaper(ctx, frame);
  // 钩子：大问号 + 手写问题
  const qp = prog(frame, 10, 60);
  strokeHand(ctx, [[720, 300], [620, 240], [600, 330], [700, 420], [880, 470], [1000, 420], [1040, 300], [980, 210], [860, 180], [740, 220]], qp, INK, 10, 41, 7);
  const dotP = prog(frame, 62, 16);
  if (dotP > 0) {
    ctx.save();
    ctx.globalAlpha = dotP;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(940, 620, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  const hp = fade(frame, 70, 16);
  if (hp > 0) {
    ctx.save();
    ctx.globalAlpha = hp;
    ctx.translate(860, 700);
    ctx.rotate(-0.035);
    textInk(ctx, "机器能思考吗？", 100, 0, 96, INK, 700);
    ctx.restore();
  }
  const bp = fade(frame, 100, 14);
  if (bp > 0) {
    ctx.save();
    ctx.globalAlpha = bp;
    ctx.fillStyle = SKY;
    ctx.beginPath();
    ctx.roundRect(760, 810, 400, 92, 46);
    ctx.fill();
    textInk(ctx, "1950 ·《Mind》期刊", 960, 856, 46, "#fdf6e9", 700, bp);
    ctx.restore();
  }
  textInk(ctx, "故事，从英国的一篇论文开始", 960, 1000, 34, INK_SOFT, 500, fade(frame, 120, 16));
}

function Scene2(ctx: Ctx, frame: number) {
  drawPaper(ctx, frame);
  const p1 = fade(frame, 0, 12);
  if (p1 > 0) {
    ctx.save();
    ctx.globalAlpha = p1;
    textInk(ctx, "“思考”是什么？", 960, 380, 84, INK, 700);
    textInk(ctx, "含义太模糊，讨论只会变成关于定义的争吵", 960, 480, 40, INK_SOFT, 500);
    ctx.restore();
  }
  // 红叉
  const xp = prog(frame, 60, 22);
  strokeHand(ctx, [[690, 300], [1230, 460]], xp, RED, 11, 51, 4);
  strokeHand(ctx, [[1230, 300], [690, 460]], prog(frame, 72, 22), RED, 11, 52, 4);
  // 换成可操作的问题
  const p2 = fade(frame, 100, 14);
  if (p2 > 0) {
    ctx.save();
    ctx.globalAlpha = p2;
    textInk(ctx, "换成 可操作的问题", 960, 640, 76, SKY, 700);
    ctx.restore();
  }
  // 派对帽涂鸦
  const hatP = prog(frame, 120, 30);
  if (hatP > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, hatP * 1.5);
    strokeHand(ctx, [[960, 780], [870, 900], [1050, 900], [960, 780]], hatP, EMERALD, 6, 53, 4);
    circleHand(ctx, 960, 776, 12, hatP, EMERALD, 5, 54);
    textInk(ctx, "一个英国客厅里的派对游戏", 960, 980, 36, INK_SOFT, 500, hatP);
    ctx.restore();
  }
}

function Scene3(ctx: Ctx, frame: number) {
  drawPaper(ctx, frame);
  // 地板线
  strokeHand(ctx, [[120, 830], [1800, 830]], prog(frame, 0, 24), INK_SOFT, 4, 61, 2);
  cartoonPerson(ctx, frame, 420, 830, 1.05, 16, { color: SKY, hair: "asker", label: "询问者" });
  cartoonPerson(ctx, frame, 960, 830, 1.05, 40, { color: EMERALD, hair: "man", label: "A · 男人（如实回答）" });
  cartoonPerson(ctx, frame, 1500, 830, 1.05, 62, { color: PINK, hair: "woman", label: "B · 女人（误导询问者）" });
  bubbleHand(ctx, frame, 420, 330, 470, 88, "你的头发有多长？", 74, SKY);
  bubbleHand(ctx, frame, 960, 430, 560, 88, "我的头发是短发，大约 5 厘米。", 140, EMERALD);
  bubbleHand(ctx, frame, 1500, 430, 620, 88, "我的头发也是短发！只有 5 厘米，真的。", 206, PINK);
  textInk(ctx, "判断的依据只有语言行为——看不到人，只能看字", 960, 980, 40, INK, 700, fade(frame, 290, 18));
}

function Scene4(ctx: Ctx, frame: number) {
  drawPaper(ctx, frame);
  const womanFade = interpolate(frame, [26, 48], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  ctx.save();
  ctx.globalAlpha = womanFade;
  cartoonPerson(ctx, frame, 1500, 830, 1.05, 0, { color: PINK, hair: "woman" });
  ctx.restore();
  // 置换闪光
  const flash = interpolate(frame, [48, 60, 76], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (flash > 0) {
    ctx.save();
    ctx.globalAlpha = flash * 0.35;
    ctx.strokeStyle = VIOLET;
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(1500, 420);
    ctx.lineTo(1500, 880);
    ctx.stroke();
    ctx.restore();
  }
  if (interpolate(frame, [58, 68], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) > 0) {
    cartoonRobot(ctx, frame, 1500, 830, 1.05, 58);
  }
  cartoonPerson(ctx, frame, 420, 830, 1.05, 0, { color: SKY, hair: "asker", label: "询问者" });
  cartoonPerson(ctx, frame, 960, 830, 1.05, 0, { color: EMERALD, hair: "man" });
  bubbleHand(ctx, frame, 1500, 400, 660, 88, "请把我排除在这之外：我从来不会写诗。", 104, VIOLET);
  textInk(ctx, "如果询问者还是分不出来——", 960, 660, 44, INK, 700, fade(frame, 160, 14));
  textInk(ctx, "“机器不能思考”就不再是显然的结论", 960, 730, 48, VIOLET, 700, fade(frame, 186, 14));
}

function Scene5(ctx: Ctx, frame: number) {
  drawPaper(ctx, frame);
  const a1 = fade(frame, 0, 10);
  if (a1 > 0) {
    ctx.save();
    ctx.globalAlpha = a1;
    textInk(ctx, "哲学问题", 660, 500, 88, INK_SOFT, 700);
    ctx.restore();
  }
  strokeHand(ctx, [[520, 540], [800, 470]], prog(frame, 46, 18), RED, 8, 71, 3);
  strokeHand(ctx, [[960, 505], [1140, 505]], prog(frame, 60, 24), SKY, 9, 72, 3);
  strokeHand(ctx, [[1110, 480], [1140, 505], [1110, 530]], prog(frame, 78, 14), SKY, 9, 73, 3);
  textInk(ctx, "行为判据", 1310, 505, 88, SKY, 700, fade(frame, 84, 14));
  // 天平涂鸦
  const tp = prog(frame, 100, 36);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, tp * 1.5);
    const tilt = 0.16 * Math.min(1, prog(frame, 116, 30));
    ctx.translate(960, 760);
    ctx.rotate(-tilt);
    strokeHand(ctx, [[0, -80], [0, 40]], tp, INK, 7, 74, 3);
    strokeHand(ctx, [[-150, -80], [150, -80]], tp, INK, 7, 75, 3);
    strokeHand(ctx, [[-150, -80], [-150, -20]], tp, INK, 6, 76, 3);
    strokeHand(ctx, [[150, -80], [150, -20]], tp, INK, 6, 77, 3);
    circleHand(ctx, 0, 48, 34, tp, INK, 6, 78);
    ctx.restore();
  }
  textInk(ctx, "判断智能，先看它会不会用语言", 960, 980, 42, INK, 700, fade(frame, 150, 16));
}

function Scene6(ctx: Ctx, frame: number) {
  drawPaper(ctx, frame);
  textInk(ctx, "1950 年，三样东西都没有", 960, 240, 56, INK, 700, fade(frame, 0, 12));
  const slots = [
    { label: "数据", x: 520 },
    { label: "算力", x: 960 },
    { label: "方法", x: 1400 },
  ];
  slots.forEach((s, i) => {
    const on = prog(frame, 14 + i * 26, 12);
    const off = interpolate(frame, [36 + i * 26, 48 + i * 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const glow = Math.max(0, on - off);
    const color = glow > 0.3 ? RED : INK;
    rectHand(ctx, s.x - 160, 330, 320, 240, Math.max(prog(frame, 8 + i * 26, 16), glow), color, 6, 80 + i, 26);
    if (glow > 0) {
      ctx.save();
      ctx.globalAlpha = glow * 0.18;
      ctx.fillStyle = RED;
      ctx.fillRect(s.x - 170, 320, 340, 260);
      ctx.restore();
    }
    textInk(ctx, s.label, s.x, 450, 74, color, 700, Math.max(fade(frame, 8 + i * 26, 12), glow));
  });
  // 儿童的大脑 + 火花
  const hp = fade(frame, 108, 16);
  if (hp > 0) {
    ctx.save();
    ctx.globalAlpha = hp;
    const hc = prog(frame, 112, 40);
    circleHand(ctx, 780, 780, 120, hc, PINK, 6, 91);
    strokeHand(ctx, [[730, 800], [830, 800]], prog(frame, 130, 20), PINK, 6, 92);
    const sp = prog(frame, 140, 24);
    strokeHand(ctx, [[980, 640], [1010, 606]], sp, SKY, 6, 93);
    strokeHand(ctx, [[1010, 606], [1010, 566]], prog(frame, 148, 16), SKY, 6, 94);
    strokeHand(ctx, [[1010, 566], [980, 532]], prog(frame, 152, 16), SKY, 6, 95);
    strokeHand(ctx, [[1010, 566], [1040, 532]], prog(frame, 156, 16), SKY, 6, 96);
    textInk(ctx, "儿童的大脑 + 学习", 960, 960, 46, PINK, 700, fade(frame, 160, 14));
    ctx.restore();
  }
  textInk(ctx, "图灵的愿景，比可行的时间早了六十年", 960, 1030, 36, INK_SOFT, 500, fade(frame, 176, 14));
}

function Scene7(ctx: Ctx, frame: number) {
  drawPaper(ctx, frame);
  const years = [1950, 1956, 1986, 2012, 2017, 2020, 2022, 2025, 2026];
  const startX = 190;
  const endX = 1730;
  const step = (endX - startX) / (years.length - 1);
  strokeHand(ctx, [[startX, 520], [endX, 520]], prog(frame, 0, 56), INK_SOFT, 5, 101, 2);
  years.forEach((y, i) => {
    const t0 = 30 + i * 20;
    const p = prog(frame, t0, 12);
    if (p <= 0) return;
    const x = startX + i * step;
    const color = y >= 2022 ? VIOLET : y === 2012 ? SKY : INK;
    ctx.save();
    ctx.globalAlpha = Math.min(1, p * 1.4);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, 520, 10, 0, Math.PI * 2);
    ctx.fill();
    textInk(ctx, String(y), x, 586, 34, color, 700, p);
    ctx.restore();
  });
  // 收尾标题
  const tp = fade(frame, 250, 16);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha = tp;
    textInk(ctx, "从图灵到 Harness", 960, 700, 100, INK, 700);
    textInk(ctx, "大语言模型的前世今生", 960, 792, 46, INK_SOFT, 500);
    textInk(ctx, "完整内容见 am5188.github.io/llm-harness", 960, 852, 32, SKY, 600);
    ctx.restore();
  }
  // 收获卡
  const gp = fade(frame, 280, 16);
  if (gp > 0) {
    ctx.save();
    ctx.globalAlpha = gp;
    ctx.fillStyle = "rgba(255,252,244,0.9)";
    ctx.beginPath();
    ctx.roundRect(560, 900, 800, 128, 24);
    ctx.fill();
    ctx.strokeStyle = "#d9b56a";
    ctx.lineWidth = 4;
    ctx.stroke();
    textInk(ctx, "看完这一章：智能问题，从此变成了语言行为问题", 960, 964, 34, INK, 700);
    ctx.restore();
  }
}

const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7];

export const Ch1Turing = () => {
  return (
    <AbsoluteFill style={{ background: PAPER }}>
      {HAS_AUDIO ? <Audio src={staticFile("remotion-assets/ch1-narration.mp3")} /> : null}
      {HAS_MUSIC ? <Audio src={staticFile("remotion-assets/ch1-music.wav")} volume={0.26} /> : null}
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
