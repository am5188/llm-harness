import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { useEffect, useRef } from "react";

const W = 1920;
const H = 1080;
const PAPER = "#f8ecd2";
const INK = "#242633";
const BLUE = "#0e7cb8";
const PINK = "#d96a9e";
const PURPLE = "#6d4fc4";
const GREEN = "#2e8b68";

type Ctx = CanvasRenderingContext2D;

function ease(t: number) {
  return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
}

function line(ctx: Ctx, points: [number, number][], progress: number, color: string, width = 8) {
  const p = Math.max(0, Math.min(1, progress));
  if (!p) return;
  const count = Math.max(2, Math.ceil(points.length * p));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < count; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();
  ctx.restore();
}

function text(ctx: Ctx, value: string, x: number, y: number, size: number, color = INK, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px "Noto Sans SC", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(value, x, y);
  ctx.restore();
}

function speech(ctx: Ctx, x: number, y: number, w: number, value: string, progress: number, color: string) {
  const p = ease(progress);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.9 + p * 0.1, 0.9 + p * 0.1);
  ctx.globalAlpha = p;
  ctx.fillStyle = "#fffaf0";
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -48, w, 96, 24);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 55, 48);
  ctx.lineTo(-w / 2 + 18, 84);
  ctx.lineTo(-w / 2 + 95, 48);
  ctx.fill();
  ctx.stroke();
  text(ctx, value, 0, 0, 34, INK);
  ctx.restore();
}

function person(ctx: Ctx, x: number, y: number, progress: number, color: string, hair: "curly" | "bob") {
  const p = ease(progress);
  ctx.save();
  ctx.translate(x, y + (1 - p) * 80);
  ctx.globalAlpha = p;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(-58, 80, 116, 130, 30);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = "#ffd9b3";
  ctx.beginPath();
  ctx.arc(0, 0, 72, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = hair === "bob" ? PINK : "#c9883d";
  ctx.beginPath();
  ctx.arc(0, -12, 76, hair === "bob" ? Math.PI : Math.PI * 2, hair === "bob" ? Math.PI * 2 : Math.PI * 3);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(-24, -2, 8, 0, Math.PI * 2);
  ctx.arc(24, -2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(0, 18, 20, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function robot(ctx: Ctx, x: number, y: number, progress: number) {
  const p = ease(progress);
  ctx.save();
  ctx.translate(x, y + (1 - p) * 80);
  ctx.globalAlpha = p;
  ctx.fillStyle = PURPLE;
  ctx.beginPath();
  ctx.roundRect(-72, -10, 144, 150, 28);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = "#1b1b2d";
  ctx.beginPath();
  ctx.roundRect(-45, 22, 90, 58, 16);
  ctx.fill();
  ctx.fillStyle = "#22d3ee";
  ctx.beginPath();
  ctx.arc(-20, 50, 8, 0, Math.PI * 2);
  ctx.arc(20, 50, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(0, -58);
  ctx.stroke();
  ctx.fillStyle = "#22d3ee";
  ctx.beginPath();
  ctx.arc(0, -68, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawScene(ctx: Ctx, frame: number) {
  const t = frame / 30;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PAPER);
  g.addColorStop(1, "#efd7ac");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Scene 1: question falls into the page
  if (t < 3.5) {
    const p = ease(t / 1.8);
    text(ctx, "？", 960, 390 - (1 - p) * 260, 300, INK, p);
    text(ctx, "你觉得，机器会思考吗？", 960, 700, 70, INK, ease((t - 0.7) / 1.4));
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.arc(960, 535, 18 + Math.sin(frame * 0.1) * 4, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, "一个问题，改变了整个领域", 960, 890, 38, BLUE, ease((t - 1.7) / 1));
    return;
  }

  // Scene 2: Turing draws himself as a narrator
  if (t < 7.5) {
    const p = ease((t - 3.5) / 1.3);
    line(ctx, [[620, 650], [740, 400], [960, 300], [1180, 400], [1300, 650]], p, "rgba(43,43,51,0.24)", 6);
    person(ctx, 960, 460, p, BLUE, "curly");
    text(ctx, "1950 年，图灵也问过这个问题。", 960, 830, 54, INK, ease((t - 4.7) / 1));
    speech(ctx, 960, 180, 580, "机器能思考吗？", ease((t - 5.4) / 0.8), BLUE);
    return;
  }

  // Scene 3: question becomes a game card
  if (t < 11.5) {
    const p = ease((t - 7.5) / 1.2);
    ctx.save();
    ctx.translate(960, 510);
    ctx.rotate((1 - p) * -0.14);
    ctx.fillStyle = "#fffaf0";
    ctx.strokeStyle = BLUE;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.roundRect(-430, -240, 860, 480, 34);
    ctx.fill();
    ctx.stroke();
    text(ctx, "模仿游戏", 0, -110, 78, BLUE, p);
    text(ctx, "隔着文字，判断对面是谁", 0, 20, 46, INK, p);
    person(ctx, -170, 100, p, GREEN, "curly");
    person(ctx, 170, 100, p, PINK, "bob");
    ctx.restore();
    text(ctx, "但他很快发现：原问题太难直接回答。", 960, 890, 50, INK, ease((t - 8.8) / 1));
    return;
  }

  // Scene 4: swap one person into a machine
  const p = ease((t - 11.5) / 1.2);
  text(ctx, "所以，他换了一个问法。", 960, 170, 64, INK, p);
  person(ctx, 670, 560, 1, GREEN, "curly");
  const flip = ease((t - 12.2) / 1.1);
  ctx.save();
  ctx.translate(1250, 560);
  ctx.scale(Math.max(0.05, Math.abs(Math.cos(flip * Math.PI))), 1);
  if (flip < 0.5) person(ctx, 0, 0, 1, PINK, "bob");
  else robot(ctx, 0, 0, 1);
  ctx.restore();
  text(ctx, "人？还是机器？", 960, 900, 72, flip > 0.5 ? PURPLE : PINK, 1);
  speech(ctx, 960, 310, 610, "隔着文字，你能分辨出它吗？", ease((t - 12.7) / 0.7), PURPLE);
}

export const Ch1StyleSample = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile("remotion-assets/ch1-sample-narration.mp3")} />
      <CanvasScene />
    </AbsoluteFill>
  );
};

function CanvasScene() {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawScene(ctx, frame);
  }, [frame]);
  return <canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%" }} />;
}
