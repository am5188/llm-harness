"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Layer = {
  name: string;
  type: "conv" | "pool" | "fc";
  size: string;
  detail: string;
};

const LAYERS: Layer[] = [
  { name: "卷积层 1", type: "conv", size: "11×11 · 96 通道", detail: "直接啃原始像素：11×11 的大卷积核，用大步长在图像上滑动，抓取边缘和纹理。" },
  { name: "池化 1", type: "pool", size: "最大池化", detail: "把响应图缩小一半，只保留最强信号——让网络对位置不那么敏感。" },
  { name: "卷积层 2", type: "conv", size: "5×5 · 256 通道", detail: "在边缘纹理之上组合出更复杂的形状：拐角、圆弧、局部图案。" },
  { name: "池化 2", type: "pool", size: "最大池化", detail: "再次缩小，把计算量压下来，同时扩大每个神经元的视野。" },
  { name: "卷积层 3", type: "conv", size: "3×3 · 384 通道", detail: "小卷积核、更多通道：开始出现“部件级”表示。" },
  { name: "卷积层 4", type: "conv", size: "3×3 · 384 通道", detail: "同尺寸加深一层，非线性的叠加让表示更丰富。" },
  { name: "卷积层 5", type: "conv", size: "3×3 · 256 通道", detail: "最后一层卷积，输出被压进两个 GPU 各自计算一半。" },
  { name: "池化 3", type: "pool", size: "最大池化", detail: "第三次缩小，为全连接层准备紧凑的特征。" },
  { name: "全连接 6-7", type: "fc", size: "4096 神经元 ×2", detail: "把卷积抽出的特征汇总成 4096 维的“结论候选”，dropout 防止死记硬背。" },
  { name: "输出层", type: "fc", size: "1000 类", detail: "给 1000 个 ImageNet 类别打分，分数最高的就是答案。" },
];

const TYPE_STYLE: Record<Layer["type"], string> = {
  conv: "from-sky-500/40 to-cyan-500/20 border-sky-400/30",
  pool: "from-slate-500/30 to-slate-500/10 border-slate-400/20",
  fc: "from-purple-500/40 to-fuchsia-500/20 border-purple-400/30",
};

export function AlexnetLayers() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="glass my-8 rounded-3xl p-6 md:p-8">
      <h3 className="mb-1 text-lg font-bold text-white">AlexNet 的八层结构</h3>
      <p className="mb-6 text-xs text-slate-500">点击每一层看它在做什么。输入一张 227×227 的图片，输出 1000 个类别的分数。</p>

      <div className="space-y-1.5">
        {LAYERS.map((layer, i) => (
          <button
            key={layer.name}
            type="button"
            onClick={() => setSelected(selected === i ? null : i)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border bg-gradient-to-r px-4 py-2.5 text-left transition",
              TYPE_STYLE[layer.type],
              selected === i ? "ring-2 ring-white/30" : "hover:brightness-125",
            )}
          >
            <span className="w-24 shrink-0 text-xs font-semibold text-white">{layer.name}</span>
            <span className="w-32 shrink-0 font-mono text-[11px] text-slate-300">{layer.size}</span>
            <span className="hidden flex-1 text-right text-[10px] text-slate-400 md:block">
              {layer.type === "conv" ? "卷积" : layer.type === "pool" ? "池化" : "全连接"}
            </span>
          </button>
        ))}
      </div>

      {selected !== null ? (
        <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
          <span className="font-semibold text-white">{LAYERS[selected].name}</span>
          {"　"}{LAYERS[selected].detail}
        </div>
      ) : (
        <p className="mt-4 text-center text-xs text-slate-500">↑ 点一层看看</p>
      )}

      <p className="mt-5 border-t border-white/5 pt-4 text-xs leading-5 text-slate-500">
        结构图基于论文第 3 节；GPU 型号、训练时长等工程细节以论文 PDF 为准逐项核对，暂不作为确定事实。
      </p>
    </div>
  );
}
