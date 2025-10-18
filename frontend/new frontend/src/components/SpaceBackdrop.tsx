import React, { useEffect, useRef } from "react";

/**
 * SpaceBackdrop
 * Renders a lightweight animated starfield (canvas) behind a section.
 * - Avoids heavy DOM (single canvas, ~120 stars)
 * - Respects reduced motion preference (static stars)
 * - Auto-resizes on container resize
 */
const SpaceBackdrop: React.FC<{ density?: number; className?: string }> = ({ density = 120, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  interface Star {
    x: number;
    y: number;
    r: number; // radius
    a: number; // alpha
    tw: number; // twinkle speed
    driftX: number;
    driftY: number;
  }

  const init = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    starsRef.current = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.4,
      a: Math.random() * 0.9 + 0.1,
      tw: (Math.random() * 0.6 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
      driftX: (Math.random() - 0.5) * 0.05,
      driftY: (Math.random() - 0.5) * 0.05,
    }));
    draw(ctx, w, h, true);
  };

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, first = false) => {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    for (const s of starsRef.current) {
      if (!reduceMotion && !first) {
        s.x += s.driftX;
        s.y += s.driftY;
        s.a += s.tw * 0.01;
        if (s.a > 1) { s.a = 1; s.tw *= -1; }
        if (s.a < 0.05) { s.a = 0.05; s.tw *= -1; }
        if (s.x < 0) s.x = w;
        if (s.x > w) s.x = 0;
        if (s.y < 0) s.y = h;
        if (s.y > h) s.y = 0;
      }
      const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      grd.addColorStop(0, `rgba(255,255,255,${s.a})`);
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = containerRef.current?.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      init(ctx, width, height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current?.parentElement) ro.observe(containerRef.current.parentElement);

    const animate = () => {
      if (reduceMotion) return; // static if reduced motion
      const parent = containerRef.current?.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      draw(ctx, width, height);
      animationRef.current = requestAnimationFrame(animate);
    };
    if (!reduceMotion) animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      ro.disconnect();
    };
  }, [density, reduceMotion]);

  return (
    <div ref={containerRef} className={"pointer-events-none absolute inset-0 overflow-hidden " + className} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Soft nebula gradients */}
      <div className="absolute -top-40 left-1/3 w-[50rem] h-[50rem] bg-[radial-gradient(circle_at_center,rgba(120,60,255,0.15),transparent_70%)] blur-3xl" />
      <div className="absolute bottom-[-30%] -right-20 w-[45rem] h-[45rem] bg-[radial-gradient(circle_at_center,rgba(0,180,255,0.12),transparent_72%)] blur-3xl" />
    </div>
  );
};

export default SpaceBackdrop;
