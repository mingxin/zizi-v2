# Zizi 2.0 部署指南

## 🚀 自动部署流程

项目已配置 GitHub Actions，推送代码到 `main` 分支时会自动部署：
- **前端** → Vercel
- **后端** → Render

---

## 📋 需要配置的 Secrets

### 1. Vercel (前端部署)

在 GitHub Repository Settings → Secrets and variables → Actions 中添加：

| Secret Name | 值 |
|------------|-----|
| `VERCEL_TOKEN` | 运行 `vercel token` 获取 |
| `VERCEL_ORG_ID` | `team_ZNSvE35IbGeuubo57hL5kHLB` |
| `VERCEL_PROJECT_ID` | `prj_3yn30ur2DGIwYEA8KvtOm7ES2WNH` |
| `VITE_API_BASE_URL` | 后端 API 地址，如 `https://zizi-api.onrender.com/api` |

获取 VERCEL_TOKEN：
```bash
vercel token
```

### 2. Render (后端部署)

| Secret Name | 值 |
|------------|-----|
| `RENDER_SERVICE_ID` | Render Dashboard 中的 Service ID |
| `RENDER_API_KEY` | Render Account Settings → API Keys |

获取步骤：
1. 在 Render 创建 Web Service
2. 绑定 GitHub 仓库
3. 在 Render Dashboard 获取 Service ID (URL 中的部分)
4. 在 Account Settings → API Keys 创建 API Key

---

## 🔧 Render 服务配置

创建 Web Service 时的配置：

| 配置项 | 值 |
|--------|-----|
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm run start:prod` |
| Root Directory | `zizi_server/backend` |

环境变量：
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
DASHSCOPE_API_KEY=your-aliyun-key
ALIYUN_OSS_ACCESS_KEY_ID=...
ALIYUN_OSS_ACCESS_KEY_SECRET=...
ALIYUN_OSS_BUCKET=...
ALIYUN_OSS_REGION=...
ALIYUN_STS_ROLE_ARN=...
PORT=3000
```

---

## 📝 部署状态

查看部署状态：
- GitHub Actions: https://github.com/mingxin/zizi-v2/actions
- Vercel Dashboard: https://vercel.com/mingxins-projects/zizi-app
- Render Dashboard: https://dashboard.render.com

---

## 🔄 手动触发部署

如需手动触发：
```bash
git push origin main
```

或在 GitHub Actions 页面点击 "Run workflow"
