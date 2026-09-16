'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if device is mobile to disable custom cursor
    if (window.innerWidth > 768) {
      setIsMobile(false);
    }

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isPointer = window.getComputedStyle(target).cursor === 'pointer';
      const isClickable = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      
      if (isPointer || isClickable || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      {/* Trailing cursor with white border and light blue fill */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? '60px' : '24px',
          height: isHovering ? '60px' : '24px',
          border: '2px solid white',
          backgroundColor: 'rgba(96, 165, 250, 0.4)', /* light blue fill */
          borderRadius: '50%',
          pointerEvents: 'none',
          transform: `translate3d(${position.x - (isHovering ? 30 : 12)}px, ${position.y - (isHovering ? 30 : 12)}px, 0)`,
          transition: 'width 0.2s ease-out, height 0.2s ease-out, transform 0.15s ease-out, background-color 0.2s ease-out',
          zIndex: 9999,
          willChange: 'transform, width, height'
        }}
      />
    </>
  );
}
