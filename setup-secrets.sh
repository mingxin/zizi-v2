#!/bin/bash

# 自动配置 GitHub Secrets 脚本
# 使用方法: ./setup-secrets.sh

echo "🔐 Zizi 2.0 GitHub Secrets 配置助手"
echo "=================================="
echo ""

# 检查 gh CLI
if ! command -v gh &> /dev/null; then
    echo "❌ 请先安装 GitHub CLI: https://cli.github.com/"
    exit 1
fi

# 检查登录状态
if ! gh auth status &> /dev/null; then
    echo "❌ 请先登录 GitHub CLI: gh auth login"
    exit 1
fi

REPO="mingxin/zizi-v2"

echo "✅ 已连接到 GitHub"
echo ""

# Vercel Secrets
echo "📦 配置 Vercel Secrets"
echo "----------------------"
echo "请访问 https://vercel.com/account/tokens 创建 token"
read -p "VERCEL_TOKEN: " VERCEL_TOKEN
read -p "后端API地址 (如 https://zizi-api.onrender.com/api): " API_URL

if [ -n "$VERCEL_TOKEN" ]; then
    gh secret set VERCEL_TOKEN -b "$VERCEL_TOKEN" -R "$REPO"
    echo "✅ VERCEL_TOKEN 已设置"
fi

gh secret set VERCEL_ORG_ID -b "team_ZNSvE35IbGeuubo57hL5kHLB" -R "$REPO"
echo "✅ VERCEL_ORG_ID 已设置"

gh secret set VERCEL_PROJECT_ID -b "prj_3yn30ur2DGIwYEA8KvtOm7ES2WNH" -R "$REPO"
echo "✅ VERCEL_PROJECT_ID 已设置"

if [ -n "$API_URL" ]; then
    gh secret set VITE_API_BASE_URL -b "$API_URL" -R "$REPO"
    echo "✅ VITE_API_BASE_URL 已设置"
fi

echo ""
echo "📦 配置 Render Secrets (可选)"
echo "-----------------------------"
echo "请先访问 https://dashboard.render.com 创建服务"
read -p "RENDER_SERVICE_ID (如 srv-xxx，没有则回车跳过): " RENDER_SERVICE_ID
read -p "RENDER_API_KEY (没有则回车跳过): " RENDER_API_KEY

if [ -n "$RENDER_SERVICE_ID" ]; then
    gh secret set RENDER_SERVICE_ID -b "$RENDER_SERVICE_ID" -R "$REPO"
    echo "✅ RENDER_SERVICE_ID 已设置"
fi

if [ -n "$RENDER_API_KEY" ]; then
    gh secret set RENDER_API_KEY -b "$RENDER_API_KEY" -R "$REPO"
    echo "✅ RENDER_API_KEY 已设置"
fi

echo ""
echo "🎉 配置完成！"
echo "查看 Secrets: https://github.com/$REPO/settings/secrets/actions"
