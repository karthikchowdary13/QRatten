'use client';

import React from 'react';

export default function CyberBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mesh-drift {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(18px, -12px) scale(1.04); }
          66%  { transform: translate(-12px, 16px) scale(0.97); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .mesh-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background: 
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(165,180,252,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 90%, rgba(147,197,253,0.24) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(196,181,253,0.12) 0%, transparent 70%),
            #F4F6FF;
        }
        .mesh-blobs {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          animation: mesh-drift 22s ease-in-out infinite;
          background-image: radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
        }
      `}}></style>

      <div className="mesh-bg">
        <div className="mesh-blobs"></div>
      </div>
    </div>
  );
}
