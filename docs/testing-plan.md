# Zizi 2.0 自动化测试计划

## 1. 测试目标

确保以下核心功能在生产环境下稳定运行：
- 用户认证（注册/登录/重置密码）
- 拍照识字 AI 管道（图片上传 → LLM识别 → 字库匹配 → 解释生成 → TTS）
- 绘本故事 AI 管道（多页上传 → 故事提取 → 分页生成 → TTS）
- 文件上传服务
- 前端状态管理（Pinia stores）
- API 集成（前后端交互）

## 2. 测试分层

```
┌─────────────────────────────────────┐
│         E2E Tests (少量)             │  ← 关键用户流程
├─────────────────────────────────────┤
│     Integration Tests (适量)         │  ← API 端点 + 数据库
├─────────────────────────────────────┤
│       Unit Tests (大量)              │  ← 服务/函数/Store
└─────────────────────────────────────┘
```

**目标覆盖率：** 核心 Service 层 ≥ 80%，工具函数 100%

## 3. 技术选型

| 层面 | 框架 | 说明 |
|------|------|------|
| 后端单元测试 | Jest + @nestjs/testing | 已有依赖，NestJS 官方方案 |
| 后端E2E测试 | Jest + supertest | 已有依赖，测试真实 HTTP 端点 |
| 前端单元测试 | Vitest + @vue/test-utils | Vite 原生方案，需新增 |
| 前端E2E测试 | 暂不实施 | 后续迭代考虑 Playwright |

## 4. 测试文件结构

### 后端 (`zizi_server/backend/`)

```
src/
  auth/
    auth.service.spec.ts          ← 认证逻辑单元测试
    auth.controller.spec.ts       ← 认证控制器单元测试
  photo-word/
    vocabularies.spec.ts          ← 字库匹配纯函数测试（最高优先级）
    photo-word.service.spec.ts    ← AI 管道单元测试（mock 外部API）
    photo-word.controller.spec.ts ← 控制器测试
  picture-book/
    picture-book.service.spec.ts  ← 绘本管道单元测试
    picture-book.controller.spec.ts
  upload/
    upload.service.spec.ts        ← 文件保存测试
    upload.controller.spec.ts     ← 上传端点测试

test/
  auth.e2e-spec.ts                ← 认证端到端测试
  photo-word.e2e-spec.ts          ← 拍照识字端到端测试
  picture-book.e2e-spec.ts        ← 绘本端到端测试
  app.e2e-spec.ts                 ← 健康检查（已有，需更新）
```

### 前端 (`zizi_app/`)

```
src/
  features/
    photo-word/
      store.spec.ts               ← Pinia store 测试
    picture-book/
      store.spec.ts               ← Pinia store 测试
    settings/
      store.spec.ts               ← 设置 store 测试
  shared/
    utils/
      tts.spec.ts                 ← TTS 工具函数测试
  core/
    http.spec.ts                  ← Axios 拦截器测试
```

## 5. 优先级排序

### P0 — 必须立即完成（阻塞性核心逻辑）

| # | 测试文件 | 被测对象 | 测试点 | 预计用例数 |
|---|---------|---------|--------|-----------|
| 1 | `vocabularies.spec.ts` | `matchVocabulary()` | 分级匹配、降级匹配、兜底匹配、边界输入 | 10-12 |
| 2 | `auth.service.spec.ts` | `AuthService` | 登录成功/失败/被封禁、注册成功/重复手机号、重置密码成功/未注册 | 8-10 |
| 3 | `upload.service.spec.ts` | `UploadService` | 文件保存、目录自动创建、文件名唯一性、扩展名清理 | 5-6 |

### P1 — 核心业务逻辑（一周内完成）

| # | 测试文件 | 被测对象 | 测试点 | 预计用例数 |
|---|---------|---------|--------|-----------|
| 4 | `photo-word.service.spec.ts` | `PhotoWordService.analyze()` | 完整管道成功、LLM返回异常JSON、TTS失败降级、自定义Key透传 | 6-8 |
| 5 | `picture-book.service.spec.ts` | `PictureBookService.createBook()` | 三阶段管道成功、故事提取失败、分页故事含模糊页、TTS部分失败 | 6-8 |
| 6 | `auth.controller.spec.ts` | `AuthController` | 路由映射、DTO验证（无效手机号/短密码）、HTTP状态码 | 6-8 |
| 7 | `photo-word.controller.spec.ts` | `PhotoWordController` | 文件上传、Header提取、JWT守卫 | 4-5 |

