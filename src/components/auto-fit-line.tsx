import React, { useRef, useLayoutEffect, useState } from 'react';

interface AutoFitLineProps {
  text: string;
  className?: string;
  maxFontSize?: number;
  minFontSize?: number;
}

export const AutoFitLine: React.FC<AutoFitLineProps> = ({
  text,
  className = '',
  maxFontSize = 17,
  minFontSize = 10,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const computeFit = () => {
      const containerWidth = container.clientWidth;
      if (containerWidth <= 0) return;

      // Reset to max font size to get natural unwrapped scroll width
      textEl.style.fontSize = `${maxFontSize}px`;
      const naturalWidth = textEl.scrollWidth;

      if (naturalWidth <= containerWidth) {
        setFontSize(maxFontSize);
        return;
      }

      // Calculate exact proportional scale to guarantee full visibility
      const scale = (containerWidth - 4) / naturalWidth;
      const targetSize = Math.max(minFontSize, Math.min(maxFontSize, Math.floor(maxFontSize * scale * 10) / 10));

      setFontSize(targetSize);
    };

    computeFit();

    // Recompute on container resize (e.g. screen resize, rotation, zoom)
    const observer = new ResizeObserver(() => {
      computeFit();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [text, maxFontSize, minFontSize]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden text-left">
      <p
        ref={textRef}
        className={className}
        style={{
          fontSize: `${fontSize}px`,
          whiteSpace: 'nowrap',
          display: 'inline-block',
          width: 'auto',
          lineHeight: 1.45,
          letterSpacing: '-0.015em',
        }}
      >
        {text}
      </p>
    </div>
  );
};
