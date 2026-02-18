import { useEffect, useRef } from "react";

export default function LavaOverworldBg() {
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

    const stars: { x: number; y: number; s: number; b: number; sp: number }[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({ x: Math.random(), y: Math.random() * 0.4, s: 0.5 + Math.random() * 1.2, b: Math.random(), sp: 0.3 + Math.random() * 0.7 });
    }

    const clouds: { x: number; y: number; w: number; h: number; sp: number; op: number }[] = [];
    for (let i = 0; i < 6; i++) {
      clouds.push({ x: Math.random() * 1.5 - 0.25, y: 0.08 + Math.random() * 0.2, w: 0.12 + Math.random() * 0.18, h: 0.015 + Math.random() * 0.025, sp: 0.002 + Math.random() * 0.004, op: 0.06 + Math.random() * 0.1 });
    }

    const embers: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; s: number; bright: number }[] = [];
    function spawnEmber() {
      embers.push({
        x: Math.random(),
        y: 0.45 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.0005,
        vy: -0.0006 - Math.random() * 0.0012,
        life: 0,
        maxLife: 120 + Math.random() * 200,
        s: 1 + Math.random() * 2,
        bright: 0.6 + Math.random() * 0.4,
      });
    }

    const lavaBubbles: { x: number; y: number; r: number; life: number; maxLife: number; phase: number }[] = [];
    function spawnBubble() {
      lavaBubbles.push({
        x: 0.05 + Math.random() * 0.9,
        y: 0.7 + Math.random() * 0.25,
        r: 1.5 + Math.random() * 3,
        life: 0,
        maxLife: 50 + Math.random() * 100,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      time++;

      const skyGrad = ctx!.createLinearGradient(0, 0, 0, H * 0.55);
      skyGrad.addColorStop(0, "#050208");
      skyGrad.addColorStop(0.2, "#0c030f");
      skyGrad.addColorStop(0.4, "#1a0610");
      skyGrad.addColorStop(0.6, "#2d0a0a");
      skyGrad.addColorStop(0.8, "#3a0e06");
      skyGrad.addColorStop(1, "#451508");
      ctx!.fillStyle = skyGrad;
      ctx!.fillRect(0, 0, W, H);

      for (const star of stars) {
        const flicker = 0.3 + 0.7 * Math.sin(time * 0.02 * star.sp + star.b * 15);
        ctx!.fillStyle = `rgba(255,200,160,${star.b * flicker * 0.45})`;
        ctx!.fillRect(Math.floor(star.x * W), Math.floor(star.y * H), Math.ceil(star.s), Math.ceil(star.s));
      }

      for (const cloud of clouds) {
        cloud.x += cloud.sp * 0.001;
        if (cloud.x > 1.3) cloud.x = -0.3;
        const cx = cloud.x * W;
        const cy = cloud.y * H;
        const cw = cloud.w * W;
        const ch = cloud.h * H;
        ctx!.fillStyle = `rgba(100,30,20,${cloud.op})`;
        for (let i = 0; i < 5; i++) {
          const ox = (i - 2) * cw * 0.3;
          const oy = Math.sin(i * 1.2) * ch * 0.5;
          ctx!.beginPath();
          ctx!.ellipse(cx + ox, cy + oy, cw * 0.25, ch, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      const moonX = W * 0.82;
      const moonY = H * 0.1;
      const moonR = Math.min(W, H) * 0.03;
      const moonGlow = ctx!.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 5);
      moonGlow.addColorStop(0, "rgba(255,180,120,0.12)");
      moonGlow.addColorStop(0.5, "rgba(200,100,50,0.04)");
      moonGlow.addColorStop(1, "rgba(150,50,20,0)");
      ctx!.fillStyle = moonGlow;
      ctx!.fillRect(moonX - moonR * 5, moonY - moonR * 5, moonR * 10, moonR * 10);
      ctx!.fillStyle = "rgba(255,200,150,0.7)";
      ctx!.beginPath();
      ctx!.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx!.fill();

      const ambGlow = ctx!.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.4);
      const pulse1 = 0.8 + 0.2 * Math.sin(time * 0.012);
      ambGlow.addColorStop(0, `rgba(255,60,10,${0.08 * pulse1})`);
      ambGlow.addColorStop(1, "rgba(200,30,5,0)");
      ctx!.fillStyle = ambGlow;
      ctx!.fillRect(0, 0, W, H);

      const ambGlow2 = ctx!.createRadialGradient(W * 0.7, H * 0.45, 0, W * 0.7, H * 0.45, W * 0.3);
      const pulse2 = 0.8 + 0.2 * Math.sin(time * 0.015 + 2);
      ambGlow2.addColorStop(0, `rgba(255,50,5,${0.06 * pulse2})`);
      ambGlow2.addColorStop(1, "rgba(150,20,0,0)");
      ctx!.fillStyle = ambGlow2;
      ctx!.fillRect(0, 0, W, H);

      drawVolcano(W * 0.12, H * 0.28, W * 0.10, H * 0.30, "#180808", "#100404");
      drawVolcano(W * 0.32, H * 0.22, W * 0.14, H * 0.38, "#1c0a0a", "#120505");
      drawVolcano(W * 0.58, H * 0.25, W * 0.11, H * 0.32, "#160707", "#0e0303");
      drawVolcano(W * 0.80, H * 0.28, W * 0.12, H * 0.28, "#1a0909", "#110404");
      drawVolcano(W * 0.95, H * 0.30, W * 0.08, H * 0.25, "#140606", "#0c0303");

      drawLavaGlow(W * 0.32, H * 0.22, W * 0.035);
      drawLavaGlow(W * 0.58, H * 0.25, W * 0.025);
      drawLavaGlow(W * 0.12, H * 0.28, W * 0.02);

      const midColors = ["#100404", "#0c0303", "#0e0404"];
      for (let layer = 0; layer < 3; layer++) {
        const baseY = H * (0.38 + layer * 0.04);
        const amp = H * (0.05 - layer * 0.008);
        ctx!.fillStyle = midColors[layer];
        ctx!.beginPath();
        ctx!.moveTo(0, H);
        for (let x = 0; x <= W; x += 2) {
          const nx = x / W;
          const y = baseY - amp * (
            Math.sin(nx * 5 + layer * 3) * 0.5 +
            Math.sin(nx * 12 + layer * 7) * 0.3 +
            Math.sin(nx * 22 + layer) * 0.2
          );
          ctx!.lineTo(x, y);
        }
        ctx!.lineTo(W, H);
        ctx!.closePath();
        ctx!.fill();
      }

      const groundY = H * 0.50;
      const groundGrad = ctx!.createLinearGradient(0, groundY, 0, H);
      groundGrad.addColorStop(0, "#1a0808");
      groundGrad.addColorStop(0.1, "#160606");
      groundGrad.addColorStop(0.25, "#120505");
      groundGrad.addColorStop(0.5, "#0e0404");
      groundGrad.addColorStop(1, "#080202");
      ctx!.fillStyle = groundGrad;
      ctx!.fillRect(0, groundY, W, H - groundY);

      drawRockyTerrain(W, H, groundY);
      drawLavaRivers(W, H, groundY);
      drawLavaPools(W, H);
      drawCracks(W, H, groundY);

      if (time % 4 === 0 && lavaBubbles.length < 12) spawnBubble();
      for (let i = lavaBubbles.length - 1; i >= 0; i--) {
        const b = lavaBubbles[i];
        b.life++;
        if (b.life > b.maxLife) { lavaBubbles.splice(i, 1); continue; }
        const progress = b.life / b.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : progress > 0.8 ? (1 - progress) * 5 : 1;
        const bx = b.x * W + Math.sin(time * 0.04 + b.phase) * 1.5;
        const by = b.y * H;
        if (progress > 0.85) {
          const popR = b.r * (1 + (progress - 0.85) * 8);
          ctx!.fillStyle = `rgba(255,200,50,${alpha * 0.5})`;
          ctx!.fillRect(Math.floor(bx - popR), Math.floor(by - popR), Math.ceil(popR * 2), Math.ceil(popR * 2));
        } else {
          ctx!.fillStyle = `rgba(255,100,20,${alpha * 0.7})`;
          ctx!.beginPath();
          ctx!.arc(bx, by, b.r, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.fillStyle = `rgba(255,180,60,${alpha * 0.4})`;
          ctx!.beginPath();
          ctx!.arc(bx - b.r * 0.3, by - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      if (time % 3 === 0 && embers.length < 25) spawnEmber();
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.x += e.vx + Math.sin(time * 0.025 + i) * 0.00008;
        e.y += e.vy;
        if (e.life > e.maxLife) { embers.splice(i, 1); continue; }
        const progress = e.life / e.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const r = Math.floor(255 * e.bright);
        const g = Math.floor((160 - progress * 100) * e.bright);
        const b = Math.floor((30 - progress * 30) * e.bright);
        const sz = e.s * (1 - progress * 0.5);
        ctx!.fillStyle = `rgba(${r},${g},${b},${alpha * 0.8})`;
        ctx!.fillRect(Math.floor(e.x * W), Math.floor(e.y * H), Math.ceil(sz), Math.ceil(sz));
      }

      drawHeatHaze(W, H, groundY);

      const vigGrad = ctx!.createRadialGradient(W * 0.5, H * 0.5, W * 0.25, W * 0.5, H * 0.5, W * 0.65);
      vigGrad.addColorStop(0, "rgba(0,0,0,0)");
      vigGrad.addColorStop(1, "rgba(0,0,0,0.3)");
      ctx!.fillStyle = vigGrad;
      ctx!.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    function drawVolcano(peakX: number, peakY: number, halfW: number, height: number, baseColor: string, darkColor: string) {
      const baseLeft = peakX - halfW * 1.8;
      const baseRight = peakX + halfW * 1.8;
      const baseY = peakY + height;
      const W = canvas!.width;

      ctx!.fillStyle = baseColor;
      ctx!.beginPath();
      ctx!.moveTo(baseLeft, baseY);
      for (let x = baseLeft; x <= baseRight; x += 2) {
        const t = (x - baseLeft) / (baseRight - baseLeft);
        let y: number;
        if (t < 0.5) {
          y = baseY - height * Math.pow(t * 2, 0.7);
        } else {
          y = baseY - height * Math.pow((1 - t) * 2, 0.7);
        }
        y += Math.sin(x * 0.1) * 2 + Math.sin(x * 0.18) * 1;
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(baseRight, baseY);
      ctx!.closePath();
      ctx!.fill();

      ctx!.fillStyle = darkColor;
      ctx!.beginPath();
      ctx!.moveTo(peakX - halfW * 0.3, peakY + height * 0.1);
      for (let x = peakX - halfW * 0.7; x <= peakX + halfW * 0.7; x += 2) {
        const t = (x - (peakX - halfW * 0.7)) / (halfW * 1.4);
        const y = peakY + height * 0.1 + Math.abs(t - 0.5) * height * 0.35 + Math.sin(x * 0.12) * 1.5;
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(peakX + halfW * 0.3, peakY + height * 0.1);
      ctx!.closePath();
      ctx!.fill();

      for (let i = 0; i < 6; i++) {
        const rx = peakX + (Math.random() - 0.5) * halfW;
        const ry = peakY + height * 0.3 + Math.random() * height * 0.5;
        const rw = 3 + Math.random() * 5;
        const rh = 1 + Math.random() * 2;
        ctx!.fillStyle = `rgba(25,10,10,${0.3 + Math.random() * 0.3})`;
        ctx!.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(rw), Math.ceil(rh));
      }

      if (halfW > W * 0.06) {
        const flowStartY = peakY + height * 0.15;
        const flowEndY = peakY + height * 0.7;
        const flowPulse = 0.6 + 0.4 * Math.sin(time * 0.02 + peakX * 0.01);
        for (let y = flowStartY; y < flowEndY; y += 2) {
          const progress = (y - flowStartY) / (flowEndY - flowStartY);
          const flowW = 2 + progress * 6;
          const wobble = Math.sin(y * 0.04 + time * 0.015 + peakX * 0.1) * (2 + progress * 3);
          const fx = peakX + wobble;
          const alpha = (0.4 + 0.3 * flowPulse) * (1 - progress * 0.4);
          const g = Math.floor(80 + 80 * flowPulse * (1 - progress * 0.5));
          ctx!.fillStyle = `rgba(220,${g},10,${alpha})`;
          ctx!.fillRect(Math.floor(fx - flowW / 2), Math.floor(y), Math.ceil(flowW), 2);
          ctx!.fillStyle = `rgba(255,${Math.floor(150 + 50 * flowPulse)},40,${alpha * 0.5})`;
          ctx!.fillRect(Math.floor(fx - flowW / 4), Math.floor(y), Math.ceil(flowW / 2), 2);
        }
      }
    }

    function drawLavaGlow(x: number, y: number, r: number) {
      const pulse = 0.6 + 0.4 * Math.sin(time * 0.02 + x * 0.01);
      const glow = ctx!.createRadialGradient(x, y, 0, x, y, r * 3 * pulse);
      glow.addColorStop(0, `rgba(255,100,20,${0.2 * pulse})`);
      glow.addColorStop(0.4, `rgba(255,50,10,${0.08 * pulse})`);
      glow.addColorStop(1, "rgba(100,10,0,0)");
      ctx!.fillStyle = glow;
      ctx!.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
      ctx!.fillStyle = `rgba(255,150,40,${0.25 + 0.15 * pulse})`;
      ctx!.beginPath();
      ctx!.ellipse(x, y + 1, r * 0.4, r * 0.2, 0, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawRockyTerrain(W: number, H: number, groundY: number) {
      const rockColors = ["#1e0a0a", "#160707", "#200c0c", "#130505"];
      for (let i = 0; i < 30; i++) {
        const rx = (i * 0.033 + Math.sin(i * 1.7) * 0.015) * W;
        const ry = groundY + (i % 6) * H * 0.07 + Math.sin(i * 2.3) * H * 0.015;
        const rw = 6 + Math.sin(i * 3.1) * 5;
        const rh = 3 + Math.sin(i * 2.7) * 2.5;
        ctx!.fillStyle = rockColors[i % rockColors.length];
        ctx!.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(rw), Math.ceil(rh));
        ctx!.fillStyle = "rgba(50,20,20,0.25)";
        ctx!.fillRect(Math.floor(rx + 1), Math.floor(ry), Math.ceil(rw - 2), 1);
      }

      for (let i = 0; i < 15; i++) {
        const bx = (i * 0.065 + 0.01) * W;
        const by = groundY + Math.sin(i * 1.9) * H * 0.03 + H * 0.015;
        const bw = 12 + Math.sin(i * 2.5) * 8;
        const bh = 6 + Math.sin(i * 1.8) * 4;
        ctx!.fillStyle = "#1a0808";
        ctx!.fillRect(Math.floor(bx), Math.floor(by), Math.ceil(bw), Math.ceil(bh));
        ctx!.fillStyle = "#251010";
        ctx!.fillRect(Math.floor(bx + 1), Math.floor(by), Math.ceil(bw - 2), 2);
        ctx!.fillStyle = "#0d0404";
        ctx!.fillRect(Math.floor(bx + 2), Math.floor(by + bh - 1), Math.ceil(bw - 4), 1);
      }
    }

    function drawLavaRivers(W: number, H: number, groundY: number) {
      const rivers = [
        { x: 0.18, w: 0.015, speed: 0.6, phase: 0 },
        { x: 0.42, w: 0.02, speed: 0.8, phase: 1.5 },
        { x: 0.65, w: 0.018, speed: 0.5, phase: 3.0 },
        { x: 0.85, w: 0.012, speed: 0.7, phase: 4.5 },
      ];

      for (const river of rivers) {
        const startY = groundY + H * 0.01;
        const endY = H * 0.96;
        const sw = river.w * W;

        for (let y = startY; y < endY; y += 2) {
          const progress = (y - startY) / (endY - startY);
          const widen = 1 + progress * 0.6;
          const wobble = Math.sin(y * 0.025 + time * 0.018 * river.speed + river.phase) * 3;
          const cx = river.x * W + wobble;
          const curW = sw * widen;
          const flowAnim = Math.sin(y * 0.04 - time * 0.03 * river.speed + river.phase) * 0.3 + 0.7;
          const r = Math.floor(190 + 65 * flowAnim);
          const g = Math.floor(50 + 70 * flowAnim * (1 - progress * 0.5));
          const b = Math.floor(8 + 15 * flowAnim * (1 - progress));
          const a = (0.45 + 0.25 * flowAnim) * (1 - progress * 0.2);
          ctx!.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx!.fillRect(Math.floor(cx - curW / 2), Math.floor(y), Math.ceil(curW), 2);
          const coreW = curW * 0.35;
          ctx!.fillStyle = `rgba(255,${Math.floor(160 + 60 * flowAnim)},${Math.floor(50 + 30 * flowAnim)},${a * 0.5})`;
          ctx!.fillRect(Math.floor(cx - coreW / 2), Math.floor(y), Math.ceil(coreW), 2);
        }
      }
    }

    function drawLavaPools(W: number, H: number) {
      const pools = [
        { cx: 0.10, cy: 0.72, w: 0.06, h: 0.012 },
        { cx: 0.30, cy: 0.80, w: 0.08, h: 0.015 },
        { cx: 0.52, cy: 0.68, w: 0.05, h: 0.010 },
        { cx: 0.75, cy: 0.76, w: 0.07, h: 0.013 },
        { cx: 0.92, cy: 0.84, w: 0.05, h: 0.010 },
      ];

      for (const pool of pools) {
        const px = pool.cx * W;
        const py = pool.cy * H;
        const pw = pool.w * W;
        const ph = pool.h * H;
        const pulse = 0.7 + 0.3 * Math.sin(time * 0.02 + pool.cx * 10);

        const glow = ctx!.createRadialGradient(px, py, 0, px, py, pw * 1.3);
        glow.addColorStop(0, `rgba(255,70,10,${0.12 * pulse})`);
        glow.addColorStop(1, "rgba(180,25,5,0)");
        ctx!.fillStyle = glow;
        ctx!.fillRect(px - pw * 1.3, py - pw, pw * 2.6, pw * 2);

        ctx!.fillStyle = `rgba(170,35,5,${0.65 * pulse})`;
        ctx!.beginPath();
        ctx!.ellipse(px, py, pw, ph * 2, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = `rgba(240,90,15,${0.5 * pulse})`;
        ctx!.beginPath();
        ctx!.ellipse(px, py, pw * 0.75, ph * 1.4, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = `rgba(255,170,40,${0.3 * pulse})`;
        ctx!.beginPath();
        ctx!.ellipse(px, py, pw * 0.4, ph * 0.8, 0, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawCracks(W: number, H: number, groundY: number) {
      const crackSeeds = [
        { sx: 0.06, sy: 0.56, segments: 5 },
        { sx: 0.22, sy: 0.62, segments: 7 },
        { sx: 0.38, sy: 0.58, segments: 4 },
        { sx: 0.55, sy: 0.65, segments: 6 },
        { sx: 0.70, sy: 0.60, segments: 5 },
        { sx: 0.85, sy: 0.70, segments: 4 },
        { sx: 0.15, sy: 0.78, segments: 3 },
        { sx: 0.48, sy: 0.85, segments: 5 },
        { sx: 0.78, sy: 0.82, segments: 4 },
      ];

      for (const crack of crackSeeds) {
        let cx = crack.sx * W;
        let cy = crack.sy * H;
        const pulse = 0.4 + 0.6 * Math.sin(time * 0.012 + crack.sx * 12);

        for (let s = 0; s < crack.segments; s++) {
          const angle = Math.sin(s * 2.3 + crack.sx * 5) * 0.8 + Math.PI * 0.5;
          const len = 5 + Math.sin(s * 3.1) * 3;
          const nx = cx + Math.cos(angle) * len;
          const ny = cy + Math.sin(angle) * len * 0.3;
          ctx!.strokeStyle = `rgba(255,70,12,${0.2 * pulse})`;
          ctx!.lineWidth = 1.5;
          ctx!.beginPath();
          ctx!.moveTo(Math.floor(cx), Math.floor(cy));
          ctx!.lineTo(Math.floor(nx), Math.floor(ny));
          ctx!.stroke();
          ctx!.strokeStyle = `rgba(255,160,40,${0.08 * pulse})`;
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
      const hazeY = groundY - H * 0.03;
      for (let x = 0; x < W; x += 3) {
        const waveH = 2.5 + Math.sin(x * 0.02 + time * 0.025) * 1.5;
        const alpha = 0.012 + 0.008 * Math.sin(x * 0.01 + time * 0.018);
        ctx!.fillStyle = `rgba(255,90,25,${alpha})`;
        ctx!.fillRect(x, hazeY + Math.sin(x * 0.025 + time * 0.02) * 2, 3, waveH);
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