### P2 — 前端测试 + 集成测试（两周内完成）

| # | 测试文件 | 被测对象 | 测试点 | 预计用例数 |
|---|---------|---------|--------|-----------|
| 8 | 前端 `store.spec.ts` (photo-word) | Pinia Store | 状态机转换、processImage流程、reset清理 | 6-8 |
| 9 | 前端 `store.spec.ts` (picture-book) | Pinia Store | 拍摄状态管理、submitBook流程、书籍加载 | 8-10 |
| 10 | 前端 `tts.spec.ts` | `playAudio()` | URL播放、浏览器TTS降级 | 4-5 |
| 11 | `auth.e2e-spec.ts` | 认证API | 注册→登录→访问受保护资源 的完整流程 | 4-5 |

### P3 — 端到端流程验证（上线前完成）

| # | 测试文件 | 被测对象 | 测试点 | 预计用例数 |
|---|---------|---------|--------|-----------|
| 12 | `photo-word.e2e-spec.ts` | 拍照识字完整流程 | 上传图片→分析→返回结果（mock AI） | 3-4 |
| 13 | `picture-book.e2e-spec.ts` | 绘本完整流程 | 创建→列表→详情→更新标题 | 4-5 |

## 6. Mock 策略

### 后端 Mock 方案

| 依赖 | Mock 方式 | 说明 |
|------|----------|------|
| `PrismaService` | 手动 mock 对象 | 不依赖真实数据库，返回预设数据 |
| `JwtService` | 手动 mock | `sign()` 返回固定 token |
| `bcrypt` | jest.mock | `compare`/`hash` 返回固定值 |
| `axios` (DashScope) | jest.mock | 模拟 LLM/TTS API 响应 |
| `UploadService` | 手动 mock | `saveFile()` 返回固定 URL |
| `fs` | jest.mock | upload 测试中避免真实文件写入 |

### 外部 AI API Mock 示例

```typescript
// 模拟 DashScope Vision API 响应
const mockDashscopeResponse = {
  data: {
    output: {
      choices: [{
        message: {
          content: JSON.stringify({ candidates: ['苹果', '水果'] })
        }
      }]
    }
  }
};
```

## 7. 前端测试基础设施搭建

### 需要安装的依赖

```bash
cd zizi_app
npm install -D vitest @vue/test-utils happy-dom @pinia/testing
```

### vitest.config.ts 配置

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

### package.json 新增脚本

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## 8. 执行计划时间线

```
第 1 天:  P0 测试全部完成（vocabularies, auth.service, upload.service）
第 2-3 天: P1 后端服务/控制器测试
第 4-5 天: P2 前端 Store/工具测试 + auth e2e
第 6-7 天: P3 完整 e2e 流程测试
```

## 9. 持续集成集成

测试完成后需更新 CI 配置：

### 后端 CI (`zizi_server/backend/`)

GitHub Actions 已有 `npm run test` 步骤。新测试自动纳入。

### 前端 CI (`zizi_app/`)

需在 `.github/workflows/frontend.yml` 中添加：
```yaml
- run: cd zizi_app && npm run test
```

## 10. 风险与注意事项

| 风险 | 缓解措施 |
|------|---------|
| DashScope API 响应格式变化导致管道中断 | 测试覆盖多种响应格式（JSON/非JSON/空响应） |
| `photo-word/store.ts` 存在导入异常 | 先修复代码再写测试 |
| 文件上传测试污染本地文件系统 | 使用 mock，不写入真实磁盘 |
| E2E 测试需要真实数据库 | 使用 PostgreSQL 测试容器或内存 SQLite |
| TTS 音频播放测试依赖浏览器环境 | 使用 `happy-dom` + mock `HTMLAudioElement` |
