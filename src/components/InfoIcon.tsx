import React, { useState } from 'react';

/**
 * B3.4.1 - Info Icon with Tooltip
 * 
 * Displays an ⓘ icon that shows a tooltip on hover (desktop) or tap (mobile).
 * Used for inline explanations of terms like RIR.
 */
interface InfoIconProps {
  /** The tooltip text to display */
  text: string;
  /** Optional custom styling */
  style?: React.CSSProperties;
}

export function InfoIcon({ text, style }: InfoIconProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        marginLeft: '4px',
        cursor: 'help',
        ...style,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="button"
      aria-label={`Info: ${text}`}
    >
      <span
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          color: 'white',
          fontSize: '12px',
          lineHeight: '16px',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        ⓘ
      </span>
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            padding: '8px 12px',
            backgroundColor: '#333',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
        >
          {text}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #333',
            }}
          />
        </div>
      )}
    </span>
  );
}

