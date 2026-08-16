import React, { useRef, useLayoutEffect, useState } from 'react';

interface KuralCoupletProps {
  line1: string;
  line2: string;
  className?: string;
}

export const KuralCouplet: React.FC<KuralCoupletProps> = ({
  line1,
  line2,
  className = '',
}) => {
  const line1Ref = useRef<SVGTextElement | null>(null);
  const line2Ref = useRef<SVGTextElement | null>(null);
  const [viewBoxWidth, setViewBoxWidth] = useState<number>(360);

  useLayoutEffect(() => {
    let w1 = 320;
    let w2 = 280;

    if (line1Ref.current) {
      try {
        const bbox1 = line1Ref.current.getBBox();
        if (bbox1.width > 0) w1 = Math.ceil(bbox1.width);
      } catch {
        w1 = Math.max(300, line1.length * 9.5);
      }
    }

    if (line2Ref.current) {
      try {
        const bbox2 = line2Ref.current.getBBox();
        if (bbox2.width > 0) w2 = Math.ceil(bbox2.width);
      } catch {
        w2 = Math.max(240, line2.length * 9.5);
      }
    }

    // Both lines share the exact same coordinate system based on the widest line (Line 1)
    const maxWidth = Math.max(w1, w2) + 10;
    setViewBoxWidth(Math.max(300, maxWidth));
  }, [line1, line2]);

  return (
    <div className={`w-full overflow-visible ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} 48`}
        className="w-full h-auto block overflow-visible select-text"
        preserveAspectRatio="xMinYMid meet"
        style={{ minHeight: '44px', maxHeight: '60px' }}
      >
        {/* Line 1: 4 words, strictly 1 line, exact same font size */}
        <text
          ref={line1Ref}
          x="0"
          y="18"
          fontFamily="'Noto Serif Tamil', serif"
          fontWeight="700"
          fontSize="14.5"
          fill="#1c1917"
          className="select-text"
        >
          {line1}
        </text>

        {/* Line 2: 3 words, strictly 1 line, exact same font size */}
        <text
          ref={line2Ref}
          x="0"
          y="41"
          fontFamily="'Noto Serif Tamil', serif"
          fontWeight="700"
          fontSize="14.5"
          fill="#292524"
          className="select-text"
        >
          {line2}
        </text>
      </svg>
    </div>
  );
};
