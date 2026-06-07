import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/**
 * Motion-powered liquid glass controls (require framer-motion >= 11).
 * Import from 'liquid-glass-kit/motion'.
 *
 * All controls are styled by kit CSS classes + `--lg-*` tokens from
 * styles.css — override the tokens to theme them per app.
 */

const cx = (...parts) => parts.filter(Boolean).join(' ');

export const SPRING_SNAPPY = { type: 'spring', stiffness: 520, damping: 36 };

/* ------------------------------------------------------------------ */
/* GlassButton — circular glass button for dark/imagery stages.        */
/* ------------------------------------------------------------------ */
export function GlassButton({ children, onClick, title, disabled, active, className }) {
    return (
        <motion.button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            disabled={disabled}
            whileTap={disabled ? undefined : { scale: 0.88 }}
            className={cx('lg-glass-button glass-media', active && 'lg-glass-button--active', className)}
        >
            {children}
        </motion.button>
    );
}

/* ------------------------------------------------------------------ */
/* Chip — pill toggle for category filters / small toggles.            */
/* ------------------------------------------------------------------ */
export function Chip({ children, active, onClick, className }) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileTap={{ scale: 0.94 }}
            className={cx('lg-chip', active ? 'lg-chip--active' : 'glass-chip', className)}
        >
            {children}
        </motion.button>
    );
}

