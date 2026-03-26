# Zizi 2.0 AI 编码主计划及约束文档

## 第一道防线：模块划分 (Feature-Sliced Design 目录树)
在建库时，我们将强制要求 Claude 按照以下结构创建目录。任何业务逻辑代码都严禁跨 Feature 互相调用。

zizi-app/
├── public/                 # PWA 图标、Manifest
├── src/
│   ├── core/               # 【核心层】全局路由、API 拦截器(双轨制逻辑)、大模型工厂
│   ├── shared/             # 【共享层】通用 UI (Stitch 生成的按钮/抽屉)、OSS 直传工具
│   ├── features/           # 【业务层】严格隔离！
│   │   ├── auth/           # └─ 登录、注册、Token 管理
│   │   ├── photo-word/     # └─ 拍图、调用 Qwen、结果卡片、文字解析
│   │   ├── picture-book/   # └─ 绘本列表、连拍上传、3D景深播放、自动连播
│   │   ├── settings/       # └─ 字库选择、音色切换、API Key 配置
│   │   └── game/           # └─ (二期预留)
│   ├── App.vue (或 tsx)    # 全局 Layout (承载右上角齿轮和底部 Tab)
│   └── main.ts             # 应用入口

## 第二道防线：开发计划里程碑 (Milestones)
在使用 Claude 时，请严格按照以下顺序“发牌”。上一个 Milestone 跑通并 git commit 之前，绝对不要开启下一个。
·里程碑 0：基建与防腐 (创建 Vite 项目，配置 Tailwind，载入 project_context.md，搭建空壳目录)。
·里程碑 1：公共 UI 沉淀 (把 Stitch 生成的纯静态代码，拆解成 shared 里的通用组件，如：大眼睛按钮、全局 Tab、顶部 Header)。
·里程碑 2：账号与路由守卫 (开发 auth 模块，实现全屏登录页，配置未登录强制跳转)。
·里程碑 3：全局设置与存储 (开发 settings 模块，跑通 API Key 的本地化存储逻辑，这关系到后续大模型的调用)。
·里程碑 4：拍图识字 (核心1) (接入设备相机 -> 接通 OSS 上传 -> 联调 Qwen -> 渲染结果页并播放 TTS)。
·里程碑 5：绘本工厂 (核心2) (开发双 Tab 列表 -> 连续拍照逻辑 -> 绘本播放页的 3D Swiper 与定时器轮播机制)。

