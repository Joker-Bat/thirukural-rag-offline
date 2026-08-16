import React, { useRef, useLayoutEffect, useState } from 'react';

interface AutoFitLineProps {
  text: string;
  className?: string;
  color?: string;
}

export const AutoFitLine: React.FC<AutoFitLineProps> = ({
  text,
  className = '',
  color = '#1c1917'
}) => {
  const textMeasureRef = useRef<SVGTextElement | null>(null);
  const [viewBoxWidth, setViewBoxWidth] = useState<number>(360);

  useLayoutEffect(() => {
    if (textMeasureRef.current) {
      try {
        const bbox = textMeasureRef.current.getBBox();
        const measuredWidth = Math.ceil(bbox.width) + 8;
        if (measuredWidth > 0) {
          setViewBoxWidth(Math.max(280, measuredWidth));
        }
      } catch {
        // Fallback estimated width based on character count
        setViewBoxWidth(Math.max(280, text.length * 9.5 + 10));
      }
    }
  }, [text]);

  return (
    <div className={`w-full overflow-visible ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} 22`}
        className="w-full h-auto block overflow-visible select-text"
        preserveAspectRatio="xMinYMid meet"
        style={{ maxHeight: '28px' }}
      >
        <text
          ref={textMeasureRef}
          x="0"
          y="16.5"
          fontFamily="'Noto Serif Tamil', serif"
          fontWeight="700"
          fontSize="14.5"
          fill={color}
          className="select-text tracking-normal"
        >
          {text}
        </text>
      </svg>
    </div>
  );
};
