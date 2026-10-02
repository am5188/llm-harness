# S-来源索引（中央注册表）

证据卡片与正文脚注引用的 `S-xxxx` 编号统一在此登记。格式：编号｜等级｜标题｜作者/机构｜日期｜URL。新增来源必须先登记再引用。

| 编号 | 等级 | 标题 | 作者/机构 | 日期 | URL |
|---|---|---|---|---|---|
| S-0001 | A | Computing Machinery and Intelligence | Alan M. Turing | 1950-10 | https://doi.org/10.1093/mind/LIX.236.433 |
| S-0002 | A | A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence | McCarthy, Minsky, Rochester, Shannon | 1955-08-31 | https://raysolomonoff.com/dartmouth/boxa/dart564props.pdf |
| S-0003 | A | Learning representations by back-propagating errors | Rumelhart, Hinton, Williams | 1986 | https://doi.org/10.1038/323533a0 |
| S-0004 | B | Artificial Intelligence: A Modern Approach（AI 历史与专家系统章节） | Russell & Norvig | — | 版本待核对 |
| S-0005 | A | ImageNet Classification with Deep Convolutional Neural Networks | Krizhevsky, Sutskever, Hinton | 2012-09 | https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks |
| S-0006 | A | Efficient Estimation of Word Representations in Vector Space | Mikolov et al. | 2013-01-16（首稿） | https://arxiv.org/abs/1301.3781 |
| S-0007 | A | GloVe: Global Vectors for Word Representation | Pennington, Socher, Manning | 2014-10 | https://aclanthology.org/D14-1162/ |
| S-0008 | A | Sequence to Sequence Learning with Neural Networks | Sutskever, Vinyals, Le | 2014-09-07（首稿） | https://arxiv.org/abs/1409.3215 |
| S-0009 | A | Neural Machine Translation by Jointly Learning to Align and Translate | Bahdanau, Cho, Bengio | 2014-09-01（首稿） | https://arxiv.org/abs/1409.0473 |

## 维护要求

- 等级定义见 [研究与证据规范](研究与证据规范.md)：A 一手来源、B 高质量二手来源、C 线索来源。
- 站点 `site/src/lib/sources.ts` 与本表保持同步；改动后需同步两处。
- 待建卡片（E-0001～E-0007）完成时，其来源在此登记新编号。
