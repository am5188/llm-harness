# E-0013｜GloVe：全局词共现统计与向量表示

### 2014-10｜EMNLP 论文公开

- **事件类型**：会议论文 / 词向量方法
- **事实**：Pennington、Socher 与 Manning 提出 GloVe（Global Vectors），将全局词—词共现统计用于学习词向量；论文讨论了全局矩阵统计与局部上下文窗口之间的关系，并在词相似度与类比任务上评估表示质量。
- **影响**：它展示了词向量不只有局部预测路线，也可以从大规模共现结构中学习连续表示；这条“统计结构→稠密表示”的路线与 Word2Vec 共同构成语言模型规模化前的表示基础。
- **与时间线的关系**：事实：论文发表于 EMNLP 2014。解释：GloVe 与 Word2Vec 都把词变成可计算向量，但评测任务上的高分不等于具备一般语义理解。
- **证据**：[S-0007]（A）
- **原文定位**：摘要；第 3 节模型目标；第 4 节实验与表格（正式卡片建立时补 PDF 页码）。
- **来源**：Jeffrey Pennington, Richard Socher, Christopher D. Manning, “GloVe: Global Vectors for Word Representation,” EMNLP 2014, https://aclanthology.org/D14-1162/；PDF：https://aclanthology.org/D14-1162.pdf
- **访问日期**：2026-10-02
- **待核查**：类比任务的具体百分比、训练语料版本和表格数字需回到 PDF 逐项核对。
