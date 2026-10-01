import type { NextConfig } from "next";
import createMDX from "@next/mdx";

/**
 * 静态导出，托在 GitHub Pages 的子路径上：
 *   https://am5188.github.io/llm-harness/
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/llm-harness";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {},
});

export default withMDX(nextConfig);
