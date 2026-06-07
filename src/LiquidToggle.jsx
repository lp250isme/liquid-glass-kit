import React from 'react';

/**
 * Liquid glass toggle — after jh3y's "cross-browser liquid toggle"
 * (codepen.io/jh3y/pen/bNVWoBW), scaled to iOS switch proportions.
 * Pure CSS transitions (no framer-motion): bouncy knob travel via a
 * linear() spring curve, squash-stretch while pressed, glass inset
 * track with a liquid glow in the checked state.
 *
 * Size/colors via CSS vars (see styles.css):
 *   --lg-toggle-w / --lg-toggle-h / --lg-toggle-pad
 *   --lg-toggle-checked (defaults to --lg-tint)
 */
export default function LiquidToggle({ checked, onChange, disabled, label, className = '', ...props }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            data-checked={checked ? 'true' : 'false'}
            onClick={(e) => {
                // Embedded in clickable rows everywhere — don't double-fire.
                e.stopPropagation();
                if (!disabled) onChange(!checked);
            }}
            className={`lg-toggle ${className}`}
            {...props}
        >
            <span className="lg-toggle__knob" aria-hidden="true" />
        </button>
    );
}
