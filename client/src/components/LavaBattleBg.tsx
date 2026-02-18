import { useEffect, useRef } from "react";

export default function LavaBattleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const lavaStreams: { x: number; w: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < 6; i++) {
      lavaStreams.push({
        x: 0.1 + Math.random() * 0.8,
        w: 0.02 + Math.random() * 0.04,
        speed: 0.5 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const lavaBubbles: { x: number; y: number; r: number; speed: number; life: number; maxLife: number; phase: number }[] = [];
    function spawnBubble() {
      const streamIdx = Math.floor(Math.random() * lavaStreams.length);
      const stream = lavaStreams[streamIdx];
      lavaBubbles.push({
        x: stream.x + (Math.random() - 0.5) * stream.w * 3,
        y: 0.65 + Math.random() * 0.3,
        r: 1.5 + Math.random() * 3,
        speed: 0.0003 + Math.random() * 0.0006,
        life: 0,
        maxLife: 60 + Math.random() * 120,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const embers: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; s: number; bright: number }[] = [];
    function spawnEmber() {
      embers.push({
        x: Math.random(),
        y: 0.5 + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: -0.0008 - Math.random() * 0.0015,
        life: 0,
        maxLife: 100 + Math.random() * 200,
        s: 1 + Math.random() * 2.5,
        bright: 0.6 + Math.random() * 0.4,
      });
    }

    const stars: { x: number; y: number; s: number; b: number }[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({ x: Math.random(), y: Math.random() * 0.35, s: 0.5 + Math.random(), b: 0.2 + Math.random() * 0.5 });
    }

    function pxRect(x: number, y: number, w: number, h: number, color: string) {
      ctx!.fillStyle = color;
      ctx!.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
    }

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      time++;

      const skyGrad = ctx!.createLinearGradient(0, 0, 0, H * 0.5);
      skyGrad.addColorStop(0, "#0a0205");
      skyGrad.addColorStop(0.3, "#180508");
      skyGrad.addColorStop(0.5, "#2a0a0a");
      skyGrad.addColorStop(0.7, "#3d1008");
      skyGrad.addColorStop(1, "#4a1505");
      ctx!.fillStyle = skyGrad;
      ctx!.fillRect(0, 0, W, H);

      for (const star of stars) {
        const flicker = 0.3 + 0.7 * Math.sin(time * 0.02 + star.b * 20);
        ctx!.fillStyle = `rgba(255,200,150,${star.b * flicker * 0.5})`;
        ctx!.fillRect(Math.floor(star.x * W), Math.floor(star.y * H), Math.ceil(star.s), Math.ceil(star.s));
      }

      const glowX = W * 0.35;
      const glowY = H * 0.28;
      const glowPulse = 0.8 + 0.2 * Math.sin(time * 0.015);
      const glow = ctx!.createRadialGradient(glowX, glowY, 0, glowX, glowY, W * 0.35 * glowPulse);
      glow.addColorStop(0, "rgba(255,80,20,0.12)");
      glow.addColorStop(0.4, "rgba(200,40,10,0.06)");
      glow.addColorStop(1, "rgba(100,20,5,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, W, H);

      const glow2 = ctx!.createRadialGradient(W * 0.75, H * 0.35, 0, W * 0.75, H * 0.35, W * 0.25);
      glow2.addColorStop(0, "rgba(255,60,10,0.08)");
      glow2.addColorStop(1, "rgba(100,20,5,0)");
      ctx!.fillStyle = glow2;
      ctx!.fillRect(0, 0, W, H);

      drawVolcano(W * 0.28, H * 0.22, W * 0.22, H * 0.35, W, H, "#1a0808", "#120505");
      drawVolcano(W * 0.72, H * 0.26, W * 0.18, H * 0.30, W, H, "#160707", "#0f0404");
      drawVolcano(W * 0.50, H * 0.20, W * 0.14, H * 0.38, W, H, "#1e0a0a", "#140606");

      drawLavaGlow(W * 0.28, H * 0.22, W * 0.04, W, H);
      drawLavaGlow(W * 0.72, H * 0.26, W * 0.03, W, H);
      drawLavaGlow(W * 0.50, H * 0.20, W * 0.035, W, H);

      const midMountainColors = ["#120404", "#0e0303", "#100505"];
      for (let layer = 0; layer < 3; layer++) {
        const baseY = H * (0.38 + layer * 0.04);
        const amp = H * (0.06 - layer * 0.01);
        ctx!.fillStyle = midMountainColors[layer];
        ctx!.beginPath();
        ctx!.moveTo(0, H);
        for (let x = 0; x <= W; x += 2) {
          const nx = x / W;
          const y = baseY - amp * (
            Math.sin(nx * 5 + layer * 3) * 0.5 +
            Math.sin(nx * 11 + layer * 7) * 0.3 +
            Math.sin(nx * 20 + layer) * 0.2
          );
          ctx!.lineTo(x, y);
        }
        ctx!.lineTo(W, H);
        ctx!.closePath();
        ctx!.fill();
      }

      const groundY = H * 0.52;
      const groundGrad = ctx!.createLinearGradient(0, groundY, 0, H);
      groundGrad.addColorStop(0, "#1a0808");
      groundGrad.addColorStop(0.15, "#140606");
      groundGrad.addColorStop(0.3, "#100505");
      groundGrad.addColorStop(0.5, "#0d0404");
      groundGrad.addColorStop(1, "#080202");
      ctx!.fillStyle = groundGrad;
      ctx!.fillRect(0, groundY, W, H - groundY);

      drawRockyTerrain(W, H, groundY);

      for (const stream of lavaStreams) {
        drawLavaStream(stream, W, H, groundY);
      }

      drawLavaPool(W * 0.15, H * 0.72, W * 0.12, H * 0.03, W, H);
      drawLavaPool(W * 0.55, H * 0.78, W * 0.15, H * 0.025, W, H);
      drawLavaPool(W * 0.82, H * 0.68, W * 0.10, H * 0.02, W, H);

      drawCracks(W, H, groundY);

      if (time % 3 === 0 && lavaBubbles.length < 15) spawnBubble();
      for (let i = lavaBubbles.length - 1; i >= 0; i--) {
        const b = lavaBubbles[i];
        b.life++;
        b.y -= b.speed;
        if (b.life > b.maxLife) { lavaBubbles.splice(i, 1); continue; }
        const progress = b.life / b.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : progress > 0.8 ? (1 - progress) * 5 : 1;
        const popPhase = progress > 0.85;
        const currentR = popPhase ? b.r * (1 + (progress - 0.85) * 8) : b.r;
        const bx = b.x * W + Math.sin(time * 0.05 + b.phase) * 2;
        const by = b.y * H;
        if (popPhase) {
          ctx!.fillStyle = `rgba(255,200,50,${alpha * 0.6})`;
          ctx!.fillRect(Math.floor(bx - currentR), Math.floor(by - currentR), Math.ceil(currentR * 2), Math.ceil(currentR * 2));
        } else {
          ctx!.fillStyle = `rgba(255,120,20,${alpha * 0.8})`;
          ctx!.beginPath();
          ctx!.arc(bx, by, currentR, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.fillStyle = `rgba(255,200,80,${alpha * 0.5})`;
          ctx!.beginPath();
          ctx!.arc(bx - currentR * 0.3, by - currentR * 0.3, currentR * 0.4, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      if (time % 4 === 0 && embers.length < 30) spawnEmber();
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.x += e.vx + Math.sin(time * 0.03 + i) * 0.0001;
        e.y += e.vy;
        if (e.life > e.maxLife) { embers.splice(i, 1); continue; }
        const progress = e.life / e.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const r = Math.floor(255 * e.bright);
        const g = Math.floor((180 - progress * 120) * e.bright);
        const b = Math.floor((40 - progress * 40) * e.bright);
        ctx!.fillStyle = `rgba(${r},${g},${b},${alpha * 0.9})`;
        const sz = e.s * (1 - progress * 0.5);
        ctx!.fillRect(Math.floor(e.x * W), Math.floor(e.y * H), Math.ceil(sz), Math.ceil(sz));
      }

      drawHeatHaze(W, H, groundY);

      const vigGrad = ctx!.createRadialGradient(W * 0.5, H * 0.5, W * 0.2, W * 0.5, H * 0.5, W * 0.7);
      vigGrad.addColorStop(0, "rgba(0,0,0,0)");
      vigGrad.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx!.fillStyle = vigGrad;
      ctx!.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    function drawVolcano(peakX: number, peakY: number, halfW: number, height: number, W: number, H: number, baseColor: string, darkColor: string) {
      const baseLeft = peakX - halfW * 1.8;
      const baseRight = peakX + halfW * 1.8;
      const baseY = peakY + height;

      ctx!.fillStyle = baseColor;
      ctx!.beginPath();
      ctx!.moveTo(baseLeft, baseY);

      for (let x = baseLeft; x <= baseRight; x += 2) {
        const t = (x - baseLeft) / (baseRight - baseLeft);
        let y: number;
        if (t < 0.5) {
          const st = t * 2;
          y = baseY - height * Math.pow(st, 0.7);
          y += Math.sin(x * 0.08) * 2 + Math.sin(x * 0.15) * 1;
        } else {
          const st = (1 - t) * 2;
          y = baseY - height * Math.pow(st, 0.7);
          y += Math.sin(x * 0.08) * 2 + Math.sin(x * 0.15) * 1;
        }
        ctx!.lineTo(x, y);
      }

      ctx!.lineTo(baseRight, baseY);
      ctx!.closePath();
      ctx!.fill();

      ctx!.fillStyle = darkColor;
      ctx!.beginPath();
      ctx!.moveTo(peakX - halfW * 0.3, peakY + height * 0.1);
      for (let x = peakX - halfW * 0.8; x <= peakX + halfW * 0.8; x += 2) {
        const t = (x - (peakX - halfW * 0.8)) / (halfW * 1.6);
        const y = peakY + height * 0.1 + Math.abs(t - 0.5) * height * 0.4 + Math.sin(x * 0.1) * 1.5;
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(peakX + halfW * 0.3, peakY + height * 0.1);
      ctx!.closePath();
      ctx!.fill();

      for (let i = 0; i < 8; i++) {
        const rx = peakX + (Math.random() - 0.5) * halfW * 1.2;
        const ry = peakY + height * 0.3 + Math.random() * height * 0.5;
        const rw = 3 + Math.random() * 6;
        const rh = 1 + Math.random() * 2;
        ctx!.fillStyle = `rgba(30,12,12,${0.3 + Math.random() * 0.3})`;
        ctx!.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(rw), Math.ceil(rh));
      }
    }

    function drawLavaGlow(x: number, y: number, r: number, W: number, H: number) {
      const pulse = 0.6 + 0.4 * Math.sin(time * 0.02 + x * 0.01);
      const glow = ctx!.createRadialGradient(x, y, 0, x, y, r * 3 * pulse);
      glow.addColorStop(0, `rgba(255,100,20,${0.25 * pulse})`);
      glow.addColorStop(0.3, `rgba(255,60,10,${0.12 * pulse})`);
      glow.addColorStop(0.6, `rgba(200,30,5,${0.05 * pulse})`);
      glow.addColorStop(1, "rgba(100,10,0,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);

      const craterR = r * 0.5;
      ctx!.fillStyle = `rgba(255,150,40,${0.3 + 0.2 * pulse})`;
      ctx!.beginPath();
      ctx!.ellipse(x, y + 2, craterR, craterR * 0.4, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = `rgba(255,220,80,${0.15 + 0.15 * pulse})`;
      ctx!.beginPath();
      ctx!.ellipse(x, y + 2, craterR * 0.5, craterR * 0.2, 0, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawLavaStream(stream: { x: number; w: number; speed: number; phase: number }, W: number, H: number, groundY: number) {
      const startY = groundY + H * 0.02;
      const endY = H * 0.95;
      const sw = stream.w * W;

      for (let y = startY; y < endY; y += 2) {
        const progress = (y - startY) / (endY - startY);
        const widen = 1 + progress * 0.8;
        const wobble = Math.sin(y * 0.03 + time * 0.02 * stream.speed + stream.phase) * 4;
        const cx = stream.x * W + wobble;
        const curW = sw * widen;

        const flowAnim = Math.sin(y * 0.05 - time * 0.04 * stream.speed + stream.phase) * 0.3 + 0.7;

        const r = Math.floor(200 + 55 * flowAnim);
        const g = Math.floor(60 + 80 * flowAnim * (1 - progress * 0.5));
        const b = Math.floor(10 + 20 * flowAnim * (1 - progress));
        const a = (0.5 + 0.3 * flowAnim) * (1 - progress * 0.3);

        pxRect(cx - curW / 2, y, curW, 2, `rgba(${r},${g},${b},${a})`);

        const coreW = curW * 0.4;
        const coreA = a * 0.6;
        pxRect(cx - coreW / 2, y, coreW, 2, `rgba(255,${Math.floor(180 + 75 * flowAnim)},${Math.floor(60 + 40 * flowAnim)},${coreA})`);
      }
    }

    function drawLavaPool(cx: number, cy: number, w: number, h: number, W: number, H: number) {
      const pulse = 0.7 + 0.3 * Math.sin(time * 0.025 + cx * 0.01);

      const poolGlow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, w * 1.5);
      poolGlow.addColorStop(0, `rgba(255,80,10,${0.15 * pulse})`);
      poolGlow.addColorStop(1, "rgba(200,30,5,0)");
      ctx!.fillStyle = poolGlow;
      ctx!.fillRect(cx - w * 1.5, cy - w, w * 3, w * 2);

      ctx!.fillStyle = `rgba(180,40,5,${0.7 * pulse})`;
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, w, h * 2, 0, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = `rgba(255,100,20,${0.6 * pulse})`;
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, w * 0.8, h * 1.5, 0, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = `rgba(255,180,50,${0.35 * pulse})`;
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, w * 0.5, h, 0, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.fillStyle = `rgba(255,230,100,${0.15 * pulse})`;
      ctx!.beginPath();
      ctx!.ellipse(cx - w * 0.15, cy - h * 0.3, w * 0.2, h * 0.5, 0, 0, Math.PI * 2);
      ctx!.fill();

      for (let i = 0; i < 3; i++) {
        const bx = cx + Math.sin(time * 0.03 + i * 2.1) * w * 0.6;
        const by = cy + Math.cos(time * 0.02 + i * 1.7) * h;
        const br = 1.5 + Math.sin(time * 0.05 + i) * 0.5;
        ctx!.fillStyle = `rgba(255,200,80,${0.5 + 0.3 * Math.sin(time * 0.04 + i)})`;
        ctx!.beginPath();
        ctx!.arc(bx, by, br, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawRockyTerrain(W: number, H: number, groundY: number) {
      const rockColors = ["#1e0a0a", "#160707", "#200c0c", "#120505"];
      for (let i = 0; i < 25; i++) {
        const rx = (i * 0.04 + Math.sin(i * 1.7) * 0.02) * W;
        const ry = groundY + (i % 5) * H * 0.08 + Math.sin(i * 2.3) * H * 0.02;
        const rw = 8 + Math.sin(i * 3.1) * 6;
        const rh = 4 + Math.sin(i * 2.7) * 3;
        const colorIdx = i % rockColors.length;
        pxRect(rx, ry, rw, rh, rockColors[colorIdx]);
        pxRect(rx + 1, ry, rw - 2, 1, `rgba(60,25,25,0.3)`);
      }

      for (let i = 0; i < 12; i++) {
        const bx = (i * 0.08 + 0.02) * W;
        const by = groundY + Math.sin(i * 1.9) * H * 0.04 + H * 0.02;
        const bw = 15 + Math.sin(i * 2.5) * 10;
        const bh = 8 + Math.sin(i * 1.8) * 5;

        pxRect(bx, by, bw, bh, "#1a0808");
        pxRect(bx + 1, by, bw - 2, 2, "#2a1010");
        pxRect(bx + 2, by + bh - 1, bw - 4, 1, "#0d0404");

        const crackX = bx + bw * 0.3 + Math.sin(i) * 3;
        pxRect(crackX, by + 2, 1, bh - 3, `rgba(255,60,10,${0.15 + Math.sin(time * 0.02 + i) * 0.08})`);
      }
    }

    function drawCracks(W: number, H: number, groundY: number) {
      const crackSeeds = [
        { sx: 0.08, sy: 0.58, segments: 6 },
        { sx: 0.35, sy: 0.65, segments: 8 },
        { sx: 0.62, sy: 0.60, segments: 5 },
        { sx: 0.78, sy: 0.72, segments: 7 },
        { sx: 0.45, sy: 0.82, segments: 4 },
        { sx: 0.20, sy: 0.75, segments: 6 },
        { sx: 0.90, sy: 0.62, segments: 5 },
      ];

      for (const crack of crackSeeds) {
        let cx = crack.sx * W;
        let cy = crack.sy * H;
        const pulse = 0.4 + 0.6 * Math.sin(time * 0.015 + crack.sx * 10);

        for (let s = 0; s < crack.segments; s++) {
          const angle = (Math.sin(s * 2.3 + crack.sx * 5) * 0.8) + Math.PI * 0.5;
          const len = 6 + Math.sin(s * 3.1) * 4;
          const nx = cx + Math.cos(angle) * len;
          const ny = cy + Math.sin(angle) * len * 0.3;

          ctx!.strokeStyle = `rgba(255,80,15,${0.25 * pulse})`;
          ctx!.lineWidth = 1.5;
          ctx!.beginPath();
          ctx!.moveTo(Math.floor(cx), Math.floor(cy));
          ctx!.lineTo(Math.floor(nx), Math.floor(ny));
          ctx!.stroke();

          ctx!.strokeStyle = `rgba(255,180,50,${0.12 * pulse})`;
          ctx!.lineWidth = 0.5;
          ctx!.beginPath();
          ctx!.moveTo(Math.floor(cx), Math.floor(cy));
          ctx!.lineTo(Math.floor(nx), Math.floor(ny));
          ctx!.stroke();

          cx = nx;
          cy = ny;
        }
      }
    }

    function drawHeatHaze(W: number, H: number, groundY: number) {
      const hazeY = groundY - H * 0.05;
      for (let x = 0; x < W; x += 3) {
        const waveH = 3 + Math.sin(x * 0.02 + time * 0.03) * 2;
        const alpha = 0.015 + 0.01 * Math.sin(x * 0.01 + time * 0.02);
        ctx!.fillStyle = `rgba(255,100,30,${alpha})`;
        ctx!.fillRect(x, hazeY + Math.sin(x * 0.03 + time * 0.025) * 3, 3, waveH);
      }
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
