import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/NotoSansSC";

const { fontFamily } = loadFont();

const SKY = "#38bdf8";
const CYAN = "#22d3ee";
const EMERALD = "#34d399";
const PURPLE = "#a78bfa";
const TEXT = "#e2e8f0";
const DIM = "#94a3b8";

const BG: React.CSSProperties = {
  background:
    "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59,130,246,0.22), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(139,92,246,0.15), transparent), #0a0f1e",
};

function Fade({
  children,
  start,
  duration = 24,
  y = 0,
  style,
}: {
  children: React.ReactNode;
  start: number;
  duration?: number;
  y?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Typewriter({ text, start, speed = 2.2, color = TEXT, fontSize = 44, style }: {
  text: string;
  start: number;
  speed?: number;
  color?: string;
  fontSize?: number;
  style?: React.CSSProperties;
}) {
  const frame = useCurrentFrame();
  const count = Math.floor(interpolate(frame, [start, start + text.length * speed], [0, text.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const showCursor = frame > start && frame < start + text.length * speed + 40;
  return (
    <div style={{ fontFamily, fontSize, color, lineHeight: 1.5, ...style }}>
      {text.slice(0, count)}
      {showCursor ? (
        <span style={{ display: "inline-block", width: 3, height: fontSize * 0.9, background: SKY, marginLeft: 6, verticalAlign: "middle", opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0.2 }} />
      ) : null}
    </div>
  );
}

function Card({ start, delay = 0, x = 0, width = 420, borderColor, title, color, children }: {
  start: number;
  delay?: number;
  x?: number;
  width?: number;
  borderColor: string;
  title: string;
  color: string;
  children?: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  const sp = spring({ frame: frame - start - delay, fps: 30, config: { damping: 14, stiffness: 110, mass: 0.9 } });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 380,
        width,
        padding: "28px 32px",
        borderRadius: 20,
        border: `1px solid ${borderColor}55`,
        background: "rgba(255,255,255,0.04)",
        transform: `translateY(${(1 - sp) * 60}px) scale(${0.92 + 0.08 * sp})`,
        opacity: sp,
      }}
    >
      <div style={{ fontFamily, fontSize: 26, fontWeight: 700, color, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Bubble({ start, text, speed = 2.2, color = TEXT, maxWidth = 360 }: {
  start: number;
  text: string;
  speed?: number;
  color?: string;
  maxWidth?: number;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        padding: "14px 18px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.06)",
        maxWidth,
        width: "fit-content",
      }}
    >
      <Typewriter text={text} start={start} speed={speed} color={color} fontSize={30} />
    </div>
  );
}

function TitleScene() {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ ...BG, justifyContent: "center", alignItems: "center", fontFamily }}>
      <div style={{ opacity: fade, textAlign: "center" }}>
        <div style={{ fontSize: 96, fontWeight: 700, color: TEXT }}>
          从<span style={{ color: SKY }}>图灵</span>到<span style={{ color: PURPLE }}>Harness</span>
        </div>
        <div style={{ fontSize: 40, color: DIM, marginTop: 24 }}>大语言模型的前世今生</div>
      </div>
    </AbsoluteFill>
  );
}

function Scene1950() {
  return (
    <AbsoluteFill style={{ ...BG, justifyContent: "center", alignItems: "center", fontFamily }}>
      <Fade start={0}>
        <div style={{ fontSize: 150, fontWeight: 700, color: SKY }}>1950</div>
      </Fade>
      <Fade start={40} style={{ marginTop: 20, textAlign: "center" }}>
        <div style={{ fontSize: 36, color: DIM }}>英国《Mind》期刊 · 《Computing Machinery and Intelligence》</div>
      </Fade>
      <Fade start={80} style={{ marginTop: 46 }}>
        <Typewriter text="我提议考虑这样一个问题：机器能思考吗？" start={80} fontSize={52} color={TEXT} />
      </Fade>
      <Fade start={230} style={{ marginTop: 34 }}>
        <div style={{ fontSize: 34, color: DIM }}>随后作者承认：这个问题没法直接回答。</div>
      </Fade>
    </AbsoluteFill>
  );
}

function SceneSwap() {
  return (
    <AbsoluteFill style={{ ...BG, justifyContent: "center", alignItems: "center", fontFamily }}>
      <Fade start={0}>
        <div style={{ fontSize: 44, color: DIM, textDecoration: "line-through" }}>“思考”是什么？—— 定义之争，永远吵不完</div>
      </Fade>
      <Fade start={70} y={30} style={{ marginTop: 60 }}>
        <div style={{ fontSize: 56, fontWeight: 700, color: TEXT }}>
          换成<span style={{ color: CYAN }}>可操作的问题</span>
        </div>
      </Fade>
      <Fade start={130} style={{ marginTop: 40 }}>
        <div style={{ fontSize: 36, color: DIM }}>一个流行于英国客厅的派对游戏——</div>
      </Fade>
    </AbsoluteFill>
  );
}

function SceneGame() {
  return (
    <AbsoluteFill style={{ ...BG, fontFamily }}>
      <Fade start={0}>
        <div style={{ textAlign: "center", fontSize: 52, fontWeight: 700, color: TEXT, marginTop: 110 }}>
          模仿游戏
        </div>
      </Fade>
      <Card start={20} x={180} borderColor={SKY} title="询问者" color={SKY} width={400}>
        <Bubble start={55} text="你的头发有多长？" color={SKY} />
      </Card>
      <Card start={20} delay={18} x={760} borderColor={EMERALD} title="A · 男人（如实回答）" color={EMERALD} width={400}>
        <Bubble start={140} text="我的头发是短发，大约 5 厘米。" color={EMERALD} />
      </Card>
      <Card start={20} delay={36} x={1340} borderColor="#f472b6" title="B · 女人（误导询问者）" color="#f472b6" width={420}>
        <Bubble start={230} text="我的头发也是短发！只有 5 厘米，真的。" color="#f472b6" />
      </Card>
      <Fade start={420} style={{ position: "absolute", bottom: 120, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 40, color: TEXT }}>判断的依据只有<span style={{ color: SKY, fontWeight: 700 }}>语言行为</span>——看不到人，只能看字。</div>
      </Fade>
    </AbsoluteFill>
  );
}

function SceneReplace() {
  return (
    <AbsoluteFill style={{ ...BG, justifyContent: "center", alignItems: "center", fontFamily }}>
      <Fade start={0}>
        <div style={{ fontSize: 46, color: DIM }}>图灵的置换：把其中一个角色，换成机器</div>
      </Fade>
      <Fade start={60} y={20} style={{ marginTop: 50 }}>
        <div style={{ padding: "20px 40px", borderRadius: 18, background: "rgba(255,255,255,0.05)", border: `1px solid ${PURPLE}66`, maxWidth: 1200 }}>
          <Typewriter text="请写一首关于福斯桥的十四行诗。" start={80} fontSize={42} color={SKY} />
        </div>
      </Fade>
      <Fade start={200} y={20} style={{ marginTop: 36 }}>
        <div style={{ padding: "20px 40px", borderRadius: 18, background: "rgba(167,139,250,0.10)", border: `1px solid ${PURPLE}88`, maxWidth: 1200 }}>
          <Typewriter text="请把我排除在这之外：我从来不会写诗。" start={230} fontSize={42} color={PURPLE} />
        </div>
      </Fade>
      <Fade start={360} style={{ marginTop: 60 }}>
        <div style={{ fontSize: 40, color: TEXT }}>如果分不出来——</div>
      </Fade>
      <Fade start={400} style={{ marginTop: 20 }}>
        <div style={{ fontSize: 44, fontWeight: 700, color: CYAN }}>“机器不能思考”就不再是显然的结论</div>
      </Fade>
    </AbsoluteFill>
  );
}

function SceneCriterion() {
  return (
    <AbsoluteFill style={{ ...BG, justifyContent: "center", alignItems: "center", fontFamily }}>
      <Fade start={0}>
        <div style={{ fontSize: 60, fontWeight: 700, color: TEXT }}>
          智能问题 <span style={{ color: SKY, fontSize: 70 }}>→</span> 语言行为判据
        </div>
      </Fade>
      <Fade start={60} style={{ marginTop: 46 }}>
        <div style={{ fontSize: 38, color: DIM }}>此后所有对话系统、聊天机器人、大模型的评测</div>
      </Fade>
      <Fade start={100} style={{ marginTop: 16 }}>
        <div style={{ fontSize: 38, color: DIM }}>都从这个起点长出来。</div>
      </Fade>
    </AbsoluteFill>
  );
}

function SceneGap() {
  return (
    <AbsoluteFill style={{ ...BG, justifyContent: "center", alignItems: "center", fontFamily }}>
      <Fade start={0}>
        <div style={{ fontSize: 58, fontWeight: 700, color: TEXT }}>目标有了，<span style={{ color: "#fbbf24" }}>路径还没有</span></div>
      </Fade>
      <Fade start={70} style={{ marginTop: 44 }}>
        <div style={{ display: "flex", gap: 26 }}>
          {["没有数据", "没有算力", "没有可扩展的学习方法"].map((t, i) => (
            <div key={t} style={{ padding: "18px 34px", borderRadius: 16, border: "1px solid rgba(251,191,36,0.4)", background: "rgba(251,191,36,0.08)", fontSize: 34, color: "#fde68a" }}>
              {t}
            </div>
          ))}
        </div>
      </Fade>
      <Fade start={160} style={{ marginTop: 70 }}>
        <div style={{ fontSize: 40, color: DIM }}>图灵描画了终点，但通往终点的路一条都没有铺好。</div>
      </Fade>
      <Fade start={230} style={{ marginTop: 40 }}>
        <div style={{ fontSize: 44, fontWeight: 700, color: SKY }}>下一章：1956 达特茅斯 —— 一门学科诞生了</div>
      </Fade>
    </AbsoluteFill>
  );
}

function EndCard() {
  return (
    <AbsoluteFill style={{ ...BG, justifyContent: "center", alignItems: "center", fontFamily }}>
      <Fade start={0}>
        <div style={{ fontSize: 46, color: TEXT }}>完整内容与证据，见</div>
      </Fade>
      <Fade start={40} style={{ marginTop: 30 }}>
        <div style={{ fontSize: 52, fontWeight: 700, color: CYAN }}>am5188.github.io/llm-harness</div>
      </Fade>
      <Fade start={80} style={{ marginTop: 30 }}>
        <div style={{ fontSize: 36, color: DIM }}>《从图灵到 Harness：大语言模型的前世今生》</div>
      </Fade>
    </AbsoluteFill>
  );
}

export const Ch1Turing = () => {
  const { fps } = useVideoConfig();
  const s = (sec: number) => Math.round(sec * fps);
  return (
    <AbsoluteFill style={BG}>
      <Sequence from={s(0)} durationInFrames={s(4.5)}>
        <TitleScene />
      </Sequence>
      <Sequence from={s(4.5)} durationInFrames={s(12)}>
        <Scene1950 />
      </Sequence>
      <Sequence from={s(16.5)} durationInFrames={s(7)}>
        <SceneSwap />
      </Sequence>
      <Sequence from={s(23.5)} durationInFrames={s(17.5)}>
        <SceneGame />
      </Sequence>
      <Sequence from={s(41)} durationInFrames={s(13)}>
        <SceneReplace />
      </Sequence>
      <Sequence from={s(54)} durationInFrames={s(6.5)}>
        <SceneCriterion />
      </Sequence>
      <Sequence from={s(60.5)} durationInFrames={s(10.5)}>
        <SceneGap />
      </Sequence>
      <Sequence from={s(66)} durationInFrames={s(4)}>
        <EndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
