// 全书时间线数据，与仓库 timeline/00-大语言模型关键时间线.md 保持同步。
// stage 对应卷；events 为时间线明细（三档缩放：全书阶段 → 阶段事件 → 事件详情）。
export type TimelineEvent = {
  date: string;
  label: string;
  meaning: string;
  volume: number;
  evidence?: string;
  chapter?: string;
};

export const STAGES = [
  { id: "s1", label: "图灵之问", range: "1950", volume: 1, chapter: "ch1-turing" },
  { id: "s2", label: "两个冬天", range: "1956–1990s", volume: 1, chapter: "ch2-two-winters" },
  { id: "s3", label: "深度学习复燃", range: "2012", volume: 1, chapter: "ch3-alexnet" },
  { id: "s4", label: "词向量与注意力", range: "2013–2017", volume: 2, chapter: "ch4-words" },
  { id: "s5", label: "Transformer", range: "2017", volume: 2, chapter: "ch5-transformer" },
  { id: "s6", label: "预训练与规模化", range: "2018–2022", volume: 2, chapter: "ch6-pretraining" },
  { id: "s7", label: "ChatGPT 时刻", range: "2022-11", volume: 3, chapter: "ch9-chatgpt" },
  { id: "s8", label: "开放权重时代", range: "2023–2025", volume: 3, chapter: "ch10-open-weights" },
  { id: "s9", label: "效率与推理", range: "2024–2025", volume: 3, chapter: "ch11-efficiency" },
  { id: "s10", label: "走向 Harness", range: "2020–2026-10-01", volume: 4, chapter: "ch14-harness" },
] as const;

export const EVENTS: TimelineEvent[] = [
  {
    date: "1950-10",
    label: "图灵发表《Computing Machinery and Intelligence》",
    meaning: "把“机器会思考吗”转化为可观察的语言行为问题",
    volume: 1,
    evidence: "E-0008",
    chapter: "ch1-turing",
  },
  {
    date: "1955-08-31",
    label: "Dartmouth 暑期研究项目提案",
    meaning: "人工智能成为一门学科，语言与学习被列入议程",
    volume: 1,
    evidence: "E-0009",
    chapter: "ch2-two-winters",
  },
  {
    date: "1970s–1990s",
    label: "两次 AI 冬天与连接主义积累",
    meaning: "符号系统扩展受限；反向传播保留“从数据学习”路线",
    volume: 1,
    evidence: "E-0010",
    chapter: "ch2-two-winters",
  },
  {
    date: "2012-09",
    label: "AlexNet 赢得 ImageNet",
    meaning: "数据 + GPU + 深层网络成为可复现的工程路线",
    volume: 1,
    evidence: "E-0011",
    chapter: "ch3-alexnet",
  },
  {
    date: "2013",
    label: "Word2Vec 发布",
    meaning: "词的语义可被稠密向量捕捉",
    volume: 2,
    chapter: "ch4-words",
  },
  {
    date: "2014",
    label: "seq2seq 与注意力机制",
    meaning: "序列到序列建模与对齐注意力成为语言模型核心部件",
    volume: 2,
    chapter: "ch4-words",
  },
  {
    date: "2017-06",
    label: "《Attention Is All You Need》",
    meaning: "Transformer 让并行训练与长程依赖同时成立",
    volume: 2,
    evidence: "E-0001",
    chapter: "ch5-transformer",
  },
  {
    date: "2018",
    label: "BERT 与 GPT-1",
    meaning: "预训练—适配范式成熟",
    volume: 2,
    chapter: "ch6-pretraining",
  },
  {
    date: "2019",
    label: "GPT-2；微软投资 OpenAI",
    meaning: "规模化模型与产业基础设施结合",
    volume: 2,
    chapter: "ch8-money",
  },
  {
    date: "2020-05",
    label: "GPT-3 与 OpenAI API",
    meaning: "少样本能力与“模型即服务”",
    volume: 2,
    evidence: "E-0002",
    chapter: "ch7-scaling",
  },
  {
    date: "2022-01",
    label: "InstructGPT 发表",
    meaning: "SFT + RLHF 让模型从续写变成可对话",
    volume: 2,
    chapter: "ch7-scaling",
  },
  {
    date: "2022-03",
    label: "Chinchilla 论文",
    meaning: "参数与数据的最优配比：更大不等于更好",
    volume: 2,
    evidence: "E-0003",
    chapter: "ch11-efficiency",
  },
  {
    date: "2022-11-30",
    label: "ChatGPT 发布",
    meaning: "研究积累 + 对齐 + 产品分发同时成熟，成为分水岭",
    volume: 3,
    evidence: "E-0004",
    chapter: "ch9-chatgpt",
  },
  {
    date: "2023-02",
    label: "Meta 发布 LLaMA",
    meaning: "开放权重推动研究与创业生态扩散",
    volume: 3,
    evidence: "E-0005",
    chapter: "ch10-open-weights",
  },
  {
    date: "2023–2024",
    label: "中国大模型密集发布",
    meaning: "国内产业进入规模化竞争，算力约束成为工程主题",
    volume: 3,
    chapter: "ch12-china",
  },
  {
    date: "2024-12-26",
    label: "DeepSeek-V3 发布",
    meaning: "高效训练与开放权重",
    volume: 3,
    evidence: "E-0006",
    chapter: "ch11-efficiency",
  },
  {
    date: "2025-01",
    label: "DeepSeek-R1 发布",
    meaning: "推理模型与强化学习路线引发全球关注",
    volume: 3,
    evidence: "E-0007",
    chapter: "ch11-efficiency",
  },
  {
    date: "2020–2026-10-01",
    label: "RAG → 工具调用 → Agent → Harness",
    meaning: "模型本身动不了手，外部系统补齐状态、工具与治理",
    volume: 4,
    chapter: "ch14-harness",
  },
];