/* ------------------------------------------------------------------ */
/* Segmented — UISegmentedControl look-alike with a sliding thumb.     */
/* ------------------------------------------------------------------ */
export function Segmented({ options, value, onChange, className }) {
    const group = useId();
    return (
        <div className={cx('lg-segmented glass-chip', className)}>
            {options.map((o) => (
                <motion.button
                    key={o.value}
                    type="button"
                    title={o.title}
                    aria-label={o.title}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onChange(o.value)}
                    className={cx('lg-segmented__item', value === o.value && 'lg-segmented__item--active')}
                >
                    {value === o.value && (
                        <motion.span
                            layoutId={`lg-segment-${group}`}
                            transition={SPRING_SNAPPY}
                            className="lg-segmented__thumb"
                        />
                    )}
                    <span className="lg-segmented__label">{o.label}</span>
                </motion.button>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Stepper — UIStepper-style −/+ control with press-and-hold repeat.   */
/* ------------------------------------------------------------------ */
const MinusIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
);
const PlusIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
);

export function Stepper({ onDecrement, onIncrement, decDisabled, incDisabled, label, className }) {
    return (
        <div role="group" aria-label={label} className={cx('lg-stepper glass-chip', className)}>
            <RepeatButton onFire={onDecrement} disabled={decDisabled} title="Decrease">
                <MinusIcon />
            </RepeatButton>
            <div className="lg-stepper__divider" />
            <RepeatButton onFire={onIncrement} disabled={incDisabled} title="Increase">
                <PlusIcon />
            </RepeatButton>
        </div>
    );
}

function RepeatButton({ onFire, disabled, title, children }) {
    const timer = useRef(null);
    const interval = useRef(null);
    const fireRef = useRef(onFire);
    fireRef.current = onFire;

    const stop = () => {
        if (timer.current) clearTimeout(timer.current);
        if (interval.current) clearInterval(interval.current);
        timer.current = null;
        interval.current = null;
    };

    useEffect(() => stop, []);

    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            disabled={disabled}
            className="lg-stepper__button"
            onPointerDown={(e) => {
                if (disabled) return;
                e.preventDefault();
                fireRef.current();
                timer.current = setTimeout(() => {
                    interval.current = setInterval(() => fireRef.current(), 70);
                }, 420);
            }}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
            onContextMenu={(e) => e.preventDefault()}
        >
            {children}
        </button>
    );
}

/* ------------------------------------------------------------------ */
/* Slider — Jhey's "cross browser liquid slider"                       */
/* (codepen.io/jh3y/pen/qEbYRVg). The thumb is a liquid capsule: a     */
/* white pill at rest; grabbing grows it 1.4x, fades the cover out     */
/* and reveals gooey liquid sloshing inside. A black mask pill run     */
/* through the knockout filter punches a travelling hole in the        */
/* track, and drag speed squash-stretches the capsule.                 */
/* Mount <LiquidSliderDefs /> once near the app root.                  */
/* ------------------------------------------------------------------ */

const CAPSULE = 38; // thumb capsule width (px)
const CAP_H = 24;   // thumb capsule height (px)

/** Jhey's --slider-liquid keyframes as a function of progress. */
const liquidMap = (p) => (p <= 10 ? (p / 10) * 50 : p <= 80 ? 50 : 50 + ((p - 80) / 20) * 50);

/** SVG filters for the liquid slider (mount once near the app root). */
export function LiquidSliderDefs() {
    return (
        <svg className="lg-slider-defs" aria-hidden>
            <defs>
                {/* goo: blur + alpha contrast merges the liquid blobs */}
                <filter id="lq-goo">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -10"
                        result="goo"
                    />
                    <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
                {/* knockout: cut pure-black pixels out of the source */}
                <filter id="lq-knockout" colorInterpolationFilters="sRGB">
                    <feColorMatrix
                        type="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -255 -255 -255 0 1"
                        result="black-pixels"
                    />
                    <feMorphology in="black-pixels" operator="dilate" radius="0.5" result="smoothed" />
                    <feComposite in="SourceGraphic" in2="smoothed" operator="out" />
                </filter>
            </defs>
        </svg>
    );
}

export function Slider({ value, min, max, step = 1, onChange, label, className }) {
    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    // Capsule + mask + fill chase the finger; the liquid inside sloshes
    // on a looser spring chasing the pen's keyframe map.
    const lens = useSpring(pct, { stiffness: 400, damping: 22 });
    const liquid = useSpring(liquidMap(pct), { stiffness: 160, damping: 17 });
    useEffect(() => {
        lens.set(pct);
        liquid.set(liquidMap(pct));
    }, [pct, lens, liquid]);

    const [held, setHeld] = useState(false);
    const [focused, setFocused] = useState(false);
    const grow = useSpring(1, { stiffness: 420, damping: 20 });
    useEffect(() => {
        grow.set(held ? 1.4 : 1);
    }, [held, grow]);

    // Horizontal drag speed (capped at 5) squashes the capsule.
    const delta = useSpring(0, { stiffness: 300, damping: 24 });
    const lastX = useRef(null);

    const scaleX = useTransform([grow, delta], (l) => {
        const [g, d] = l;
        return g <= 1.001 ? g : g + d * 0.05;
    });
    const scaleY = useTransform([grow, delta], (l) => {
        const [g, d] = l;
        return g <= 1.001 ? g : g - d * 0.05;
    });

    const left = useTransform(lens, (p) => `calc((100% - ${CAPSULE}px) * ${p / 100})`);
    const fillWidth = useTransform(
        lens,
        (p) => `calc((100% - ${CAPSULE}px) * ${p / 100} + ${CAPSULE / 2}px)`,
    );
    const liquidX = useTransform(liquid, (l) => `${l - 100}%`);
    const liquidGlow = useTransform(liquid, (l) => Math.min(1, l / 50));

    return (
        <div className={cx('lg-slider', focused && 'lg-slider--focused', className)}>
            {/* Knocked-out track — the black pill cuts a travelling hole. */}
            <div className="lg-slider__stage" style={{ filter: 'url(#lq-knockout)' }}>
                <div className="lg-track lg-slider__track">
                    <motion.div className="lg-fill lg-slider__fill" style={{ width: fillWidth }} />
                </div>
                <motion.div
                    className="lg-slider__mask"
                    style={{ width: CAPSULE, height: CAP_H, y: '-50%', left, scaleX, scaleY }}
                />
            </div>

            {/* The liquid capsule thumb. */}
            <motion.div
                aria-hidden
                className="lg-slider__thumb"
                style={{ width: CAPSULE, height: CAP_H, y: '-50%', left, scaleX, scaleY }}
            >
                {/* glassy shell, revealed while held */}
                <motion.div
                    className="lq-shell lg-slider__layer"
                    animate={{ opacity: held ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                />
                {/* gooey liquid, blurred away at rest (clip-path applies after
                    the blur, so the glow can't bleed past the pill) */}
                <motion.div
                    className="lg-slider__layer lg-slider__liquids"
                    style={{ clipPath: 'inset(0 round 100px)' }}
                    animate={{ filter: held ? 'blur(0px)' : 'blur(6px)' }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="lg-slider__layer" style={{ filter: 'url(#lq-goo)' }}>
                        <div className="lq-liquid-gray lg-slider__layer" />
                        <div className="lq-glow-gray lg-slider__layer" />
                    </div>
                    <div className="lg-slider__layer" style={{ filter: 'url(#lq-goo)' }}>
                        <motion.div className="lq-liquid-fill lg-slider__layer" style={{ x: liquidX }} />
                        <motion.div className="lq-glow-fill lg-slider__layer" style={{ opacity: liquidGlow }} />
                    </div>
                </motion.div>
                {/* resting white pill cover */}
                <motion.div
                    className="lq-cover lg-slider__layer"
                    animate={{ opacity: held ? 0 : 1 }}
                    transition={{ duration: 0.18 }}
                />
            </motion.div>

            <input
                type="range"
                aria-label={label}
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                onPointerDown={(e) => {
                    setHeld(true);
                    lastX.current = e.clientX;
                }}
                onPointerMove={(e) => {
                    if (!held || lastX.current === null) return;
                    delta.set(Math.min(Math.abs(e.clientX - lastX.current), 5));
                    lastX.current = e.clientX;
                }}
                onPointerUp={() => {
                    setHeld(false);
                    delta.set(0);
                    lastX.current = null;
                }}
                onPointerCancel={() => {
                    setHeld(false);
                    delta.set(0);
                    lastX.current = null;
                }}
                onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
                onBlur={() => {
                    setHeld(false);
                    setFocused(false);
                }}
                className="lg-slider__input"
            />
        </div>
    );
}
