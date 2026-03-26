# Zizi 2.0 Project Context (AI 编程宪法)

## 1. 项目概述
- **产品名称**：Zizi 2.0
- **定位**：面向 3-6 岁儿童的识字与绘本启蒙 PWA 应用。
- **核心功能**：拍图识字、实体绘本拍摄与AI讲故事、游戏识字（二期）。

## 2. 技术栈
- **前端**：Vue3 + Vite + TypeScript + TailwindCSS + PWA
- **后端**：Node.js (Express/Nest) 或 Python (FastAPI)
- **部署架构**：前端 Vercel + 后端 Render + 存储 阿里云 OSS
- **AI & API**：阿里云 Qwen-vl-max (图文识别)、Qwen3-tts-flash (语音合成)

## 3. 架构规范：Feature-Sliced Design (FSD)
绝对禁止将所有业务逻辑堆砌在全局 `views` 或 `components` 中。必须按功能垂直分包：
- `/src/core`: 全局路由、API 拦截器、主题、全局 Store。
- `/src/shared`: 通用 UI 组件 (Button, Modal)、工具函数 (OSS 上传工具)。
- `/src/features/auth`: 登录/注册模块。
- `/src/features/photo-word`: 拍图识字、Qwen 识别结果分析模块。
- `/src/features/picture-book`: 绘本拍摄、大模型生成故事、滑动播放模块。
- `/src/features/settings`: API 双轨制配置 (系统默认 vs 用户自定义)、字库切换。

## 4. API 双轨制与存储策略
- **API 鉴权**：系统支持双轨制。优先读取用户在 `settings` 中填写的第三方 API Key，若无，则使用后端环境变量中的默认 Key。
- **OSS 直传**：所有图片上传必须采用“前端请求后端获取 STS Token -> 前端直传 OSS -> 获取 URL 交给后端”的链路。
### 4.1 Design Tokens (The "Source of Truth")
Whenever there is a conflict between /ui_reference and these tokens, USE THESE TOKENS:
- **Core Radius:** `rounded-3xl` (24px) for cards, `rounded-full` for buttons.
- **Shadow:** `shadow-lg` with a soft spread (e.g., `shadow-orange-200/50`).
- **Typography:** 
  - Titles: `text-2xl font-bold text-warm-gray-800`
  - Body: `text-base text-warm-gray-600`
- **Transitions:** All interactive elements must have `transition-all duration-300 active:scale-95`.

## 5. Vibe Coding 纪律 (对 AI 的要求)
- **不要幻觉**：只实现当前 Prompt 要求的功能，不要擅自增加二期功能（如游戏识字）。
- **原子化修改**：每次只修改/创建当前讨论的单个 `feature` 目录下的文件，不要随意修改 `core` 除非明确要求。
- **防休眠体验**：考虑到 Render 的冷启动，所有涉及后端的 API 交互必须包含详尽的 Loading 状态。

## 6. UI Asset Reference Workflow
- The raw Tailwind UI code generated via Stitch is stored in the `/ui_reference` directory.
- When implementing a feature, the user will tell you which file in `/ui_reference` to use as the visual blueprint.
- Your task is to:
  1. Read the code from the specified file in `/ui_reference`.
  2. Refactor it into modular, clean Vue/React components within the appropriate `src/features/` directory.
  3. Ensure all hardcoded text in the UI is replaced with dynamic props where necessary.