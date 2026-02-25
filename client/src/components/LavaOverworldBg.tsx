import { useEffect, useRef } from "react";

type NodeData = { x: number; y: number; type: string; id: number; connections: number[] };

interface LavaOverworldBgProps {
  nodes?: NodeData[];
}

function buildEdgeList(nodes: NodeData[]) {
  const edgeList: { fx: number; fy: number; tx: number; ty: number }[] = [];
  const seen = new Set<string>();
  for (const n of nodes) {
    for (const cid of n.connections) {
      const key = `${Math.min(n.id, cid)}-${Math.max(n.id, cid)}`;
      if (!seen.has(key)) {
        seen.add(key);
        const to = nodes.find(nd => nd.id === cid);
        if (to) edgeList.push({ fx: n.x / 100, fy: n.y / 100, tx: to.x / 100, ty: to.y / 100 });
      }
    }
  }
  return edgeList;
}

export default function LavaOverworldBg({ nodes }: LavaOverworldBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NodeData[]>(nodes || []);
  const edgeListRef = useRef(buildEdgeList(nodes || []));

  useEffect(() => {
    nodesRef.current = nodes || [];
    edgeListRef.current = buildEdgeList(nodes || []);
  }, [nodes]);

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
    for (let i = 0; i < 120; i++) {
      stars.push({ x: Math.random(), y: Math.random() * 0.35, s: 0.5 + Math.random() * 1.5, b: Math.random(), sp: 0.2 + Math.random() * 0.8 });
    }

    const clouds: { x: number; y: number; w: number; h: number; sp: number; op: number; layers: number }[] = [];
    for (let i = 0; i < 10; i++) {
      clouds.push({
        x: Math.random() * 1.5 - 0.25, y: 0.05 + Math.random() * 0.22,
        w: 0.1 + Math.random() * 0.2, h: 0.012 + Math.random() * 0.025,
        sp: 0.001 + Math.random() * 0.004, op: 0.04 + Math.random() * 0.12,
        layers: 4 + Math.floor(Math.random() * 5),
      });
    }

    const embers: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; s: number; bright: number }[] = [];
    function spawnEmber() {
      embers.push({
        x: Math.random(), y: 0.4 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: -0.0005 - Math.random() * 0.0014,
        life: 0, maxLife: 100 + Math.random() * 250,
        s: 1 + Math.random() * 2.5, bright: 0.5 + Math.random() * 0.5,
      });
    }

    const lavaBubbles: { x: number; y: number; r: number; life: number; maxLife: number; phase: number }[] = [];
    function spawnBubble() {
      lavaBubbles.push({
        x: 0.05 + Math.random() * 0.9, y: 0.65 + Math.random() * 0.3,
        r: 1 + Math.random() * 3, life: 0, maxLife: 40 + Math.random() * 120,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const seed = (x: number) => { const v = Math.sin(x * 127.1 + 311.7) * 43758.5453; return Math.abs(v - Math.floor(v)); };
    const hash = (x: number, y: number) => {
      const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return Math.abs(v - Math.floor(v));
    };

    function drawSky(W: number, H: number) {
      const skyGrad = ctx!.createLinearGradient(0, 0, 0, H * 0.5);
      skyGrad.addColorStop(0, "#030108");
      skyGrad.addColorStop(0.12, "#080310");
      skyGrad.addColorStop(0.25, "#120510");
      skyGrad.addColorStop(0.4, "#1e0808");
      skyGrad.addColorStop(0.55, "#2d0a06");
      skyGrad.addColorStop(0.7, "#3a0e04");
      skyGrad.addColorStop(0.85, "#4a1508");
      skyGrad.addColorStop(1, "#551a0a");
      ctx!.fillStyle = skyGrad;
      ctx!.fillRect(0, 0, W, H);

      for (const star of stars) {
        const flicker = 0.2 + 0.8 * Math.sin(time * 0.018 * star.sp + star.b * 20);
        const alpha = star.b * flicker * 0.5;
        if (alpha < 0.03) continue;
        const r = 255, g = 180 + Math.floor(star.b * 40), b = 140 + Math.floor(star.b * 30);
        ctx!.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        const sx = Math.floor(star.x * W), sy = Math.floor(star.y * H), ss = Math.ceil(star.s);
        ctx!.fillRect(sx, sy, ss, ss);
        if (star.s > 1.2 && alpha > 0.2) {
          ctx!.fillStyle = `rgba(${r},${g},${b},${alpha * 0.15})`;
          ctx!.fillRect(sx - 1, sy, ss + 2, ss);
          ctx!.fillRect(sx, sy - 1, ss, ss + 2);
        }
      }
    }

    function drawClouds(W: number, H: number) {
      for (const cloud of clouds) {
        cloud.x += cloud.sp * 0.001;
        if (cloud.x > 1.4) cloud.x = -0.35;
        const cx = cloud.x * W, cy = cloud.y * H;
        const cw = cloud.w * W, ch = cloud.h * H;
        for (let i = 0; i < cloud.layers; i++) {
          const ox = (i - cloud.layers / 2) * cw * 0.22;
          const oy = Math.sin(i * 1.5 + cloud.x * 3) * ch * 0.6;
          const pulse = 0.8 + 0.2 * Math.sin(time * 0.008 + i + cloud.x * 5);
          ctx!.fillStyle = `rgba(90,25,15,${cloud.op * pulse})`;
          ctx!.beginPath();
          ctx!.ellipse(cx + ox, cy + oy, cw * 0.2 + Math.sin(i * 2) * cw * 0.05, ch * (0.8 + Math.sin(i) * 0.3), 0, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.fillStyle = `rgba(140,40,20,${cloud.op * 0.3 * pulse})`;
          ctx!.beginPath();
          ctx!.ellipse(cx + ox, cy + oy - ch * 0.2, cw * 0.12, ch * 0.4, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawMoon(W: number, H: number) {
      const moonX = W * 0.82, moonY = H * 0.08;
      const moonR = Math.min(W, H) * 0.032;
      const g1 = ctx!.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR * 8);
      g1.addColorStop(0, "rgba(255,160,100,0.1)");
      g1.addColorStop(0.3, "rgba(220,80,30,0.04)");
      g1.addColorStop(0.6, "rgba(150,40,10,0.015)");
      g1.addColorStop(1, "rgba(80,10,0,0)");
      ctx!.fillStyle = g1;
      ctx!.fillRect(moonX - moonR * 8, moonY - moonR * 8, moonR * 16, moonR * 16);
      ctx!.fillStyle = "rgba(255,190,140,0.65)";
      ctx!.beginPath();
      ctx!.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = "rgba(255,220,180,0.3)";
      ctx!.beginPath();
      ctx!.arc(moonX - moonR * 0.15, moonY - moonR * 0.1, moonR * 0.6, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.fillStyle = "rgba(200,130,80,0.2)";
      ctx!.beginPath();
      ctx!.arc(moonX + moonR * 0.25, moonY + moonR * 0.2, moonR * 0.25, 0, Math.PI * 2);
      ctx!.fill();
    }

    function drawAmbientGlow(W: number, H: number) {
      const glows = [
        { x: 0.15, y: 0.45, r: 0.35, base: 0.07, speed: 0.01, color: [255, 50, 5] },
        { x: 0.5, y: 0.38, r: 0.4, base: 0.06, speed: 0.013, color: [255, 70, 10] },
        { x: 0.78, y: 0.42, r: 0.3, base: 0.05, speed: 0.016, color: [255, 40, 5] },
        { x: 0.35, y: 0.7, r: 0.25, base: 0.08, speed: 0.009, color: [255, 80, 15] },
        { x: 0.65, y: 0.75, r: 0.28, base: 0.06, speed: 0.012, color: [255, 60, 8] },
      ];
      for (const g of glows) {
        const pulse = 0.7 + 0.3 * Math.sin(time * g.speed + g.x * 10);
        const grad = ctx!.createRadialGradient(g.x * W, g.y * H, 0, g.x * W, g.y * H, g.r * W);
        grad.addColorStop(0, `rgba(${g.color[0]},${g.color[1]},${g.color[2]},${g.base * pulse})`);
        grad.addColorStop(0.6, `rgba(${g.color[0]},${Math.floor(g.color[1] * 0.5)},${g.color[2]},${g.base * 0.3 * pulse})`);
        grad.addColorStop(1, `rgba(${Math.floor(g.color[0] * 0.5)},${Math.floor(g.color[1] * 0.2)},0,0)`);
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, W, H);
      }
    }

    function drawVolcano(peakX: number, peakY: number, halfW: number, height: number, baseColor: string, darkColor: string, detail: number) {
      const W = canvas!.width;
      const baseLeft = peakX - halfW * 2;
      const baseRight = peakX + halfW * 2;
      const baseY = peakY + height;

      ctx!.fillStyle = baseColor;
      ctx!.beginPath();
      ctx!.moveTo(baseLeft, baseY);
      for (let x = baseLeft; x <= baseRight; x += 1) {
        const t = (x - baseLeft) / (baseRight - baseLeft);
        let y: number;
        if (t < 0.5) {
          y = baseY - height * Math.pow(t * 2, 0.65);
        } else {
          y = baseY - height * Math.pow((1 - t) * 2, 0.65);
        }
        y += Math.sin(x * 0.08) * 2.5 + Math.sin(x * 0.17) * 1.2 + Math.sin(x * 0.33) * 0.6;
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(baseRight, baseY);
      ctx!.closePath();
      ctx!.fill();

      ctx!.fillStyle = darkColor;
      ctx!.beginPath();
      ctx!.moveTo(peakX - halfW * 0.35, peakY + height * 0.08);
      for (let x = peakX - halfW * 0.8; x <= peakX + halfW * 0.8; x += 1) {
        const t = (x - (peakX - halfW * 0.8)) / (halfW * 1.6);
        const y = peakY + height * 0.08 + Math.abs(t - 0.5) * height * 0.4 + Math.sin(x * 0.1) * 1.5;
        ctx!.lineTo(x, y);
      }
      ctx!.lineTo(peakX + halfW * 0.35, peakY + height * 0.08);
      ctx!.closePath();
      ctx!.fill();

      for (let i = 0; i < detail; i++) {
        const rx = peakX + (seed(i + peakX) - 0.5) * halfW * 1.4;
        const ry = peakY + height * 0.25 + seed(i * 3 + peakX) * height * 0.55;
        const rw = 2 + seed(i * 7) * 6;
        const rh = 1 + seed(i * 11) * 3;
        ctx!.fillStyle = `rgba(30,12,12,${0.2 + seed(i * 5) * 0.35})`;
        ctx!.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(rw), Math.ceil(rh));
        ctx!.fillStyle = `rgba(60,20,10,${0.08 + seed(i * 13) * 0.12})`;
        ctx!.fillRect(Math.floor(rx + 1), Math.floor(ry - 1), Math.ceil(rw - 2), 1);
      }

      for (let i = 0; i < Math.floor(detail * 0.5); i++) {
        const sx = peakX + (seed(i * 17 + peakX) - 0.5) * halfW * 1.2;
        const sy = peakY + height * 0.15 + seed(i * 19 + peakX) * height * 0.6;
        const sw = 1 + seed(i * 23) * 3;
        const sh = 1;
        ctx!.fillStyle = `rgba(80,30,15,${0.12 + seed(i * 29) * 0.15})`;
        ctx!.fillRect(Math.floor(sx), Math.floor(sy), Math.ceil(sw), Math.ceil(sh));
      }

      if (halfW > W * 0.05) {
        const flowCount = halfW > W * 0.1 ? 3 : 2;
        for (let f = 0; f < flowCount; f++) {
          const flowStartY = peakY + height * 0.12;
          const flowEndY = peakY + height * 0.75;
          const flowPulse = 0.5 + 0.5 * Math.sin(time * 0.018 + peakX * 0.01 + f * 2.1);
          const flowOffset = (f - (flowCount - 1) / 2) * halfW * 0.25;

          for (let y = flowStartY; y < flowEndY; y += 1.5) {
            const progress = (y - flowStartY) / (flowEndY - flowStartY);
            const flowW = 1.5 + progress * 5;
            const wobble = Math.sin(y * 0.035 + time * 0.012 + peakX * 0.1 + f * 1.5) * (1.5 + progress * 4);
            const fx = peakX + flowOffset + wobble;
            const alpha = (0.35 + 0.35 * flowPulse) * (1 - progress * 0.5);
            const g = Math.floor(70 + 90 * flowPulse * (1 - progress * 0.5));
            ctx!.fillStyle = `rgba(210,${g},8,${alpha})`;
            ctx!.fillRect(Math.floor(fx - flowW / 2), Math.floor(y), Math.ceil(flowW), 2);
            ctx!.fillStyle = `rgba(255,${Math.floor(140 + 60 * flowPulse)},35,${alpha * 0.5})`;
            ctx!.fillRect(Math.floor(fx - flowW / 4), Math.floor(y), Math.ceil(flowW / 2), 1.5);
          }
        }

        const glowPulse = 0.6 + 0.4 * Math.sin(time * 0.015 + peakX * 0.01);
        const g = ctx!.createRadialGradient(peakX, peakY, 0, peakX, peakY, halfW * 2 * glowPulse);
        g.addColorStop(0, `rgba(255,100,20,${0.18 * glowPulse})`);
        g.addColorStop(0.3, `rgba(255,50,10,${0.08 * glowPulse})`);
        g.addColorStop(0.7, `rgba(180,20,0,${0.02 * glowPulse})`);
        g.addColorStop(1, "rgba(100,10,0,0)");
        ctx!.fillStyle = g;
        ctx!.fillRect(peakX - halfW * 2, peakY - halfW, halfW * 4, halfW * 3);
      }
    }

    function drawMidgroundTerrain(W: number, H: number) {
      const layers = [
        { baseY: 0.36, amp: 0.055, color: "#110505", freq: [4, 10, 20, 35] },
        { baseY: 0.39, amp: 0.045, color: "#0e0404", freq: [5, 13, 25, 40] },
        { baseY: 0.42, amp: 0.04, color: "#0c0303", freq: [6, 15, 28, 42] },
        { baseY: 0.44, amp: 0.035, color: "#0a0202", freq: [7, 18, 32, 45] },
      ];
      for (const layer of layers) {
        const baseY = H * layer.baseY;
        const amp = H * layer.amp;
        ctx!.fillStyle = layer.color;
        ctx!.beginPath();
        ctx!.moveTo(0, H);
        for (let x = 0; x <= W; x += 1) {
          const nx = x / W;
          const y = baseY - amp * (
            Math.sin(nx * layer.freq[0]) * 0.4 +
            Math.sin(nx * layer.freq[1] + 1.2) * 0.3 +
            Math.sin(nx * layer.freq[2] + 2.5) * 0.2 +
            Math.sin(nx * layer.freq[3]) * 0.1
          );
          ctx!.lineTo(x, y);
        }
        ctx!.lineTo(W, H);
        ctx!.closePath();
        ctx!.fill();
      }
    }

    function drawGround(W: number, H: number) {
      const groundY = H * 0.48;
      const groundGrad = ctx!.createLinearGradient(0, groundY, 0, H);
      groundGrad.addColorStop(0, "#1c0909");
      groundGrad.addColorStop(0.08, "#180707");
      groundGrad.addColorStop(0.2, "#140606");
      groundGrad.addColorStop(0.4, "#100505");
      groundGrad.addColorStop(0.6, "#0c0404");
      groundGrad.addColorStop(0.8, "#0a0303");
      groundGrad.addColorStop(1, "#070202");
      ctx!.fillStyle = groundGrad;
      ctx!.fillRect(0, groundY, W, H - groundY);

      for (let x = 0; x < W; x += 1) {
        const nx = x / W;
        const edgeNoise =
          Math.sin(nx * 25) * 2 +
          Math.sin(nx * 50 + 1.3) * 1 +
          Math.sin(nx * 100 + 0.7) * 0.5;
        const ey = groundY + edgeNoise;
        ctx!.fillStyle = `rgba(20,8,8,${0.6 + Math.sin(nx * 40) * 0.2})`;
        ctx!.fillRect(x, Math.floor(ey), 1, 3);
        ctx!.fillStyle = `rgba(35,12,8,${0.3 + Math.sin(nx * 60) * 0.15})`;
        ctx!.fillRect(x, Math.floor(ey) - 1, 1, 1);
      }
    }

    function drawPathNetwork(W: number, H: number) {
      const edgeList = edgeListRef.current;
      const currentNodes = nodesRef.current;
      if (edgeList.length === 0) return;
      for (const edge of edgeList) {
        const fx = edge.fx * W, fy = edge.fy * H;
        const tx = edge.tx * W, ty = edge.ty * H;
        const dx = tx - fx, dy = ty - fy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(Math.floor(dist / 1.5), 20);
        const perpX = -dy / dist, perpY = dx / dist;
        const curve = hash(edge.fx * 100, edge.fy * 100) * 8 - 4;

        const pathWidth = 9;
        const innerWidth = 5;

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const bend = Math.sin(t * Math.PI) * curve;
          const px = fx + dx * t + perpX * bend;
          const py = fy + dy * t + perpY * bend;

          const wobble = Math.sin(t * 15 + edge.fx * 20) * 0.8;
          const wx = px + perpX * wobble;
          const wy = py + perpY * wobble;

          ctx!.fillStyle = "rgba(8,3,3,0.7)";
          ctx!.fillRect(Math.floor(wx - pathWidth / 2) - 1, Math.floor(wy) + 1, Math.ceil(pathWidth) + 2, 2);

          ctx!.fillStyle = "rgba(50,22,12,0.55)";
          ctx!.fillRect(Math.floor(wx - pathWidth / 2), Math.floor(wy), Math.ceil(pathWidth), 2);

          ctx!.fillStyle = "rgba(70,32,18,0.45)";
          ctx!.fillRect(Math.floor(wx - innerWidth / 2), Math.floor(wy), Math.ceil(innerWidth), 2);

          if (i % 3 === 0) {
            const crackOff = (hash(t * 100, edge.fx * 200) - 0.5) * pathWidth * 0.8;
            ctx!.fillStyle = `rgba(180,60,15,${0.06 + 0.04 * Math.sin(time * 0.015 + t * 10)})`;
            ctx!.fillRect(Math.floor(wx + crackOff - 1), Math.floor(wy), 2, 1.5);
          }

          if (i % 5 === 0) {
            const side = (i % 2 === 0) ? 1 : -1;
            const bx = wx + perpX * side * (pathWidth / 2 + 1 + hash(i, edge.fx * 50) * 3);
            const by = wy + perpY * side * (pathWidth / 2 + 1);
            const bw = 2 + hash(i * 7, edge.fy * 30) * 4;
            const bh = 1.5 + hash(i * 11, edge.fx * 40) * 2;
            ctx!.fillStyle = `rgba(25,10,8,${0.4 + hash(i * 13, 0) * 0.3})`;
            ctx!.fillRect(Math.floor(bx), Math.floor(by), Math.ceil(bw), Math.ceil(bh));
          }
        }
      }

      if (currentNodes.length > 0) {
        for (const n of currentNodes) {
          const nx = (n.x / 100) * W, ny = (n.y / 100) * H;
          const r = n.type === "boss" ? 14 : n.type === "hut" ? 12 : 10;

          ctx!.fillStyle = "rgba(5,2,2,0.6)";
          ctx!.beginPath();
          ctx!.ellipse(nx, ny + 2, r + 3, (r + 3) * 0.4, 0, 0, Math.PI * 2);
          ctx!.fill();

          ctx!.fillStyle = "rgba(35,15,10,0.5)";
          ctx!.beginPath();
          ctx!.ellipse(nx, ny, r + 2, (r + 2) * 0.35, 0, 0, Math.PI * 2);
          ctx!.fill();

          ctx!.fillStyle = "rgba(55,25,15,0.35)";
          ctx!.beginPath();
          ctx!.ellipse(nx, ny, r, r * 0.3, 0, 0, Math.PI * 2);
          ctx!.fill();

          if (n.type === "boss" || n.type === "hut" || n.type === "rest") {
            const glowPulse = 0.5 + 0.5 * Math.sin(time * 0.02 + n.x * 0.1);
            const gc = n.type === "boss" ? [255, 40, 10] : n.type === "hut" ? [255, 180, 80] : [100, 200, 255];
            const glow = ctx!.createRadialGradient(nx, ny, 0, nx, ny, r * 2);
            glow.addColorStop(0, `rgba(${gc[0]},${gc[1]},${gc[2]},${0.08 * glowPulse})`);
            glow.addColorStop(1, `rgba(${gc[0]},${gc[1]},${gc[2]},0)`);
            ctx!.fillStyle = glow;
            ctx!.fillRect(nx - r * 2, ny - r * 2, r * 4, r * 4);
          }
        }
      }
    }

    function drawRockyTerrain(W: number, H: number, groundY: number) {
      const rockColors = ["#1e0a0a", "#160707", "#200c0c", "#130505", "#1a0808", "#180909"];
      for (let i = 0; i < 60; i++) {
        const rx = seed(i * 1.7) * W;
        const ry = groundY + seed(i * 2.3) * (H - groundY) * 0.85;
        const rw = 3 + seed(i * 3.1) * 8;
        const rh = 2 + seed(i * 2.7) * 4;
        ctx!.fillStyle = rockColors[i % rockColors.length];
        ctx!.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(rw), Math.ceil(rh));
        ctx!.fillStyle = `rgba(50,20,15,${0.15 + seed(i * 5) * 0.15})`;
        ctx!.fillRect(Math.floor(rx + 1), Math.floor(ry), Math.ceil(rw - 2), 1);
        ctx!.fillStyle = `rgba(10,4,4,${0.2 + seed(i * 7) * 0.2})`;
        ctx!.fillRect(Math.floor(rx), Math.floor(ry + rh - 1), Math.ceil(rw), 1);
      }

      for (let i = 0; i < 25; i++) {
        const bx = seed(i * 11 + 0.5) * W;
        const by = groundY + seed(i * 13 + 0.3) * (H - groundY) * 0.7 + 5;
        const bw = 10 + seed(i * 17) * 14;
        const bh = 5 + seed(i * 19) * 6;
        ctx!.fillStyle = "#1a0808";
        ctx!.fillRect(Math.floor(bx), Math.floor(by), Math.ceil(bw), Math.ceil(bh));
        ctx!.fillStyle = "#251010";
        ctx!.fillRect(Math.floor(bx + 1), Math.floor(by), Math.ceil(bw - 2), 2);
        ctx!.fillStyle = "#0d0404";
        ctx!.fillRect(Math.floor(bx + 2), Math.floor(by + bh - 1), Math.ceil(bw - 4), 1);
        if (bw > 14) {
          ctx!.fillStyle = "rgba(40,16,10,0.2)";
          ctx!.fillRect(Math.floor(bx + bw * 0.3), Math.floor(by + 2), 1, Math.ceil(bh - 3));
          ctx!.fillRect(Math.floor(bx + bw * 0.6), Math.floor(by + 1), 1, Math.ceil(bh - 2));
        }
      }

      for (let i = 0; i < 8; i++) {
        const cx = seed(i * 37) * W;
        const cy = groundY + 15 + seed(i * 41) * (H - groundY) * 0.5;
        const cw = Math.max(4, 15 + seed(i * 43) * 25);
        const ch = Math.max(3, 8 + seed(i * 47) * 12);
        ctx!.fillStyle = "#120606";
        ctx!.beginPath();
        ctx!.ellipse(cx, cy, cw / 2, ch / 2, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = "#1a0a0a";
        ctx!.beginPath();
        ctx!.ellipse(cx, cy - ch * 0.15, cw * 0.4, ch * 0.35, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = "#0a0303";
        ctx!.beginPath();
        ctx!.ellipse(cx + cw * 0.1, cy + ch * 0.2, cw * 0.3, ch * 0.2, 0, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function drawLavaRivers(W: number, H: number, groundY: number) {
      const rivers = [
        { x: 0.12, w: 0.018, speed: 0.55, phase: 0, amp: 5 },
        { x: 0.28, w: 0.012, speed: 0.7, phase: 1.2, amp: 3 },
        { x: 0.42, w: 0.022, speed: 0.65, phase: 2.5, amp: 6 },
        { x: 0.58, w: 0.014, speed: 0.8, phase: 3.8, amp: 4 },
        { x: 0.72, w: 0.02, speed: 0.5, phase: 5.0, amp: 5 },
        { x: 0.88, w: 0.015, speed: 0.6, phase: 6.2, amp: 4 },
      ];

      for (const river of rivers) {
        const startY = groundY + H * 0.005;
        const endY = H * 0.97;
        const sw = river.w * W;

        const bankGrad = ctx!.createLinearGradient(river.x * W - sw * 2, 0, river.x * W + sw * 2, 0);
        bankGrad.addColorStop(0, "rgba(30,10,5,0)");
        bankGrad.addColorStop(0.3, "rgba(30,10,5,0.15)");
        bankGrad.addColorStop(0.5, "rgba(50,15,5,0.1)");
        bankGrad.addColorStop(0.7, "rgba(30,10,5,0.15)");
        bankGrad.addColorStop(1, "rgba(30,10,5,0)");

        for (let y = startY; y < endY; y += 1.5) {
          const progress = (y - startY) / (endY - startY);
          const widen = 1 + progress * 0.7;
          const wobble = Math.sin(y * 0.02 + time * 0.015 * river.speed + river.phase) * river.amp;
          const cx = river.x * W + wobble;
          const curW = sw * widen;

          ctx!.fillStyle = "rgba(25,8,4,0.25)";
          ctx!.fillRect(Math.floor(cx - curW * 0.9), Math.floor(y), Math.ceil(curW * 1.8), 2);

          const flowAnim = Math.sin(y * 0.035 - time * 0.025 * river.speed + river.phase) * 0.35 + 0.65;
          const r = Math.floor(180 + 75 * flowAnim);
          const g = Math.floor(40 + 80 * flowAnim * (1 - progress * 0.5));
          const b = Math.floor(5 + 18 * flowAnim * (1 - progress));
          const a = (0.4 + 0.3 * flowAnim) * (1 - progress * 0.25);
          ctx!.fillStyle = `rgba(${r},${g},${b},${a})`;
          ctx!.fillRect(Math.floor(cx - curW / 2), Math.floor(y), Math.ceil(curW), 2);

          const coreW = curW * 0.3;
          ctx!.fillStyle = `rgba(255,${Math.floor(150 + 70 * flowAnim)},${Math.floor(40 + 35 * flowAnim)},${a * 0.45})`;
          ctx!.fillRect(Math.floor(cx - coreW / 2), Math.floor(y), Math.ceil(coreW), 1.5);
        }
      }
    }

    function drawLavaPools(W: number, H: number) {
      const pools = [
        { cx: 0.08, cy: 0.70, w: 0.055, h: 0.012 },
        { cx: 0.22, cy: 0.78, w: 0.07, h: 0.014 },
        { cx: 0.35, cy: 0.65, w: 0.045, h: 0.010 },
        { cx: 0.48, cy: 0.82, w: 0.08, h: 0.016 },
        { cx: 0.55, cy: 0.58, w: 0.04, h: 0.009 },
        { cx: 0.68, cy: 0.74, w: 0.065, h: 0.013 },
        { cx: 0.78, cy: 0.88, w: 0.06, h: 0.012 },
        { cx: 0.90, cy: 0.68, w: 0.05, h: 0.011 },
        { cx: 0.15, cy: 0.90, w: 0.04, h: 0.009 },
        { cx: 0.62, cy: 0.92, w: 0.05, h: 0.010 },
      ];

      for (const pool of pools) {
        const px = pool.cx * W, py = pool.cy * H;
        const pw = pool.w * W, ph = pool.h * H;
        const pulse = 0.6 + 0.4 * Math.sin(time * 0.018 + pool.cx * 12);

        const glow = ctx!.createRadialGradient(px, py, 0, px, py, pw * 1.8);
        glow.addColorStop(0, `rgba(255,60,8,${0.1 * pulse})`);
        glow.addColorStop(0.5, `rgba(200,30,5,${0.04 * pulse})`);
        glow.addColorStop(1, "rgba(120,15,0,0)");
        ctx!.fillStyle = glow;
        ctx!.fillRect(px - pw * 1.8, py - pw * 1.5, pw * 3.6, pw * 3);

        ctx!.fillStyle = "rgba(20,8,5,0.5)";
        ctx!.beginPath();
        ctx!.ellipse(px, py + 1, pw + 2, ph * 2.5, 0, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(160,30,4,${0.6 * pulse})`;
        ctx!.beginPath();
        ctx!.ellipse(px, py, pw, ph * 2, 0, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(220,70,10,${0.45 * pulse})`;
        ctx!.beginPath();
        ctx!.ellipse(px, py, pw * 0.7, ph * 1.4, 0, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = `rgba(255,150,35,${0.25 * pulse})`;
        ctx!.beginPath();
        ctx!.ellipse(px, py, pw * 0.35, ph * 0.7, 0, 0, Math.PI * 2);
        ctx!.fill();

        const surface = Math.sin(time * 0.03 + pool.cx * 8);
        if (surface > 0.3) {
          ctx!.fillStyle = `rgba(255,200,80,${(surface - 0.3) * 0.3})`;
          const sx = px + Math.sin(time * 0.02 + pool.cy * 5) * pw * 0.3;
          ctx!.fillRect(Math.floor(sx - 1), Math.floor(py - ph * 0.3), 2, 1);
        }
      }
    }

    function drawCracks(W: number, H: number, groundY: number) {
      const crackSeeds = [
        { sx: 0.04, sy: 0.54, segments: 6, dir: 0.3 },
        { sx: 0.18, sy: 0.60, segments: 8, dir: 0.8 },
        { sx: 0.25, sy: 0.72, segments: 5, dir: -0.2 },
        { sx: 0.33, sy: 0.56, segments: 7, dir: 0.5 },
        { sx: 0.45, sy: 0.64, segments: 9, dir: -0.4 },
        { sx: 0.52, sy: 0.55, segments: 6, dir: 0.7 },
        { sx: 0.60, sy: 0.70, segments: 5, dir: -0.1 },
        { sx: 0.68, sy: 0.58, segments: 8, dir: 0.4 },
        { sx: 0.75, sy: 0.80, segments: 6, dir: -0.5 },
        { sx: 0.82, sy: 0.62, segments: 7, dir: 0.6 },
        { sx: 0.90, sy: 0.75, segments: 5, dir: -0.3 },
        { sx: 0.12, sy: 0.85, segments: 4, dir: 0.2 },
        { sx: 0.40, sy: 0.88, segments: 6, dir: -0.6 },
        { sx: 0.70, sy: 0.90, segments: 5, dir: 0.1 },
        { sx: 0.55, sy: 0.78, segments: 7, dir: -0.8 },
      ];

      for (const crack of crackSeeds) {
        let cx = crack.sx * W;
        let cy = crack.sy * H;
        const pulse = 0.3 + 0.7 * Math.sin(time * 0.01 + crack.sx * 15);

        for (let s = 0; s < crack.segments; s++) {
          const angle = crack.dir + Math.sin(s * 2.1 + crack.sx * 6) * 0.9 + Math.PI * 0.5;
          const len = 4 + Math.sin(s * 2.8 + crack.sy * 4) * 3;
          const nx = cx + Math.cos(angle) * len;
          const ny = cy + Math.sin(angle) * len * 0.35;

          ctx!.strokeStyle = `rgba(255,60,8,${0.18 * pulse})`;
          ctx!.lineWidth = 1.5;
          ctx!.beginPath();
          ctx!.moveTo(Math.floor(cx), Math.floor(cy));
          ctx!.lineTo(Math.floor(nx), Math.floor(ny));
          ctx!.stroke();

          ctx!.strokeStyle = `rgba(255,140,35,${0.06 * pulse})`;
          ctx!.lineWidth = 0.5;
          ctx!.beginPath();
          ctx!.moveTo(Math.floor(cx), Math.floor(cy));
          ctx!.lineTo(Math.floor(nx), Math.floor(ny));
          ctx!.stroke();

          if (s % 2 === 0 && crack.segments > 4) {
            const bAngle = angle + (s % 2 === 0 ? 0.7 : -0.7);
            const bLen = 2 + Math.sin(s * 3.5) * 1.5;
            const bx = cx + Math.cos(bAngle) * bLen;
            const by = cy + Math.sin(bAngle) * bLen * 0.3;
            ctx!.strokeStyle = `rgba(200,50,8,${0.1 * pulse})`;
            ctx!.lineWidth = 0.8;
            ctx!.beginPath();
            ctx!.moveTo(Math.floor(cx), Math.floor(cy));
            ctx!.lineTo(Math.floor(bx), Math.floor(by));
            ctx!.stroke();
          }

          cx = nx;
          cy = ny;
        }
      }
    }

    function drawSmoke(W: number, H: number) {
      const smokeSources = [
        { x: 0.32, y: 0.22 },
        { x: 0.58, y: 0.25 },
        { x: 0.12, y: 0.28 },
        { x: 0.80, y: 0.28 },
      ];
      for (const src of smokeSources) {
        for (let i = 0; i < 4; i++) {
          const t = ((time * 0.3 + i * 30 + src.x * 100) % 120) / 120;
          const sx = src.x * W + Math.sin(t * Math.PI * 3 + src.x * 10) * 8;
          const sy = src.y * H - t * H * 0.12;
          const alpha = t < 0.2 ? t * 5 : t > 0.7 ? (1 - t) / 0.3 : 1;
          const r = 3 + t * 10;
          ctx!.fillStyle = `rgba(60,25,15,${0.04 * alpha * (1 - t)})`;
          ctx!.beginPath();
          ctx!.arc(sx, sy, r, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.fillStyle = `rgba(40,15,8,${0.025 * alpha * (1 - t)})`;
          ctx!.beginPath();
          ctx!.arc(sx + r * 0.3, sy - r * 0.2, r * 0.7, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawHeatHaze(W: number, H: number, groundY: number) {
      const hazeY = groundY - H * 0.04;
      for (let x = 0; x < W; x += 2) {
        const waveH = 2 + Math.sin(x * 0.015 + time * 0.02) * 2;
        const alpha = 0.01 + 0.008 * Math.sin(x * 0.008 + time * 0.015);
        ctx!.fillStyle = `rgba(255,80,20,${alpha})`;
        ctx!.fillRect(x, hazeY + Math.sin(x * 0.02 + time * 0.018) * 2.5, 2, waveH);
      }
      for (let x = 0; x < W; x += 4) {
        const w2 = 1.5 + Math.sin(x * 0.025 + time * 0.012 + 1.5) * 1;
        const alpha2 = 0.006 + 0.004 * Math.sin(x * 0.012 + time * 0.01);
        ctx!.fillStyle = `rgba(255,120,40,${alpha2})`;
        ctx!.fillRect(x, hazeY - H * 0.02 + Math.sin(x * 0.03 + time * 0.015) * 1.5, 3, w2);
      }
    }

    function drawBubbles(W: number, H: number) {
      if (time % 3 === 0 && lavaBubbles.length < 16) spawnBubble();
      for (let i = lavaBubbles.length - 1; i >= 0; i--) {
        const b = lavaBubbles[i];
        b.life++;
        if (b.life > b.maxLife) { lavaBubbles.splice(i, 1); continue; }
        const progress = b.life / b.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : progress > 0.8 ? (1 - progress) * 5 : 1;
        const bx = b.x * W + Math.sin(time * 0.035 + b.phase) * 1.5;
        const by = b.y * H;
        if (progress > 0.85) {
          const popR = b.r * (1 + (progress - 0.85) * 10);
          ctx!.fillStyle = `rgba(255,180,40,${alpha * 0.4})`;
          ctx!.fillRect(Math.floor(bx - popR), Math.floor(by - popR), Math.ceil(popR * 2), Math.ceil(popR * 2));
        } else {
          ctx!.fillStyle = `rgba(255,90,15,${alpha * 0.65})`;
          ctx!.beginPath();
          ctx!.arc(bx, by, b.r, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.fillStyle = `rgba(255,160,50,${alpha * 0.35})`;
          ctx!.beginPath();
          ctx!.arc(bx - b.r * 0.3, by - b.r * 0.3, b.r * 0.35, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawEmbers(W: number, H: number) {
      if (time % 2 === 0 && embers.length < 35) spawnEmber();
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.x += e.vx + Math.sin(time * 0.02 + i * 0.7) * 0.00006;
        e.y += e.vy;
        if (e.life > e.maxLife) { embers.splice(i, 1); continue; }
        const progress = e.life / e.maxLife;
        const alpha = progress < 0.1 ? progress * 10 : progress > 0.7 ? (1 - progress) / 0.3 : 1;
        const r = Math.floor(255 * e.bright);
        const g = Math.floor((150 - progress * 100) * e.bright);
        const b = Math.floor((25 - progress * 25) * e.bright);
        const sz = e.s * (1 - progress * 0.6);
        ctx!.fillStyle = `rgba(${r},${g},${b},${alpha * 0.75})`;
        ctx!.fillRect(Math.floor(e.x * W), Math.floor(e.y * H), Math.ceil(sz), Math.ceil(sz));
        if (sz > 1.5) {
          ctx!.fillStyle = `rgba(255,200,80,${alpha * 0.15})`;
          ctx!.fillRect(Math.floor(e.x * W) - 1, Math.floor(e.y * H) - 1, Math.ceil(sz) + 2, Math.ceil(sz) + 2);
        }
      }
    }

    function drawVignette(W: number, H: number) {
      const vigGrad = ctx!.createRadialGradient(W * 0.5, H * 0.5, W * 0.2, W * 0.5, H * 0.5, W * 0.7);
      vigGrad.addColorStop(0, "rgba(0,0,0,0)");
      vigGrad.addColorStop(0.7, "rgba(0,0,0,0.12)");
      vigGrad.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx!.fillStyle = vigGrad;
      ctx!.fillRect(0, 0, W, H);
    }

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      time++;

      drawSky(W, H);
      drawClouds(W, H);
      drawMoon(W, H);
      drawAmbientGlow(W, H);

      drawVolcano(W * 0.05, H * 0.30, W * 0.06, H * 0.22, "#160707", "#0e0303", 5);
      drawVolcano(W * 0.20, H * 0.24, W * 0.12, H * 0.35, "#1a0808", "#100404", 10);
      drawVolcano(W * 0.38, H * 0.20, W * 0.15, H * 0.40, "#1c0a0a", "#120505", 14);
      drawVolcano(W * 0.60, H * 0.23, W * 0.11, H * 0.33, "#180808", "#0f0404", 10);
      drawVolcano(W * 0.78, H * 0.26, W * 0.13, H * 0.30, "#1a0909", "#110404", 12);
      drawVolcano(W * 0.94, H * 0.28, W * 0.08, H * 0.26, "#150606", "#0c0303", 6);

      drawSmoke(W, H);
      drawMidgroundTerrain(W, H);
      drawGround(W, H);
      drawRockyTerrain(W, H, H * 0.48);
      drawLavaRivers(W, H, H * 0.48);
      drawLavaPools(W, H);
      drawCracks(W, H, H * 0.48);
      drawPathNetwork(W, H);
      drawBubbles(W, H);
      drawEmbers(W, H);
      drawHeatHaze(W, H, H * 0.48);
      drawVignette(W, H);

      animId = requestAnimationFrame(draw);
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
