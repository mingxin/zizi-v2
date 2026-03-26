# Zizi 2.0 UI 设计规范 (The Single Source of Truth)

> **此文档优先级高于 `ui_reference/` 目录下任何 HTML 文件。**
> 当 ui_reference 与本规范冲突时，以本规范为准。
> 所有 Vue 组件必须引用本规范中定义的 token 和组件模式，禁止在业务代码中硬编码这些值。

---

## 1. 颜色 Token

`ui_reference` 中存在两套色彩体系（Material Design 3 完整 token vs 简化 token），统一采用**简化 token + 必要扩展**方案，在 `tailwind.config.ts` 中作为唯一标准声明：

```ts
colors: {
  // Brand
  'primary':          '#eecd2b',  // 主黄色
  'primary-orange':   '#f59e0b',  // 渐变终止色 / accent
  // Backgrounds
  'bg-light':         '#f8f8f6',
  'bg-dark':          '#221f10',
  // Surface
  'surface':          '#ffffff',
  'surface-tinted':   '#fef9c3',  // 浅黄卡片背景
  // Semantic
  'error':            '#ba1a1a',
  'error-container':  '#ffdad6',
}
```

**文字颜色统一使用 Tailwind 内置 slate 系列（禁止用 ui_reference 中的 `on-surface`、`on-background` 等 MD3 token）：**
- 主标题：`text-slate-900 dark:text-slate-100`
- 正文：`text-slate-800 dark:text-slate-200`
- 次要文字：`text-slate-500 dark:text-slate-400`

---

## 2. 字体

### 字体族（统一裁决）
`ui_reference` 中 01/07 页面缺少中文字体，02 额外加载了 Varela Round。统一方案：

```ts
fontFamily: {
  display: ['Be Vietnam Pro', 'Noto Sans SC', 'sans-serif'],
}
```

- 仅加载 `Be Vietnam Pro`（wght 400/500/700）和 `Noto Sans SC`（wght 400/700），删除 Varela Round
- 全局 `body` 使用 `font-display`
- Material Symbols Outlined 图标字体正常引入

### 字重规范
| 用途 | Class |
|---|---|
| 页面大标题 | `text-2xl font-bold` |
| 卡片标题 / Tab 标签 | `text-sm font-bold tracking-wider` |
| 正文 | `text-base font-medium` |
| 辅助说明 | `text-sm font-medium` |
| 主按钮文字 | `text-xl font-black`（黑体加重，儿童友好）|

---

## 3. 圆角

```ts
borderRadius: {
  DEFAULT: '1rem',   // 16px — 普通卡片内元素
  lg:      '2rem',   // 32px — 卡片容器
  xl:      '3rem',   // 48px — 大卡片
  full:    '9999px', // 圆形按钮、胶囊按钮
}
```

---

## 4. 阴影

```ts
boxShadow: {
  bubbly:       '0 10px 25px -5px rgba(238,205,43,0.4), 0 8px 10px -6px rgba(238,205,43,0.2)',
  'bubbly-sm':  '0 4px 10px -2px rgba(238,205,43,0.5)',
  float:        '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)',
}
```

---

## 5. 交互动效（统一必须）

所有可点击元素必须包含：
```
transition-all duration-300 active:scale-95
```

悬停放大效果（图标/卡片）：
```
hover:scale-105 transition-transform
```

---

## 6. 组件规范

### 6.1 页面顶部导航栏（AppHeader）

**问题：** `ui_reference` 各页面顶部 header 结构不统一——有的有返回按钮，有的有标题，有的用绝对定位，有的用 flex 布局。

**统一方案：** `shared/components/AppHeader.vue`，接受 props：
- `title?: string` — 页面标题（可选）
- `showBack?: boolean` — 是否显示返回按钮（默认 false）
- `showSettings?: boolean` — 是否显示右上角齿轮（默认 false）

**样式规范：**
```
// 容器
class=\"flex items-center justify-between px-5 pt-5 pb-3\"

// 返回按钮（统一样式，裁决 ui_reference 中的差异）
class=\"flex items-center justify-center size-11 bg-white/90 dark:bg-white/10
       backdrop-blur-sm rounded-full shadow-float
       transition-all duration-300 active:scale-95\"
// 图标：arrow_back_ios_new，filled，text-slate-700

// 页面标题
class=\"text-xl font-bold text-slate-900 dark:text-slate-100 tracking-wide\"

// 齿轮按钮（同返回按钮样式）
// 图标：settings，filled
```

