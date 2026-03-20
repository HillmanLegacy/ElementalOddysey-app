import { useEffect, useRef } from "react";

const imageCache = new Map<string, HTMLImageElement>();

function preloadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
  });
}

interface SpriteAnimatorProps {
  spriteSheet: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  fps?: number;
  scale?: number;
  loop?: boolean;
  flipX?: boolean;
  reverse?: boolean;
  paused?: boolean;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  preloadSheets?: string[];
  startFrame?: number;
  pauseAtFrame?: number;
  holdFrames?: Record<number, number>;
  anchor?: "top-left" | "bottom-center";
  colorMap?: Record<string, string>;
}

export default function SpriteAnimator({
  spriteSheet,
  frameWidth,
  frameHeight,
  totalFrames,
  fps = 10,
  scale = 3,
  loop = true,
  flipX = false,
  reverse = false,
  paused = false,
  onComplete,
  className = "",
  style,
  preloadSheets,
  startFrame,
  pauseAtFrame,
  holdFrames,
  anchor,
  colorMap,
}: SpriteAnimatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animRef = useRef<number>(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const stoppedRef = useRef(false);
  const mountedSheetRef = useRef("");
  const holdUntilRef = useRef(0);
  const heldFramesRef = useRef<Set<number>>(new Set());

  const propsRef = useRef({ spriteSheet, totalFrames, fps, loop, flipX, reverse, paused, onComplete, pauseAtFrame, holdFrames, frameWidth, frameHeight, scale, colorMap, startFrame });
  propsRef.current = { spriteSheet, totalFrames, fps, loop, flipX, reverse, paused, onComplete, pauseAtFrame, holdFrames, frameWidth, frameHeight, scale, colorMap, startFrame };

  useEffect(() => {
    if (preloadSheets) {
      preloadSheets.forEach(src => preloadImage(src));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    heldFramesRef.current.clear();
    holdUntilRef.current = 0;

    const displayW = Math.round(frameWidth * scale);
    const displayH = Math.round(frameHeight * scale);

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.style.imageRendering = "pixelated";
      canvas.style.display = "block";
      container.appendChild(canvas);
      canvasRef.current = canvas;
    }

    canvas.width = displayW;
    canvas.height = displayH;
    canvas.style.width = displayW + "px";
    canvas.style.height = displayH + "px";

    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
    }
    offscreenRef.current.width = frameWidth;
    offscreenRef.current.height = frameHeight;

    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: false });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctxRef.current = ctx;

    const sheetChanged = mountedSheetRef.current !== spriteSheet;
    mountedSheetRef.current = spriteSheet;

    if (sheetChanged || stoppedRef.current) {
      frameRef.current = startFrame ?? (reverse ? totalFrames - 1 : 0);
      lastTimeRef.current = 0;
    }
    stoppedRef.current = false;

    const initialFrame = frameRef.current;
    let currentImage: HTMLImageElement | null = imageCache.get(spriteSheet) || null;

    const drawFrame = (img: HTMLImageElement, frame: number) => {
      const { frameWidth: cfw, frameHeight: cfh, flipX: cfx, scale: csc, colorMap: cm } = propsRef.current;
      const dw = Math.round(cfw * csc);
      const dh = Math.round(cfh * csc);
      const cols = Math.floor(img.naturalWidth / cfw);
      const col = cols > 0 ? frame % cols : frame;
      const row = cols > 0 ? Math.floor(frame / cols) : 0;

      ctx.clearRect(0, 0, dw, dh);

      if (cm && Object.keys(cm).length > 0) {
        const oc = offscreenRef.current!;
        oc.width = cfw;
        oc.height = cfh;
        const octx = oc.getContext("2d", { willReadFrequently: true })!;
        octx.imageSmoothingEnabled = false;
        octx.clearRect(0, 0, cfw, cfh);
        if (cfx) {
          octx.save();
          octx.scale(-1, 1);
          octx.translate(-cfw, 0);
        }
        octx.drawImage(img, col * cfw, row * cfh, cfw, cfh, 0, 0, cfw, cfh);
        if (cfx) octx.restore();

        const id = octx.getImageData(0, 0, cfw, cfh);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i + 3] < 20) continue;
          const hex = `#${d[i].toString(16).padStart(2,"0")}${d[i+1].toString(16).padStart(2,"0")}${d[i+2].toString(16).padStart(2,"0")}`;
          const rep = cm[hex];
          if (rep) {
            d[i]   = parseInt(rep.slice(1, 3), 16);
            d[i+1] = parseInt(rep.slice(3, 5), 16);
            d[i+2] = parseInt(rep.slice(5, 7), 16);
          }
        }
        octx.putImageData(id, 0, 0);

        ctx.save();
        ctx.drawImage(oc, 0, 0, cfw, cfh, 0, 0, dw, dh);
        ctx.restore();
      } else {
        ctx.save();
        if (cfx) {
          ctx.scale(-1, 1);
          ctx.translate(-dw, 0);
        }
        ctx.drawImage(img, col * cfw, row * cfh, cfw, cfh, 0, 0, dw, dh);
        ctx.restore();
      }
    };

    if (currentImage) {
      drawFrame(currentImage, initialFrame);
    } else {
      preloadImage(spriteSheet).then(img => {
        if (!stoppedRef.current) {
          currentImage = img;
          drawFrame(img, initialFrame);
        }
      });
    }

    const render = (timestamp: number) => {
      if (stoppedRef.current) return;
      if (propsRef.current.paused) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const { totalFrames: tf, fps: f, loop: l, onComplete: oc, pauseAtFrame: paf, reverse: rev } = propsRef.current;
      const interval = 1000 / f;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;

      if (!currentImage) {
        const cached = imageCache.get(propsRef.current.spriteSheet);
        if (cached) currentImage = cached;
      }

      if (holdUntilRef.current > 0) {
        if (timestamp < holdUntilRef.current) {
          animRef.current = requestAnimationFrame(render);
          return;
        }
        holdUntilRef.current = 0;
        lastTimeRef.current = timestamp;
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const actualDelta = timestamp - lastTimeRef.current;

      if (actualDelta >= interval && currentImage) {
        const { holdFrames: hf } = propsRef.current;

        lastTimeRef.current = timestamp - (actualDelta % interval);
        const currentFrame = rev
          ? Math.max(0, Math.min(frameRef.current, tf - 1))
          : Math.min(frameRef.current, tf - 1);
        drawFrame(currentImage, currentFrame);

        if (!rev && paf !== undefined && currentFrame >= paf) {
          stoppedRef.current = true;
          oc?.();
          return;
        }

        if (!rev && hf && hf[currentFrame] !== undefined && !heldFramesRef.current.has(currentFrame)) {
          heldFramesRef.current.add(currentFrame);
          holdUntilRef.current = timestamp + hf[currentFrame];
          animRef.current = requestAnimationFrame(render);
          return;
        }

        if (rev) {
          frameRef.current--;
          if (frameRef.current < 0) {
            if (l) {
              frameRef.current = tf - 1;
            } else {
              frameRef.current = 0;
              stoppedRef.current = true;
              oc?.();
              return;
            }
          }
        } else {
          frameRef.current++;
          if (frameRef.current >= tf) {
            if (l) {
              frameRef.current = propsRef.current.startFrame ?? 0;
              heldFramesRef.current.clear();
            } else {
              frameRef.current = tf - 1;
              stoppedRef.current = true;
              oc?.();
              return;
            }
          }
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      stoppedRef.current = true;
      cancelAnimationFrame(animRef.current);
    };
  }, [spriteSheet, startFrame, frameWidth, frameHeight, scale, reverse]);

  useEffect(() => {
    return () => {
      if (canvasRef.current && containerRef.current) {
        try { containerRef.current.removeChild(canvasRef.current); } catch {}
        canvasRef.current = null;
        ctxRef.current = null;
      }
    };
  }, []);

  const displayW = Math.round(frameWidth * scale);
  const displayH = Math.round(frameHeight * scale);

  const anchorStyle: React.CSSProperties = anchor === "bottom-center"
    ? { position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)" }
    : {};

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: displayW,
        height: displayH,
        overflow: "hidden",
        ...anchorStyle,
        ...(style || {}),
      }}
    />
  );
}
