import { useEffect, useRef } from 'react';

/**
 * Building wireframe animé via Canvas 2D natif.
 * Isométrique, rotation automatique, particules dorées.
 * Aucune dépendance Three.js / R3F.
 */
export function HeroBuilding3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    let rafId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Particules
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const drawWireframeBuilding = (cx: number, cy: number, rot: number) => {
      const GOLD = '#E7D192';
      const floors = 14;
      const floorH = 18;
      const baseW = 80;
      ctx.save();
      ctx.translate(cx, cy);

      // Perspective isométrique simple
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);

      for (let f = 0; f < floors; f++) {
        const scale = 1 - f * 0.03;
        const w = baseW * scale;
        const h = floorH;
        const y = -f * h;
        const depth = w * 0.4;

        // Face avant
        ctx.beginPath();
        ctx.moveTo(-w / 2 * cos, y - w / 2 * sin);
        ctx.lineTo(w / 2 * cos, y + w / 2 * sin);
        ctx.lineTo(w / 2 * cos, y + h + w / 2 * sin);
        ctx.lineTo(-w / 2 * cos, y + h - w / 2 * sin);
        ctx.closePath();
        ctx.strokeStyle = GOLD;
        ctx.globalAlpha = 0.55 - f * 0.02;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Face côté
        ctx.beginPath();
        ctx.moveTo(w / 2 * cos, y + w / 2 * sin);
        ctx.lineTo(w / 2 * cos + depth * cos, y + w / 2 * sin - depth * 0.5);
        ctx.lineTo(w / 2 * cos + depth * cos, y + h + w / 2 * sin - depth * 0.5);
        ctx.lineTo(w / 2 * cos, y + h + w / 2 * sin);
        ctx.closePath();
        ctx.globalAlpha = 0.3 - f * 0.015;
        ctx.stroke();

        // Fenêtres horizontales
        for (let wx = -2; wx <= 2; wx++) {
          ctx.beginPath();
          const px = wx * (w / 5) * cos;
          const py = y + h * 0.4 + wx * (w / 5) * sin;
          ctx.rect(px - 4, py - 3, 8, 6);
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = GOLD;
          ctx.fill();
        }
      }

      // Antenne
      ctx.beginPath();
      ctx.moveTo(0, -floors * floorH);
      ctx.lineTo(0, -floors * floorH - 50);
      ctx.strokeStyle = GOLD;
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Lumière sommet clignotante
      const pulse = 0.4 + 0.4 * Math.sin(Date.now() * 0.003);
      ctx.beginPath();
      ctx.arc(0, -floors * floorH - 52, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.globalAlpha = pulse;
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      // Particules
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = '#E7D192';
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      // Tour principale (droite, plus grande)
      drawWireframeBuilding(W * 0.72, H * 0.75, angle);

      // Tour secondaire (gauche, plus petite)
      ctx.save();
      ctx.scale(0.55, 0.55);
      drawWireframeBuilding(W * 1.1, H * 1.1, angle + 0.3);
      ctx.restore();

      angle += 0.004;
      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.75 }}
    />
  );
}
