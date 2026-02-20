import { useEffect, useRef, ReactNode } from "react";

interface PixelDissolveProps {
  active: boolean;
  onComplete?: () => void;
  duration?: number;
  pixelSize?: number;
  children: ReactNode;
}

export default function PixelDissolve({
  active,
  onComplete,
  duration = 800,
  pixelSize = 4,
  children,
}: PixelDissolveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  const runningRef = useRef(false);
  const animIdRef = useRef<number>(0);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) {
      runningRef.current = false;
      cancelAnimationFrame(animIdRef.current);
      const el = containerRef.current;
      if (el) {
        el.style.maskImage = "";
        el.style.webkitMaskImage = "";
        el.style.maskSize = "";
        el.style.webkitMaskSize = "";
        el.style.visibility = "";
      }
      return;
    }

    if (runningRef.current) return;
    runningRef.current = true;

    const el = containerRef.current;
    if (!el) {
      runningRef.current = false;
      onCompleteRef.current?.();
      return;
    }

    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 || h === 0) {
      runningRef.current = false;
      onCompleteRef.current?.();
      return;
    }

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = w;
    maskCanvas.height = h;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) {
      runningRef.current = false;
      onCompleteRef.current?.();
      return;
    }

    const cols = Math.ceil(w / pixelSize);
    const rows = Math.ceil(h / pixelSize);
    const total = cols * rows;

    const indices = Array.from({ length: total }, (_, i) => i);
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const start = performance.now();
    let lastCount = -1;

    const draw = (now: number) => {
      if (!runningRef.current) return;
      const t = Math.min((now - start) / duration, 1);
      const count = Math.floor(t * total);

      if (count !== lastCount) {
        maskCtx.fillStyle = "#fff";
        maskCtx.fillRect(0, 0, w, h);

        for (let i = 0; i < count; i++) {
          const idx = indices[i];
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          maskCtx.clearRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
        }

        const dataUrl = maskCanvas.toDataURL();
        el.style.maskImage = `url(${dataUrl})`;
        el.style.webkitMaskImage = `url(${dataUrl})`;
        el.style.maskSize = "100% 100%";
        el.style.webkitMaskSize = "100% 100%";
        lastCount = count;
      }

      if (t < 1) {
        animIdRef.current = requestAnimationFrame(draw);
      } else {
        el.style.visibility = "hidden";
        runningRef.current = false;
        onCompleteRef.current?.();
      }
    };

    animIdRef.current = requestAnimationFrame(draw);
  }, [active, duration, pixelSize]);

  return (
    <div ref={containerRef} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}
