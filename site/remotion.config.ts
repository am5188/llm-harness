import { Config } from "@remotion/cli/config";

// 合成不依赖 Node 内置模块；此文件保留以便后续需要时扩展 webpack 配置
Config.overrideWebpackConfig((c) => c);
