import * as React from 'react';

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLElement> {
  /** Element to render. Default: 'div'. */
  as?: React.ElementType;
  /** Corner radius in px, or 'full' for a pill shape. Default: 24. */
  radius?: number | 'full';
  /** Background frost opacity (0–1). Default: 0.08. */
  frost?: number;
  /** Backdrop saturation. Default: 1.4. */
  saturation?: number;
  /** Backdrop brightness. Default: 1.05. */
  brightness?: number;
  /** Displacement scale (negative = refract inward). Default: -110. */
  scale?: number;
  /** Output blur softening the refraction. Default: 0.4. */
  displace?: number;
  /** Refractive edge thickness ratio. Default: 0.07. */
  border?: number;
  /** Per-channel displacement offsets (chromatic aberration). */
  chromatic?: { r: number; g: number; b: number };
  children?: React.ReactNode;
}

export const LiquidGlass: React.ForwardRefExoticComponent<
  LiquidGlassProps & React.RefAttributes<HTMLElement>
>;

export interface LiquidToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

/** Liquid glass switch (jh3y bNVWoBW port, iOS proportions). */
export function LiquidToggle(props: LiquidToggleProps): React.JSX.Element;
