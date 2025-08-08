'use client';

import { useEffect, useRef, useCallback } from 'react';

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let confetti: any[] = [];
    const confettiCount = 200;
    const colors = ['#29ABE2', '#FFDA63', '#22c55e', '#ef4444', '#a855f7'];

    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 5 + 4, 
        d: Math.random() * confettiCount,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 3 + 2,
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngle: 0,
        tiltAngleIncrement: Math.random() * 0.07 + 0.05
      });
    }

    let animationFrameId: number;
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confetti.forEach((p, i) => {
        p.vy += 0.05;
        p.y += p.vy;
        p.x += p.vx;
        
        p.tiltAngle += p.tiltAngleIncrement;
        p.tilt = Math.sin(p.tiltAngle - (i / confetti.length) * Math.PI * 2);

        if (p.y > canvas.height || p.x < -10 || p.x > canvas.width + 10) {
          if (i % 5 > 0 || i % 2 === 0) { // re-use confetti
            confetti[i] = { ...p, x: Math.random() * canvas.width, y: -20, tilt: Math.floor(Math.random() * 10) - 10 };
          } else {
             confetti.splice(i, 1);
          }
        }
      });
      
      confetti.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.save();
        ctx.translate(p.x + p.r / 2, p.y + p.r / 2);
        ctx.rotate(p.tilt);
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
        ctx.restore();
      });

      if (confetti.length) {
        animationFrameId = requestAnimationFrame(update);
      } else {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    let timeoutId = setTimeout(() => {
        confetti = [];
    }, 5000)

    animationFrameId = requestAnimationFrame(update);
    
    return () => {
        clearTimeout(timeoutId);
        cancelAnimationFrame(animationFrameId);
    }
  }, []);
  
  useEffect(() => {
      const stopAnimation = draw();
      return stopAnimation;
  }, [draw]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none z-50" />;
}
