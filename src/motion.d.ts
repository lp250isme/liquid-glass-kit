import * as React from 'react';

export const SPRING_SNAPPY: { type: 'spring'; stiffness: number; damping: number };

export function GlassButton(props: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}): React.JSX.Element;

export function Chip(props: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}): React.JSX.Element;

export function Segmented<T extends string>(props: {
  options: { value: T; label: React.ReactNode; title?: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}): React.JSX.Element;

export function Stepper(props: {
  onDecrement: () => void;
  onIncrement: () => void;
  decDisabled?: boolean;
  incDisabled?: boolean;
  label?: string;
  className?: string;
}): React.JSX.Element;

/** SVG filters for the liquid slider — mount once near the app root. */
export function LiquidSliderDefs(): React.JSX.Element;

export function Slider(props: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label?: string;
  className?: string;
}): React.JSX.Element;
