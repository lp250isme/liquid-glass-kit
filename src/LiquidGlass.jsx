import React, { useId, useLayoutEffect, useRef, useState, forwardRef } from 'react';

/**
 * Liquid Glass material — port of jh3y's "liquid glass" technique
 * (https://codepen.io/jh3y/pen/EajLxJV) into a reusable React component.
 *
 * How it works:
 *  - A displacement map (data-URI SVG: red/blue gradients over black, with a
 *    blurred inset center) is regenerated whenever the element resizes.
 *  - An inline SVG filter chain displaces the backdrop per RGB channel with
 *    slightly different scales (chromatic aberration), recombines via
 *    screen-blend, then softens with a small blur.
 *  - The element applies `backdrop-filter: url(#id)` — Chromium only.
 *    Safari/Firefox/iOS fall back to a frosted blur+saturate glass.
 *
 * Usage notes:
 *  - One SVG filter per instance: use this for hero surfaces (docks, cards,
 *    modals, pills). For repeated list items, use the `.glass-chip` CSS class
 *    from styles.css instead — frosted blur only, no per-element filter cost.
 *  - Ancestors animating `opacity` (e.g. framer-motion enter/exit) temporarily
 *    change the backdrop root; sampling looks correct again at rest.
 */

// `backdrop-filter: url(#filter)` only renders in Chromium engines.
// iOS Chrome is WebKit (UA "CriOS", no "Chrome/" token) so it correctly falls back.
const supportsSVGBackdrop = (() => {
    if (typeof navigator === 'undefined') return false;
    if (navigator.userAgentData?.brands?.some(b => /Chromium/i.test(b.brand))) return true;
    return /Chrome\//.test(navigator.userAgent);
})();

const buildDisplacementMap = (width, height, radius, border, lightness, alpha, blur) => {
    const borderPx = Math.min(width, height) * (border * 0.5);
    const svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="r" x1="100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/>
    </linearGradient>
    <linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}" fill="black"/>
  <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#r)"/>
  <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#b)" style="mix-blend-mode:difference"/>
  <rect x="${borderPx}" y="${borderPx}" width="${width - borderPx * 2}" height="${height - borderPx * 2}" rx="${radius}" fill="hsl(0 0% ${lightness}% / ${alpha})" style="filter:blur(${blur}px)"/>
</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const CHANNEL_MATRIX = {
    red: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',
    green: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',
    blue: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',
};

const LiquidGlass = forwardRef(function LiquidGlass({
    as: Tag = 'div',
    radius = 24,          // px, or 'full' for pill shape
    frost = 0.08,         // background frost opacity
    saturation = 1.4,
    brightness = 1.05,
    scale = -110,         // displacement scale (negative = refract inward)
    displace = 0.4,       // output blur (softens the refraction)
    border = 0.07,        // refractive edge thickness ratio
    chromatic = { r: 0, g: 6, b: 12 }, // per-channel scale offsets
    className = '',
    style,
    children,
    ...props
}, forwardedRef) {
    const rawId = useId();
    const filterId = `lg-${rawId.replace(/[^a-zA-Z0-9-]/g, '')}`;
    const innerRef = useRef(null);
    const [size, setSize] = useState({ w: 0, h: 0 });

    const setRefs = (el) => {
        innerRef.current = el;
        if (typeof forwardedRef === 'function') forwardedRef(el);
        else if (forwardedRef) forwardedRef.current = el;
    };

    useLayoutEffect(() => {
        if (!supportsSVGBackdrop || !innerRef.current) return;
        const ro = new ResizeObserver(([entry]) => {
            const box = entry.borderBoxSize?.[0];
            const w = Math.round(box ? box.inlineSize : entry.target.offsetWidth);
            const h = Math.round(box ? box.blockSize : entry.target.offsetHeight);
            setSize(prev => (prev.w === w && prev.h === h ? prev : { w, h }));
        });
        ro.observe(innerRef.current);
        return () => ro.disconnect();
    }, []);

    const resolvedRadius = radius === 'full' ? Math.min(size.w, size.h) / 2 : radius;
    const ready = supportsSVGBackdrop && size.w > 0 && size.h > 0;

    const backdrop = ready
        ? `url(#${filterId}) brightness(${brightness}) saturate(${saturation})`
        : `blur(16px) brightness(${brightness}) saturate(${Math.max(saturation, 1.5)})`;

    const mapUri = ready
        ? buildDisplacementMap(size.w, size.h, resolvedRadius, border, 50, 0.93, 11)
        : null;

    return (
        <Tag
            ref={setRefs}
            className={`liquid-glass ${className}`}
            style={{
                ...style,
                borderRadius: radius === 'full' ? 9999 : radius,
                '--lg-frost': frost,
                WebkitBackdropFilter: backdrop,
                backdropFilter: backdrop,
            }}
            {...props}
        >
            {ready && (
                <svg className="liquid-glass__filter" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id={filterId} colorInterpolationFilters="sRGB">
                            <feImage x="0" y="0" width="100%" height="100%" result="map" href={mapUri} />
                            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale={scale + chromatic.r} result="dispRed" />
                            <feColorMatrix in="dispRed" type="matrix" values={CHANNEL_MATRIX.red} result="red" />
                            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale={scale + chromatic.g} result="dispGreen" />
                            <feColorMatrix in="dispGreen" type="matrix" values={CHANNEL_MATRIX.green} result="green" />
                            <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" scale={scale + chromatic.b} result="dispBlue" />
                            <feColorMatrix in="dispBlue" type="matrix" values={CHANNEL_MATRIX.blue} result="blue" />
                            <feBlend in="red" in2="green" mode="screen" result="rg" />
                            <feBlend in="rg" in2="blue" mode="screen" result="output" />
                            <feGaussianBlur in="output" stdDeviation={displace} />
                        </filter>
                    </defs>
                </svg>
            )}
            {children}
        </Tag>
    );
});

export default LiquidGlass;
