// S-xxxx 来源中央注册表。新增来源必须在此登记，证据卡与正文脚注才能引用。
export type SourceGrade = "A" | "B" | "C";

export type Source = {
  id: string;
  grade: SourceGrade;
  title: string;
  authors?: string;
  venue?: string;
  date?: string;
  url?: string;
  note?: string;
};

export const SOURCES: Record<string, Source> = {
  "S-0001": {
    id: "S-0001",
    grade: "A",
    title: "Computing Machinery and Intelligence",
    authors: "Alan M. Turing",
    venue: "Mind 59(236), 433–460",
    date: "1950-10",
    url: "https://doi.org/10.1093/mind/LIX.236.433",
  },
  "S-0002": {
    id: "S-0002",
    grade: "A",
    title: "A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence",
    authors: "John McCarthy, Marvin Minsky, Nathaniel Rochester, Claude Shannon",
    date: "1955-08-31",
    url: "https://raysolomonoff.com/dartmouth/boxa/dart564props.pdf",
  },
  "S-0003": {
    id: "S-0003",
    grade: "A",
    title: "Learning representations by back-propagating errors",
    authors: "David E. Rumelhart, Geoffrey E. Hinton, Ronald J. Williams",
    venue: "Nature 323, 533–536",
    date: "1986",
    url: "https://doi.org/10.1038/323533a0",
  },
  "S-0004": {
    id: "S-0004",
    grade: "B",
    title: "Artificial Intelligence: A Modern Approach",
    authors: "Stuart Russell, Peter Norvig",
    note: "AI 历史与专家系统章节，版本待核对",
  },
  "S-0005": {
    id: "S-0005",
    grade: "A",
    title: "ImageNet Classification with Deep Convolutional Neural Networks",
    authors: "Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton",
    venue: "NeurIPS 2012",
    date: "2012-09",
    url: "https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks",
  },
};

export function getSource(id: string): Source | undefined {
  return SOURCES[id];
}