### 6.2 主操作按钮（PrimaryButton）

**问题：** `ui_reference` 中主按钮文字色不一致（`text-white` vs `text-slate-900`），阴影写法不一致。

**统一方案：** `shared/components/PrimaryButton.vue`

```
class=\"w-full h-16 rounded-full
       bg-gradient-to-r from-primary to-primary-orange
       shadow-bubbly
       flex items-center justify-center gap-3
       text-slate-900 text-xl font-black    ← 统一用 text-slate-900（深色在渐变上可读性更好）
       border-b-4 border-black/10
       transition-all duration-300 active:scale-95\"
```

### 6.3 底部 Tab 栏（BottomTab）

**问题：** 仅 02 页面有 Tab 栏，但所有非全屏页面都需要。

**统一方案：** `shared/components/BottomTab.vue`，固定在页面底部。

```
// 容器
class=\"flex items-center justify-around px-4 py-2
       bg-white/90 dark:bg-bg-dark/90 backdrop-blur-lg
       border-t border-slate-100 dark:border-slate-800\"

// 激活 Tab
class=\"flex-1 flex flex-col items-center justify-center py-3
       bg-primary/10 rounded-[1.5rem] transition-colors\"
// 图标：filled (FILL 1)，text-slate-900
// 文字：text-sm font-bold tracking-wider text-slate-900

// 非激活 Tab
class=\"flex-1 flex flex-col items-center justify-center py-3
       hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-[1.5rem] transition-colors\"
// 图标：outlined (FILL 0)，text-slate-400
// 文字：text-sm font-bold tracking-wider text-slate-400
```

### 6.4 全局 Loading 遮罩（GlobalLoading）

**Render 冷启动规范（来自 PRD）：** 所有后端接口调用必须有 Loading 遮罩；超过 5 秒文案切换为「AI正在努力苏醒中，请耐心等待哦~」。

`shared/components/GlobalLoading.vue`，全局单例，由 `core/store` 控制显示/隐藏。

```
// 遮罩层：防穿透，覆盖全屏
class="fixed inset-0 z-50 flex flex-col items-center justify-center
       bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-sm"
```

---

## 7. Material Symbols 图标使用规范

**默认使用 filled 风格（`FILL` 1）**，与 ui_reference 主视觉一致：

```css
/* 在全局 CSS 中声明默认值 */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

需要 outlined 风格时，在元素上用 inline style 覆盖：
```html
<span class="material-symbols-outlined" style="font-variation-settings:'FILL' 0">menu_book</span>
```

---

## 8. 背景纹理 / 装饰

统一使用 CSS 渐变光晕，禁止加载外部纹理贴图（如 transparenttextures.com）以保障 PWA 离线能力：

```css
/* 标准页面背景光晕（可选，用于空白感强的页面）*/
.page-glow::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 80% 10%, rgba(238,205,43,0.08) 0%, transparent 40%),
    radial-gradient(circle at 20% 90%, rgba(238,205,43,0.05) 0%, transparent 40%);
  pointer-events: none;
}
```

---

## 9. 差异裁决汇总表

| 差异项 | ui_reference 中的冲突 | 本规范裁决 |
|---|---|---|
| 颜色体系 | MD3 完整 token（01/07）vs 简化 token（02-06）| 统一用简化 token，删除所有 MD3 token |
| 中文字体 | 部分页面缺 Noto Sans SC | 全局加载，列入 font-display |
| 额外字体 | 02 加载 Varela Round | 删除，不使用 |
| 主按钮文字色 | text-white（03）vs text-slate-900（05）| 统一 **text-slate-900** |
| 主按钮阴影 | shadow-xl shadow-primary/30 vs bubbly-shadow | 统一 **shadow-bubbly**（自定义 token）|
| 返回按钮尺寸 | size-10 / size-11 / size-12 混用 | 统一 **size-11** |
| 返回按钮背景 | bg-white/80 / bg-white/90 / bg-surface 混用 | 统一 **bg-white/90 backdrop-blur-sm** |
| 页面标题字号 | text-lg / text-xl / text-2xl 混用 | 统一 **text-xl font-bold** |
| 背景纹理 | 01 加载外部 png 纹理 | 删除，改用 CSS 渐变光晕 |
| 交互动效 | 部分元素缺少 active:scale-95 | 所有可点击元素必须加 |
