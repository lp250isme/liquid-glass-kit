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
<div className="glass-chip rounded-2xl p-4">{listItem}</div>
<div className="glass-sheet rounded-xl">{dropdown}</div>
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

## Dark mode

由祖先的 `.dark` class（Tailwind 慣例）或 `[data-theme="dark"]` 啟動。要換主題色，覆寫 CSS 變數即可：

```css
:root {
  --lg-ring: rgba(255, 255, 255, 0.6);   /* 高光環 */
  --lg-chip-bg: hsl(210 40% 98% / 0.5);  /* chip 底色 */
}
```

可用變數：`--lg-ring`、`--lg-glow`、`--lg-shadow`、`--lg-chip-bg`、`--lg-sheet-bg`（`--lg-frost` 由元件 prop 控制）。

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

## Credits

- 核心折射技術：[Jhey Tompkins (@jh3y)](https://codepen.io/jh3y) — ["liquid glass" pen](https://codepen.io/jh3y/pen/EajLxJV)（MIT）

## License

MIT
