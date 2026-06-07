# liquid-glass-kit

Apple Liquid Glass UI materials for React — a refractive `<LiquidGlass>` component built on [jh3y's SVG displacement technique](https://codepen.io/jh3y/pen/EajLxJV), plus frosted-glass CSS materials for everything else.

## Install

```bash
npm i github:lp250isme/liquid-glass-kit
```

## Usage

```jsx
// main.jsx — once
import 'liquid-glass-kit/styles.css';
```

```jsx
import { LiquidGlass } from 'liquid-glass-kit';

// Floating dock
<LiquidGlass radius="full" frost={0.06} className="px-2 py-1.5">
  {tabs}
</LiquidGlass>

// Card
<LiquidGlass radius={28} frost={0.1} className="p-6">
  {content}
</LiquidGlass>
```

```jsx
// Small / repeated elements: use CSS materials, NOT <LiquidGlass>
<div className="glass rounded-full">{floatingButton}</div>       // 基本玻璃（含 press 態）
<div className="glass-media rounded-full">{onDarkStage}</div>    // 深色舞台/圖片上專用
<div className="glass-panel rounded-2xl">{tabBar}</div>          // 主表面（完整 Jhey 陰影棧）
<div className="glass-sheet rounded-t-xl">{bottomSheet}</div>    // 底部面板（易讀優先）
<div className="glass-chip rounded-2xl p-4">{listItem}</div>     // 列表項/小控件
```

```jsx
// 互動控件（需要 framer-motion >= 11）
import { Segmented, Stepper, Slider, LiquidSliderDefs, GlassButton, Chip } from 'liquid-glass-kit/motion';

<LiquidSliderDefs />   {/* Slider 的 SVG 濾鏡，app root 掛一次 */}
<Segmented options={[{value:'a',label:'A'},{value:'b',label:'B'}]} value={v} onChange={setV} />
<Slider value={x} min={0} max={100} onChange={setX} />   {/* jh3y 液態膠囊滑塊 */}
<Stepper onDecrement={dec} onIncrement={inc} />
<GlassButton onClick={fn}>{icon}</GlassButton>
<Chip active={on} onClick={toggle}>標籤</Chip>
```

## `<LiquidGlass>` props

| prop | default | 說明 |
|---|---|---|
| `as` | `'div'` | 渲染的元素 |
| `radius` | `24` | 圓角 px，或 `'full'`（膠囊形） |
| `frost` | `0.08` | 霧面底色不透明度 |
| `saturation` | `1.4` | backdrop 飽和度 |
| `brightness` | `1.05` | backdrop 亮度 |
| `scale` | `-110` | 位移強度（負值向內折射） |
| `displace` | `0.4` | 輸出模糊（柔化折射邊緣） |
| `border` | `0.07` | 折射邊緣厚度比例 |
| `chromatic` | `{r:0,g:6,b:12}` | RGB 各通道位移差（色散強度） |

## Theming（design tokens）

所有材質和控件吃 `--lg-*` design token，kit 內建 iOS 風格的淺/深預設值。深色由祖先 `.dark` class（Tailwind 慣例）或 `[data-theme="dark"]` 啟動；app 在自己的 CSS 重新宣告 token 即可換主題（app 的宣告永遠蓋過 kit 預設，含 `prefers-color-scheme` auto 模式的場景）。

| Token | 用途 |
|---|---|
| `--lg-frost` / `--lg-frost-strong` | 玻璃底色（一般 / 主表面） |
| `--lg-edge` / `--lg-glow` / `--lg-shadow` | 邊緣高光 / 內光暈 / 投影 |
| `--lg-press` | 按下狀態底色 |
| `--lg-sheet-bg` / `--lg-chip-bg` | sheet / chip 底色覆寫 |
| `--lg-label` / `--lg-label2` / `--lg-separator` / `--lg-bg` | 控件文字/結構色 |
| `--lg-tint` | 品牌色（slider fill、focus ring） |
| `--lg-segment` / `--lg-track` / `--lg-knob` / `--lg-liquid-gray` | 控件專用 |

`<LiquidGlass>` 的 frost prop 走獨立的 `--lg-host-frost`（元件內聯），不與上表衝突。

## ⚠️ 使用邊界（重要）

1. **折射只在 Chromium 生效**。`backdrop-filter: url()` Safari/Firefox/iOS（含 iOS Chrome，它是 WebKit）不支援，元件會自動退回 frosted blur 玻璃——一樣好看，只是沒有邊緣折射。不需要你做任何事。
2. **每個 `<LiquidGlass>` 實例帶一個 SVG 濾鏡 + ResizeObserver**。用在主要表面（dock、輸入框、卡片、modal）；列表項、按鈕等重複元素請用 `.glass-chip` / `.glass-sheet`，零濾鏡成本。
3. **祖先在動畫 `opacity` 期間**（如 framer-motion 進出場），backdrop 取樣範圍會暫時改變，動畫結束（opacity 回到 1、transform 移除）就恢復正常。0.2s 級別的進場動畫肉眼幾乎無感。
4. 位移貼圖在元素 resize 時自動重新生成（這是 jh3y 點名的 caveat，元件內建處理）。
5. 玻璃效果需要背景有「東西」可以折射/模糊——純白背景上看不出效果，搭配 mesh gradient 背景最佳。

## Recipes

`recipes/icon-source.html` — 液態玻璃風格 app icon 的 SVG 模板（深淺兩版），用 headless Chrome 渲染成 PNG：

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --screenshot=/tmp/icons.png \
  --window-size=1024,512 --force-device-scale-factor=2 \
  --default-background-color=00000000 --hide-scrollbars \
  "file://$(pwd)/recipes/icon-source.html"
magick /tmp/icons.png -crop 1024x1024+0+0    +repage -resize 512x512 -strip icon.png
magick /tmp/icons.png -crop 1024x1024+1024+0 +repage -resize 512x512 -strip icon-dark.png
```

## Next.js

- 已內建 `'use client'` banner 與 SSR-safe effect，App Router 直接 import 即用
- TypeScript 型別已附（`index.d.ts` / `motion.d.ts`）

## Credits

- 核心折射技術：[Jhey Tompkins (@jh3y)](https://codepen.io/jh3y) — ["liquid glass"](https://codepen.io/jh3y/pen/EajLxJV)（MIT）
- 液態滑塊：jh3y — ["cross browser liquid slider"](https://codepen.io/jh3y/pen/qEbYRVg)（MIT）

## License

MIT
