#!/usr/bin/env bash
# 构建静态站并把 out/ 推到 gh-pages 分支（GitHub Pages 的 legacy 模式）。
# 用法：cd site && bash scripts/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo "▶ 构建静态站…"
rm -rf out
npx next build

# GitHub Pages 默认跑 Jekyll，会吞掉下划线开头的目录（_next）——必须关掉
touch out/.nojekyll

echo "▶ 推送到 gh-pages…"
REMOTE="$(git remote get-url origin)"
cd out
rm -rf .git
git init -q -b gh-pages
git add -A
git -c user.name="deploy" -c user.email="deploy@local" commit -qm "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
git push -qf "$REMOTE" gh-pages

echo "✅ 已发布 → https://am5188.github.io/llm-harness/"
